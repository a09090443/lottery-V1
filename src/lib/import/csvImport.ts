/**
 * CSV Import Workflow
 * CSV 匯入工作流程
 */

import { parseCSVFile, csvToObjects } from './csvParser';
import { validateHeaders, validateCSVData, ParticipantCSVRow } from './csvValidator';
import { createParticipant } from '../data/participants';
import { addParticipantToEvent } from '../data/eventParticipants';
import { DataError } from '../data/events';

/**
 * CSV 匯入結果
 */
export interface CSVImportResult {
  success: boolean;
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errors: ImportError[];
}

/**
 * 匯入錯誤
 */
export interface ImportError {
  rowIndex?: number;
  type: 'header' | 'validation' | 'duplicate' | 'database';
  message: string;
}

/**
 * CSV 匯入選項
 */
export interface CSVImportOptions {
  eventId: string; // 要匯入的活動 ID
  skipDuplicates?: boolean; // 是否跳過重複的參與者（預設 true）
}

/**
 * 匯入參與者 CSV 檔案
 * @param file - CSV 檔案
 * @param options - 匯入選項
 * @returns 匯入結果
 */
export async function importParticipantsCSV(file: File, options: CSVImportOptions): Promise<CSVImportResult> {
  const errors: ImportError[] = [];
  let importedCount = 0;
  let skippedCount = 0;

  try {
    // 1. 解析 CSV 檔案
    const parsed = await parseCSVFile(file);

    if (parsed.rows.length === 0) {
      return {
        success: false,
        totalRows: 0,
        importedCount: 0,
        skippedCount: 0,
        errors: [{ type: 'validation', message: 'CSV 檔案沒有資料' }],
      };
    }

    // 2. 驗證標題列
    const headerValidation = validateHeaders(parsed.headers);
    if (!headerValidation.isValid) {
      headerValidation.errors.forEach((error) => {
        errors.push({ type: 'header', message: error });
      });

      return {
        success: false,
        totalRows: parsed.rows.length,
        importedCount: 0,
        skippedCount: 0,
        errors,
      };
    }

    // 3. 轉換為物件陣列
    const data = csvToObjects<Record<string, string>>(parsed);

    // 4. 驗證資料
    const validation = await validateCSVData(data, options.eventId);

    // 記錄驗證錯誤
    validation.invalidRows.forEach((invalid) => {
      errors.push({
        rowIndex: invalid.rowIndex,
        type: 'validation',
        message: `第 ${invalid.rowIndex} 列：${invalid.errors.join(', ')}`,
      });
    });

    // 記錄重複錯誤
    validation.duplicateRows.forEach((duplicate) => {
      const error: ImportError = {
        rowIndex: duplicate.rowIndex,
        type: 'duplicate',
        message: `第 ${duplicate.rowIndex} 列：${duplicate.reason}`,
      };
      errors.push(error);

      if (options.skipDuplicates ?? true) {
        skippedCount++;
      }
    });

    // 5. 匯入有效的參與者
    for (const row of validation.validRows) {
      try {
        // 建立參與者
        const participant = await createParticipant({
          name: row.name,
          employeeId: row.employeeId,
          nationalId: row.nationalId,
          email: row.email,
          phone: row.phone,
        });

        // 加入活動
        await addParticipantToEvent(options.eventId, participant.id);

        importedCount++;
      } catch (error) {
        errors.push({
          type: 'database',
          message: `建立參與者失敗：${error instanceof Error ? error.message : '未知錯誤'}`,
        });
      }
    }

    return {
      success: errors.filter((e) => e.type !== 'duplicate').length === 0,
      totalRows: parsed.rows.length,
      importedCount,
      skippedCount,
      errors,
    };
  } catch (error) {
    throw new DataError('CSV 匯入失敗', error instanceof Error ? error : undefined);
  }
}

/**
 * 驗證 CSV 檔案（不實際匯入）
 * @param file - CSV 檔案
 * @param eventId - 活動 ID
 * @returns 驗證結果與預覽資料
 */
export async function previewParticipantsCSV(
  file: File,
  eventId: string
): Promise<{
  isValid: boolean;
  totalRows: number;
  validRows: ParticipantCSVRow[];
  errors: ImportError[];
}> {
  try {
    // 解析 CSV
    const parsed = await parseCSVFile(file);

    if (parsed.rows.length === 0) {
      return {
        isValid: false,
        totalRows: 0,
        validRows: [],
        errors: [{ type: 'validation', message: 'CSV 檔案沒有資料' }],
      };
    }

    // 驗證標題
    const headerValidation = validateHeaders(parsed.headers);
    if (!headerValidation.isValid) {
      return {
        isValid: false,
        totalRows: parsed.rows.length,
        validRows: [],
        errors: headerValidation.errors.map((msg) => ({ type: 'header' as const, message: msg })),
      };
    }

    // 轉換為物件
    const data = csvToObjects<Record<string, string>>(parsed);

    // 驗證資料
    const validation = await validateCSVData(data, eventId);

    const errors: ImportError[] = [];

    validation.invalidRows.forEach((invalid) => {
      errors.push({
        rowIndex: invalid.rowIndex,
        type: 'validation',
        message: `第 ${invalid.rowIndex} 列：${invalid.errors.join(', ')}`,
      });
    });

    validation.duplicateRows.forEach((duplicate) => {
      errors.push({
        rowIndex: duplicate.rowIndex,
        type: 'duplicate',
        message: `第 ${duplicate.rowIndex} 列：${duplicate.reason}`,
      });
    });

    return {
      isValid: validation.isValid,
      totalRows: parsed.rows.length,
      validRows: validation.validRows,
      errors,
    };
  } catch (error) {
    throw new DataError('CSV 預覽失敗', error instanceof Error ? error : undefined);
  }
}
