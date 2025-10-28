/**
 * Database Version Management
 * 管理資料庫版本與遷移歷史
 */

import * as storage from './storage';

/**
 * 資料版本資訊
 */
export interface DataVersion {
  /** 版本號（semantic versioning） */
  version: string;

  /** 資料庫建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 最後一次遷移時間（ISO 8601 格式） */
  lastMigrationAt: string | null;

  /** 遷移歷史記錄 */
  migrationHistory: MigrationRecord[];
}

/**
 * 遷移記錄
 */
export interface MigrationRecord {
  /** 遷移版本 */
  version: string;

  /** 遷移時間（ISO 8601 格式） */
  migratedAt: string;

  /** 遷移描述 */
  description: string;
}

/**
 * localStorage 鍵值
 */
const VERSION_KEY = 'lottery_data_version';

/**
 * 當前資料版本
 */
export const CURRENT_VERSION = '1.0.0';

/**
 * 讀取資料版本資訊
 * @returns 版本資訊，若不存在則返回 null
 */
export function getDataVersion(): DataVersion | null {
  return storage.getItem<DataVersion>(VERSION_KEY);
}

/**
 * 寫入資料版本資訊
 * @param version - 版本資訊
 */
export function setDataVersion(version: DataVersion): void {
  storage.setItem(VERSION_KEY, version);
}

/**
 * 初始化資料版本（首次使用）
 * @returns 初始化的版本資訊
 */
export function initDataVersion(): DataVersion {
  const version: DataVersion = {
    version: CURRENT_VERSION,
    createdAt: new Date().toISOString(),
    lastMigrationAt: null,
    migrationHistory: [],
  };

  setDataVersion(version);
  return version;
}

/**
 * 記錄遷移
 * @param migrationVersion - 遷移目標版本
 * @param description - 遷移描述
 */
export function recordMigration(migrationVersion: string, description: string): void {
  const currentVersion = getDataVersion();

  if (!currentVersion) {
    // 若無版本資訊，初始化並記錄遷移
    const version = initDataVersion();
    version.migrationHistory.push({
      version: migrationVersion,
      migratedAt: new Date().toISOString(),
      description,
    });
    version.lastMigrationAt = new Date().toISOString();
    setDataVersion(version);
    return;
  }

  // 更新版本資訊
  currentVersion.version = migrationVersion;
  currentVersion.lastMigrationAt = new Date().toISOString();
  currentVersion.migrationHistory.push({
    version: migrationVersion,
    migratedAt: new Date().toISOString(),
    description,
  });

  setDataVersion(currentVersion);
}

/**
 * 檢查是否需要遷移
 * @returns 是否需要遷移
 */
export function needsMigration(): boolean {
  const version = getDataVersion();

  if (!version) {
    return true; // 無版本資訊，需要初始化
  }

  return version.version !== CURRENT_VERSION;
}

/**
 * 比較版本號
 * @param version1 - 版本 1
 * @param version2 - 版本 2
 * @returns -1: version1 < version2, 0: version1 === version2, 1: version1 > version2
 */
export function compareVersions(version1: string, version2: string): number {
  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);

  for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part < v2Part) return -1;
    if (v1Part > v2Part) return 1;
  }

  return 0;
}

/**
 * 清除版本資訊
 */
export function clearDataVersion(): void {
  storage.removeItem(VERSION_KEY);
}
