/**
 * Database Migration Runner
 * 執行資料庫 schema 遷移
 */

import * as sqlite from './sqlite';
import * as version from './version';

/**
 * 遷移錯誤類別
 */
export class MigrationError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'MigrationError';
  }
}

/**
 * 載入 schema.sql 內容
 * @returns SQL schema 內容
 */
function loadSchemaSQL(): string {
  try {
    // 在瀏覽器環境中，我們需要將 schema 內嵌或透過 API 獲取
    // 這裡先返回內嵌的 schema
    return EMBEDDED_SCHEMA;
  } catch (error) {
    throw new MigrationError(
      '無法載入 schema.sql',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 內嵌的 SQL schema（用於瀏覽器環境）
 */
const EMBEDDED_SCHEMA = `
-- ============================================================================
-- Browser-Based Lottery System - Database Schema
-- Version: 1.0.0
-- ============================================================================

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  description TEXT CHECK(description IS NULL OR length(description) <= 500),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  scheduled_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft', 'active', 'completed', 'archived')) DEFAULT 'draft',
  allow_duplicate_winners INTEGER NOT NULL DEFAULT 0,
  participant_count INTEGER NOT NULL DEFAULT 0,
  prize_count INTEGER NOT NULL DEFAULT 0,
  drawn_winners_count INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_scheduled_at ON events(scheduled_at);

CREATE TABLE IF NOT EXISTS prizes (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  description TEXT CHECK(description IS NULL OR length(description) <= 300),
  total_quantity INTEGER NOT NULL CHECK(total_quantity >= 1),
  remaining_quantity INTEGER NOT NULL CHECK(remaining_quantity >= 0),
  display_order INTEGER NOT NULL DEFAULT 999,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  CHECK (remaining_quantity <= total_quantity)
);

CREATE INDEX IF NOT EXISTS idx_prizes_event_id ON prizes(event_id);
CREATE INDEX IF NOT EXISTS idx_prizes_display_order ON prizes(event_id, display_order);

CREATE TABLE IF NOT EXISTS participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  employee_id TEXT CHECK(employee_id IS NULL OR length(employee_id) <= 50),
  national_id TEXT CHECK(national_id IS NULL OR length(national_id) <= 50),
  email TEXT CHECK(email IS NULL OR length(email) <= 100),
  phone TEXT CHECK(phone IS NULL OR length(phone) <= 20),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (employee_id IS NOT NULL OR national_id IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_participants_name ON participants(name);
CREATE INDEX IF NOT EXISTS idx_participants_employee_id ON participants(employee_id) WHERE employee_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_participants_national_id ON participants(national_id) WHERE national_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS event_participants (
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (event_id, participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_participant_id ON event_participants(participant_id);

CREATE TABLE IF NOT EXISTS drawing_results (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL,
  prize_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  drawn_at TEXT NOT NULL DEFAULT (datetime('now')),
  draw_sequence INTEGER NOT NULL CHECK(draw_sequence >= 1),
  status TEXT NOT NULL CHECK(status IN ('confirmed', 'cancelled')) DEFAULT 'confirmed',
  notes TEXT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (prize_id) REFERENCES prizes(id) ON DELETE RESTRICT,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE RESTRICT,
  UNIQUE(event_id, prize_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_drawing_results_event_id ON drawing_results(event_id);
CREATE INDEX IF NOT EXISTS idx_drawing_results_prize_id ON drawing_results(prize_id);
CREATE INDEX IF NOT EXISTS idx_drawing_results_participant_id ON drawing_results(participant_id);
CREATE INDEX IF NOT EXISTS idx_drawing_results_drawn_at ON drawing_results(drawn_at);

CREATE TRIGGER IF NOT EXISTS trigger_events_updated_at
AFTER UPDATE ON events
FOR EACH ROW
BEGIN
  UPDATE events SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_prizes_updated_at
AFTER UPDATE ON prizes
FOR EACH ROW
BEGIN
  UPDATE prizes SET updated_at = datetime('now') WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS trigger_participants_updated_at
AFTER UPDATE ON participants
FOR EACH ROW
BEGIN
  UPDATE participants SET updated_at = datetime('now') WHERE id = NEW.id;
END;
`;

/**
 * 初始化資料庫（執行 schema）
 * @throws {MigrationError} 當初始化失敗時
 */
export async function initDatabase(): Promise<void> {
  try {
    // 檢查是否已初始化
    if (sqlite.isDatabaseInitialized()) {
      // 已初始化，檢查是否需要遷移
      if (version.needsMigration()) {
        await runMigrations();
      }
      return;
    }

    // 載入並執行 schema
    const schemaSQL = loadSchemaSQL();
    await sqlite.executeBatch(schemaSQL);

    // 初始化版本資訊
    version.initDataVersion();
    version.recordMigration(version.CURRENT_VERSION, '初始化資料庫 schema');

    console.info('資料庫初始化完成');
  } catch (error) {
    throw new MigrationError(
      '資料庫初始化失敗',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 執行資料庫遷移
 * @throws {MigrationError} 當遷移失敗時
 */
export async function runMigrations(): Promise<void> {
  const currentVersion = version.getDataVersion();

  if (!currentVersion) {
    // 無版本資訊，執行初始化
    await initDatabase();
    return;
  }

  // 比較版本
  const comparison = version.compareVersions(currentVersion.version, version.CURRENT_VERSION);

  if (comparison === 0) {
    // 版本相同，無需遷移
    console.info('資料庫版本已是最新');
    return;
  }

  if (comparison > 0) {
    // 當前版本高於目標版本（降級）
    throw new MigrationError(
      `無法降級資料庫版本：當前 ${currentVersion.version}，目標 ${version.CURRENT_VERSION}`
    );
  }

  // 執行遷移（目前僅支援 1.0.0，未來版本可在此添加遷移邏輯）
  console.info(`執行資料庫遷移：${currentVersion.version} -> ${version.CURRENT_VERSION}`);

  // 未來版本遷移邏輯示例：
  // if (currentVersion.version === '1.0.0' && version.CURRENT_VERSION === '1.1.0') {
  //   await migrate_1_0_0_to_1_1_0();
  // }

  // 更新版本資訊
  version.recordMigration(version.CURRENT_VERSION, '資料庫遷移完成');

  console.info('資料庫遷移完成');
}

/**
 * 檢查資料庫版本
 * @returns 當前版本資訊
 */
export function checkDatabaseVersion(): version.DataVersion | null {
  return version.getDataVersion();
}

/**
 * 重置資料庫（清除所有資料並重新初始化）
 * @throws {MigrationError} 當重置失敗時
 */
export async function resetDatabase(): Promise<void> {
  try {
    await sqlite.clearDatabase();
    version.clearDataVersion();
    await initDatabase();
    console.info('資料庫已重置');
  } catch (error) {
    throw new MigrationError('資料庫重置失敗', error instanceof Error ? error : undefined);
  }
}
