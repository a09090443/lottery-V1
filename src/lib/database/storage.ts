/**
 * localStorage Wrapper Utilities
 * 提供安全的 localStorage 操作，包含錯誤處理與型別安全
 */

/**
 * 儲存空間錯誤類別
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * 從 localStorage 讀取項目
 * @param key - 儲存鍵值
 * @returns 解析後的資料，若不存在則返回 null
 * @throws {StorageError} 當讀取或解析失敗時
 */
export function getItem<T = unknown>(key: string): T | null {
  try {
    const value = localStorage.getItem(key);
    if (value === null) {
      return null;
    }
    return JSON.parse(value) as T;
  } catch (error) {
    throw new StorageError(
      `無法從 localStorage 讀取資料: ${key}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 儲存項目至 localStorage
 * @param key - 儲存鍵值
 * @param value - 要儲存的資料
 * @throws {StorageError} 當儲存失敗時（如空間不足）
 */
export function setItem<T = unknown>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    // 檢查是否為儲存空間不足錯誤
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new StorageError(
        '儲存空間不足，請清理舊資料或匯出活動資料',
        error instanceof Error ? error : undefined
      );
    }
    throw new StorageError(
      `無法儲存資料至 localStorage: ${key}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 從 localStorage 移除項目
 * @param key - 儲存鍵值
 * @throws {StorageError} 當移除失敗時
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    throw new StorageError(
      `無法從 localStorage 移除資料: ${key}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 清除所有 localStorage 資料
 * @throws {StorageError} 當清除失敗時
 */
export function clear(): void {
  try {
    localStorage.clear();
  } catch (error) {
    throw new StorageError(
      '無法清除 localStorage 資料',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 檢查 localStorage 中是否存在指定鍵值
 * @param key - 儲存鍵值
 * @returns 是否存在
 */
export function hasItem(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * 取得 localStorage 使用量資訊
 * @returns 使用量資訊（bytes）
 */
export function getStorageUsage(): {
  used: number;
  total: number;
  usagePercentage: number;
} {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      // 計算 key + value 的大小（UTF-16 編碼，每字元 2 bytes）
      used += (key.length + (value ? value.length : 0)) * 2;
    }
  }

  // localStorage 典型限制為 5MB-10MB，這裡假設 5MB
  const total = 5 * 1024 * 1024; // 5 MB in bytes

  return {
    used,
    total,
    usagePercentage: (used / total) * 100,
  };
}

/**
 * 檢查儲存空間是否即將用盡
 * @param threshold - 警告閾值（百分比，預設 80%）
 * @returns 是否需要警告
 */
export function isStorageNearFull(threshold: number = 80): boolean {
  const { usagePercentage } = getStorageUsage();
  return usagePercentage >= threshold;
}

/**
 * 取得所有以指定前綴開頭的鍵值
 * @param prefix - 鍵值前綴
 * @returns 符合的鍵值陣列
 */
export function getKeysByPrefix(prefix: string): string[] {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keys.push(key);
    }
  }
  return keys;
}

/**
 * 移除所有以指定前綴開頭的項目
 * @param prefix - 鍵值前綴
 * @returns 移除的項目數量
 */
export function removeByPrefix(prefix: string): number {
  const keys = getKeysByPrefix(prefix);
  keys.forEach((key) => removeItem(key));
  return keys.length;
}
