/**
 * CSV Validator
 * CSV 資料驗證器
 */

import { validate } from '../utils/validation';
import { CreateParticipantInputSchema } from '@/types';
import { checkParticipantUniqueness } from '../data/participants';

/**
 * CSV 驗證結果
 */
export interface CSVValidationResult {
  isValid: boolean;
  validRows: ParticipantCSVRow[];
  invalidRows: InvalidRow[];
  duplicateRows: DuplicateRow[];
}

/**
 * 參與者 CSV 行資料
 */
export interface ParticipantCSVRow {
  name: string;
  employeeId: string | null;
  nationalId: string | null;
  email: string | null;
  phone: string | null;
}

/**
 * 無效行資料
 */
export interface InvalidRow {
  rowIndex: number;
  data: Record<string, string>;
  errors: string[];
}

/**
 * 重複行資料
 */
export interface DuplicateRow {
  rowIndex: number;
  data: ParticipantCSVRow;
  reason: string;
}

/**
 * 必要欄位
 */
const REQUIRED_HEADERS = ['name'];

/**
 * 可選欄位
 */
const OPTIONAL_HEADERS = ['employeeId', 'nationalId', 'email', 'phone'];

/**
 * 所有支援的欄位
 */
const ALL_HEADERS = [...REQUIRED_HEADERS, ...OPTIONAL_HEADERS];

/**
 * 驗證 CSV 標題列
 * @param headers - CSV 標題列
 * @returns 驗證結果
 */
export function validateHeaders(headers: string[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 檢查必要欄位
  for (const required of REQUIRED_HEADERS) {
    if (!headers.includes(required)) {
      errors.push(`缺少必要欄位：${required}`);
    }
  }

  // 檢查不支援的欄位
  const unsupported = headers.filter((h) => !ALL_HEADERS.includes(h));
  if (unsupported.length > 0) {
    errors.push(`不支援的欄位：${unsupported.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * 驗證並轉換 CSV 資料
 * @param data - CSV 物件陣列
 * @param eventId - 活動 ID（用於檢查唯一性）
 * @returns 驗證結果
 */
export async function validateCSVData(
  data: Record<string, string>[],
  eventId?: string
): Promise<CSVValidationResult> {
  const validRows: ParticipantCSVRow[] = [];
  const invalidRows: InvalidRow[] = [];
  const duplicateRows: DuplicateRow[] = [];

  // 用於檢查 CSV 內部重複
  const seenParticipants = new Map<string, number>();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowIndex = i + 2; // +1 for 0-index, +1 for header row

    // 轉換為 ParticipantCSVRow
    const participantRow: ParticipantCSVRow = {
      name: row.name?.trim() || '',
      employeeId: row.employeeId?.trim() || null,
      nationalId: row.nationalId?.trim() || null,
      email: row.email?.trim() || null,
      phone: row.phone?.trim() || null,
    };

    // 驗證資料格式
    const validation = validate(CreateParticipantInputSchema, participantRow);
    if (!validation.success) {
      invalidRows.push({
        rowIndex,
        data: row,
        errors: validation.errors?.map((e) => e.message) || ['驗證失敗'],
      });
      continue;
    }

    // 建立唯一鍵（name + employeeId 或 name + nationalId）
    const uniqueKey = createUniqueKey(participantRow);

    // 檢查 CSV 內部重複
    if (seenParticipants.has(uniqueKey)) {
      const firstOccurrence = seenParticipants.get(uniqueKey)!;
      duplicateRows.push({
        rowIndex,
        data: participantRow,
        reason: `與第 ${firstOccurrence} 列重複`,
      });
      continue;
    }

    // 檢查資料庫中的唯一性（如果提供了 eventId）
    if (eventId) {
      const isUnique = await checkParticipantUniqueness(
        eventId,
        participantRow.name,
        participantRow.employeeId,
        participantRow.nationalId
      );

      if (!isUnique) {
        duplicateRows.push({
          rowIndex,
          data: participantRow,
          reason: '活動中已存在相同參與者',
        });
        continue;
      }
    }

    // 記錄此參與者
    seenParticipants.set(uniqueKey, rowIndex);
    validRows.push(participantRow);
  }

  return {
    isValid: invalidRows.length === 0 && duplicateRows.length === 0,
    validRows,
    invalidRows,
    duplicateRows,
  };
}

/**
 * 建立唯一鍵
 * @param participant - 參與者資料
 * @returns 唯一鍵
 */
function createUniqueKey(participant: ParticipantCSVRow): string {
  if (participant.employeeId) {
    return `${participant.name}:${participant.employeeId}`;
  }
  if (participant.nationalId) {
    return `${participant.name}:${participant.nationalId}`;
  }
  // 如果都沒有，使用名字（可能會有重複）
  return `${participant.name}:no-id`;
}
