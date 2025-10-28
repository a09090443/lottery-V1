/**
 * CSV Export Module
 * CSV 格式匯出模組
 */

import { DrawingResultWithDetails } from '@/types';
import * as dateUtils from '../utils/date';

/**
 * CSV 匯出選項
 */
export interface CsvExportOptions {
  /** 是否包含 BOM（用於 Excel 正確顯示中文） */
  includeBOM?: boolean;
  /** 欄位分隔符號（預設為逗號） */
  delimiter?: string;
  /** 是否包含標題列 */
  includeHeader?: boolean;
}

/**
 * 將中獎結果匯出為 CSV 格式
 * @param results - 中獎結果列表（含完整關聯資料）
 * @param eventName - 活動名稱
 * @param options - 匯出選項
 * @returns CSV 字串
 */
export function exportResultsToCsv(
  results: DrawingResultWithDetails[],
  eventName: string,
  options: CsvExportOptions = {}
): string {
  const {
    includeBOM = true,
    delimiter = ',',
    includeHeader = true,
  } = options;

  const lines: string[] = [];

  // BOM for UTF-8 (helps Excel recognize UTF-8 encoding)
  const bom = includeBOM ? '\uFEFF' : '';

  // Header row
  if (includeHeader) {
    const headers = [
      '序號',
      '抽獎時間',
      '獎項名稱',
      '中獎者姓名',
      '員工編號',
      '身分證字號',
      '狀態',
      '備註',
    ];
    lines.push(headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter));
  }

  // Data rows
  for (const result of results) {
    const row = [
      result.drawSequence.toString(),
      dateUtils.formatDateTime(result.drawnAt),
      result.prize.name,
      result.participant.name,
      result.participant.employeeId || '',
      result.participant.nationalId || '',
      result.status === 'confirmed' ? '已確認' : '已取消',
      result.notes || '',
    ];
    lines.push(row.map((v) => escapeCsvValue(v, delimiter)).join(delimiter));
  }

  return bom + lines.join('\n');
}

/**
 * 將單一獎項的中獎者匯出為 CSV
 * @param results - 該獎項的中獎結果
 * @param prizeName - 獎項名稱
 * @param options - 匯出選項
 * @returns CSV 字串
 */
export function exportPrizeWinnersToCsv(
  results: DrawingResultWithDetails[],
  prizeName: string,
  options: CsvExportOptions = {}
): string {
  const {
    includeBOM = true,
    delimiter = ',',
    includeHeader = true,
  } = options;

  const lines: string[] = [];
  const bom = includeBOM ? '\uFEFF' : '';

  if (includeHeader) {
    const headers = [
      '序號',
      '抽獎時間',
      '中獎者姓名',
      '員工編號',
      '身分證字號',
      '狀態',
    ];
    lines.push(headers.map((h) => escapeCsvValue(h, delimiter)).join(delimiter));
  }

  for (const result of results) {
    const row = [
      result.drawSequence.toString(),
      dateUtils.formatDateTime(result.drawnAt),
      result.participant.name,
      result.participant.employeeId || '',
      result.participant.nationalId || '',
      result.status === 'confirmed' ? '已確認' : '已取消',
    ];
    lines.push(row.map((v) => escapeCsvValue(v, delimiter)).join(delimiter));
  }

  return bom + lines.join('\n');
}

/**
 * 轉義 CSV 值（處理包含逗號、雙引號、換行的情況）
 * @param value - 原始值
 * @param delimiter - 分隔符號
 * @returns 轉義後的值
 */
function escapeCsvValue(value: string, delimiter: string): string {
  // 如果值包含分隔符號、雙引號或換行，需要用雙引號包裹
  if (
    value.includes(delimiter) ||
    value.includes('"') ||
    value.includes('\n') ||
    value.includes('\r')
  ) {
    // 將雙引號轉義為兩個雙引號
    const escaped = value.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  return value;
}

/**
 * 觸發 CSV 檔案下載
 * @param csvContent - CSV 內容
 * @param filename - 檔案名稱
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * 生成中獎結果 CSV 檔案名稱
 * @param eventName - 活動名稱
 * @returns 檔案名稱
 */
export function generateResultsCsvFilename(eventName: string): string {
  const timestamp = dateUtils.formatDate(dateUtils.now()).replace(/-/g, '');
  const sanitizedName = eventName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `${sanitizedName}_中獎名單_${timestamp}.csv`;
}

/**
 * 生成獎項中獎者 CSV 檔案名稱
 * @param eventName - 活動名稱
 * @param prizeName - 獎項名稱
 * @returns 檔案名稱
 */
export function generatePrizeCsvFilename(eventName: string, prizeName: string): string {
  const timestamp = dateUtils.formatDate(dateUtils.now()).replace(/-/g, '');
  const sanitizedEventName = eventName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  const sanitizedPrizeName = prizeName.replace(/[^\w\u4e00-\u9fa5]/g, '_');
  return `${sanitizedEventName}_${sanitizedPrizeName}_${timestamp}.csv`;
}
