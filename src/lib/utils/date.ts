/**
 * Date Formatting Utilities
 * 日期處理與格式化工具
 */

/**
 * 將 Date 轉換為 ISO 8601 格式字串
 * @param date - Date 物件
 * @returns ISO 8601 格式字串
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * 取得當前時間的 ISO 8601 格式字串
 * @returns ISO 8601 格式字串
 */
export function now(): string {
  return new Date().toISOString();
}

/**
 * 驗證 ISO 8601 格式字串
 * @param dateString - 日期字串
 * @returns 是否為有效的 ISO 8601 格式
 */
export function isValidISOString(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && date.toISOString() === dateString;
}

/**
 * 格式化日期時間（繁體中文）
 * @param dateString - ISO 8601 格式字串
 * @returns 格式化後的日期時間（例：2025年10月24日 14:30）
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * 格式化日期（繁體中文）
 * @param dateString - ISO 8601 格式字串
 * @returns 格式化後的日期（例：2025年10月24日）
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}年${month}月${day}日`;
}

/**
 * 格式化時間
 * @param dateString - ISO 8601 格式字串
 * @returns 格式化後的時間（例：14:30）
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);

  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * 計算兩個日期之間的天數差
 * @param date1 - 日期 1
 * @param date2 - 日期 2
 * @returns 天數差（絕對值）
 */
export function daysBetween(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;

  const timeDiff = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

/**
 * 檢查日期是否為未來日期
 * @param dateString - ISO 8601 格式字串
 * @returns 是否為未來日期
 */
export function isFutureDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
}

/**
 * 檢查日期是否為過去日期
 * @param dateString - ISO 8601 格式字串
 * @returns 是否為過去日期
 */
export function isPastDate(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  return date < now;
}
