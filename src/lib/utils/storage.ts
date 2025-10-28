/**
 * Storage Monitoring Utilities
 * 儲存空間監控工具
 */

/**
 * 儲存空間資訊
 */
export interface StorageInfo {
  /** 使用的空間（bytes） */
  used: number;
  /** 可用空間（bytes） */
  available: number;
  /** 總空間（bytes） */
  total: number;
  /** 使用百分比 */
  usagePercent: number;
  /** 是否接近限制 */
  isNearLimit: boolean;
  /** 是否超過限制 */
  isOverLimit: boolean;
}

/**
 * 儲存空間警告等級
 */
export type StorageWarningLevel = 'safe' | 'warning' | 'critical' | 'full';

/**
 * 取得 localStorage 使用情況
 */
export function getLocalStorageUsage(): StorageInfo {
  let used = 0;

  // 計算所有 localStorage 項目的大小
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      used += key.length + (localStorage.getItem(key)?.length || 0);
    }
  }

  // localStorage 通常限制為 5-10 MB，這裡假設 5 MB
  const total = 5 * 1024 * 1024; // 5 MB in bytes
  const available = total - used;
  const usagePercent = (used / total) * 100;

  return {
    used,
    available,
    total,
    usagePercent,
    isNearLimit: usagePercent > 80,
    isOverLimit: usagePercent > 95,
  };
}

/**
 * 取得 IndexedDB 使用情況（估算）
 * 注意：IndexedDB 沒有直接的 API 來獲取使用量，這是估算值
 */
export async function getIndexedDBUsage(): Promise<StorageInfo> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const total = estimate.quota || 0;
      const available = total - used;
      const usagePercent = total > 0 ? (used / total) * 100 : 0;

      return {
        used,
        available,
        total,
        usagePercent,
        isNearLimit: usagePercent > 80,
        isOverLimit: usagePercent > 95,
      };
    } catch (error) {
      console.error('Failed to estimate storage:', error);
    }
  }

  // Fallback: return unknown storage info
  return {
    used: 0,
    available: 0,
    total: 0,
    usagePercent: 0,
    isNearLimit: false,
    isOverLimit: false,
  };
}

/**
 * 取得儲存空間警告等級
 */
export function getStorageWarningLevel(usagePercent: number): StorageWarningLevel {
  if (usagePercent >= 95) return 'full';
  if (usagePercent >= 80) return 'critical';
  if (usagePercent >= 60) return 'warning';
  return 'safe';
}

/**
 * 格式化位元組大小
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * 清理過期資料（可選功能）
 */
export function cleanupExpiredData(): number {
  let cleaned = 0;

  // 檢查是否有帶有過期時間的資料
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key) && key.startsWith('temp_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
          localStorage.removeItem(key);
          cleaned++;
        }
      } catch {
        // 忽略無法解析的資料
      }
    }
  }

  return cleaned;
}

/**
 * 取得儲存空間建議
 */
export function getStorageRecommendations(info: StorageInfo): string[] {
  const recommendations: string[] = [];

  if (info.isOverLimit) {
    recommendations.push('儲存空間已滿，請立即匯出資料並清理舊活動');
    recommendations.push('刪除已封存的活動以釋放空間');
  } else if (info.isNearLimit) {
    recommendations.push('儲存空間即將用盡，建議定期匯出備份');
    recommendations.push('考慮封存並刪除已完成的舊活動');
  } else if (info.usagePercent > 40) {
    recommendations.push('建議定期匯出資料作為備份');
  }

  return recommendations;
}

/**
 * 檢查是否可以儲存新資料
 */
export function canStoreData(estimatedSize: number): boolean {
  const info = getLocalStorageUsage();
  return info.available > estimatedSize * 1.2; // 保留 20% 緩衝
}

/**
 * 儲存空間監控鉤子資料
 */
export interface StorageMonitorData {
  info: StorageInfo;
  warningLevel: StorageWarningLevel;
  recommendations: string[];
  formattedUsed: string;
  formattedTotal: string;
}

/**
 * 取得完整的儲存空間監控資料
 */
export function getStorageMonitorData(): StorageMonitorData {
  const info = getLocalStorageUsage();
  const warningLevel = getStorageWarningLevel(info.usagePercent);
  const recommendations = getStorageRecommendations(info);

  return {
    info,
    warningLevel,
    recommendations,
    formattedUsed: formatBytes(info.used),
    formattedTotal: formatBytes(info.total),
  };
}

/**
 * 匯出提醒設定
 */
const EXPORT_REMINDER_KEY = 'lottery_last_export';
const EXPORT_REMINDER_DAYS = 7; // 提醒間隔天數

/**
 * 匯出提醒資料
 */
export interface ExportReminderData {
  /** 是否需要顯示提醒 */
  shouldShowReminder: boolean;
  /** 距離上次匯出的天數 */
  daysSinceLastExport: number;
  /** 上次匯出時間（ISO 8601 格式）*/
  lastExportAt: string | null;
  /** 提醒訊息 */
  message: string;
  /** 提醒等級：info（資訊）、warning（警告）、urgent（緊急）*/
  level: 'info' | 'warning' | 'urgent';
}

/**
 * 記錄匯出時間
 */
export function recordExportTimestamp(): void {
  const timestamp = new Date().toISOString();
  localStorage.setItem(EXPORT_REMINDER_KEY, timestamp);
}

/**
 * 取得上次匯出時間
 */
export function getLastExportTimestamp(): string | null {
  return localStorage.getItem(EXPORT_REMINDER_KEY);
}

/**
 * 取得匯出提醒資料
 */
export function getExportReminderData(): ExportReminderData {
  const lastExportStr = getLastExportTimestamp();

  // 如果從未匯出過
  if (!lastExportStr) {
    return {
      shouldShowReminder: true,
      daysSinceLastExport: -1,
      lastExportAt: null,
      message: '建議定期匯出資料以備份，避免瀏覽器資料遺失',
      level: 'info',
    };
  }

  const lastExport = new Date(lastExportStr);
  const now = new Date();
  const diffMs = now.getTime() - lastExport.getTime();
  const daysSinceLastExport = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // 根據天數決定提醒等級
  let shouldShowReminder = false;
  let message = '';
  let level: 'info' | 'warning' | 'urgent' = 'info';

  if (daysSinceLastExport >= 30) {
    shouldShowReminder = true;
    message = `已經 ${daysSinceLastExport} 天未匯出資料，強烈建議立即備份以避免資料遺失`;
    level = 'urgent';
  } else if (daysSinceLastExport >= 14) {
    shouldShowReminder = true;
    message = `已經 ${daysSinceLastExport} 天未匯出資料，建議盡快備份`;
    level = 'warning';
  } else if (daysSinceLastExport >= EXPORT_REMINDER_DAYS) {
    shouldShowReminder = true;
    message = `已經 ${daysSinceLastExport} 天未匯出資料，建議定期備份`;
    level = 'info';
  }

  return {
    shouldShowReminder,
    daysSinceLastExport,
    lastExportAt: lastExportStr,
    message,
    level,
  };
}

/**
 * 關閉匯出提醒（延後提醒）
 * 將上次匯出時間更新為今天，延後提醒
 */
export function snoozeExportReminder(): void {
  recordExportTimestamp();
}
