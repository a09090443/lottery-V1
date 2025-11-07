/**
 * SQLite WASM Database Initialization
 * 提供 SQLite WebAssembly 資料庫的初始化與基本操作
 */

import initSqlJs, { Database, SqlJsStatic } from 'sql.js';

/**
 * SQLite 資料庫錯誤類別
 */
export class SQLiteError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'SQLiteError';
  }
}

/**
 * SQLite WASM 實例（單例模式）
 */
let sqlInstance: SqlJsStatic | null = null;

/**
 * 資料庫實例（單例模式）
 */
let dbInstance: Database | null = null;

/**
 * localStorage 鍵值（用於儲存資料庫二進位資料）
 */
const DB_STORAGE_KEY = 'lottery_sqlite_db';

/**
 * 初始化 SQLite WASM 引擎
 * @returns SQL.js 實例
 * @throws {SQLiteError} 當初始化失敗時
 */
export async function initSQLite(): Promise<SqlJsStatic> {
  if (sqlInstance) {
    return sqlInstance;
  }

  try {
    // 載入 SQLite WASM
    sqlInstance = await initSqlJs({
      // 從 CDN 載入 WASM 檔案
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    });

    return sqlInstance;
  } catch (error) {
    throw new SQLiteError(
      '無法初始化 SQLite WASM 引擎',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 建立或載入資料庫
 * @returns Database 實例
 * @throws {SQLiteError} 當建立或載入失敗時
 */
export async function getDatabase(): Promise<Database> {
  // 如果已有實例，直接返回
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // 確保 SQL.js 已初始化
    const SQL = await initSQLite();

    // 嘗試從 localStorage 載入現有資料庫
    const savedDb = localStorage.getItem(DB_STORAGE_KEY);

    if (savedDb) {
      // 將 base64 字串轉換回 Uint8Array
      const binaryString = atob(savedDb);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // 從儲存的資料建立資料庫
      dbInstance = new SQL.Database(bytes);
    } else {
      // 建立新資料庫
      dbInstance = new SQL.Database();

      // 首次建立資料庫時，需要初始化 schema
      // 動態導入 migrations 模組以避免循環依賴
      const { initDatabase } = await import('./migrations');
      await initDatabase();
    }

    return dbInstance;
  } catch (error) {
    throw new SQLiteError(
      '無法建立或載入資料庫',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 儲存資料庫至 localStorage
 * @throws {SQLiteError} 當儲存失敗時
 */
export async function saveDatabase(): Promise<void> {
  if (!dbInstance) {
    throw new SQLiteError('資料庫尚未初始化');
  }

  try {
    // 匯出資料庫為 Uint8Array
    const data = dbInstance.export();

    // 轉換為 base64 字串以儲存至 localStorage
    let binaryString = '';
    const len = data.byteLength;
    for (let i = 0; i < len; i++) {
      const byte = data[i];
      if (byte !== undefined) {
        binaryString += String.fromCharCode(byte);
      }
    }
    const base64String = btoa(binaryString);

    // 儲存至 localStorage
    localStorage.setItem(DB_STORAGE_KEY, base64String);
  } catch (error) {
    // 檢查是否為儲存空間不足錯誤
    if (
      error instanceof DOMException &&
      (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      throw new SQLiteError(
        '儲存空間不足，請清理舊資料或匯出活動資料',
        error instanceof Error ? error : undefined
      );
    }
    throw new SQLiteError('無法儲存資料庫', error instanceof Error ? error : undefined);
  }
}

/**
 * 執行 SQL 語句（不返回結果）
 * @param sql - SQL 語句
 * @param params - 參數（可選）
 * @throws {SQLiteError} 當執行失敗時
 */
export async function execute(sql: string, params?: Array<string | number | null>): Promise<void> {
  const db = await getDatabase();

  try {
    db.run(sql, params as any);
    await saveDatabase();
  } catch (error) {
    throw new SQLiteError(
      `執行 SQL 失敗: ${sql}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 執行 SQL 查詢（返回結果）
 * @param sql - SQL 查詢語句
 * @param params - 參數（可選）
 * @returns 查詢結果
 * @throws {SQLiteError} 當查詢失敗時
 */
export async function query<T = unknown>(sql: string, params?: Array<string | number | null>): Promise<T[]> {
  const db = await getDatabase();

  try {
    const results: T[] = [];
    const stmt = db.prepare(sql);

    if (params) {
      stmt.bind(params as any);
    }

    while (stmt.step()) {
      const row = stmt.getAsObject() as T;
      results.push(row);
    }

    stmt.free();
    return results;
  } catch (error) {
    throw new SQLiteError(`查詢 SQL 失敗: ${sql}`, error instanceof Error ? error : undefined);
  }
}

/**
 * 執行 SQL 查詢（返回單一結果）
 * @param sql - SQL 查詢語句
 * @param params - 參數（可選）
 * @returns 查詢結果（第一筆）或 null
 * @throws {SQLiteError} 當查詢失敗時
 */
export async function queryOne<T = unknown>(sql: string, params?: Array<string | number | null>): Promise<T | null> {
  const results = await query<T>(sql, params);
  return results.length > 0 ? results[0] ?? null : null;
}

/**
 * 執行批次 SQL 語句（用於執行 schema.sql）
 * @param sqlBatch - 批次 SQL 語句（用分號分隔）
 * @throws {SQLiteError} 當執行失敗時
 */
export async function executeBatch(sqlBatch: string): Promise<void> {
  const db = await getDatabase();

  try {
    db.exec(sqlBatch);
    await saveDatabase();
  } catch (error) {
    throw new SQLiteError(
      '執行批次 SQL 失敗',
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * 開始交易
 * @throws {SQLiteError} 當開始交易失敗時
 */
export async function beginTransaction(): Promise<void> {
  await execute('BEGIN TRANSACTION');
}

/**
 * 提交交易
 * @throws {SQLiteError} 當提交交易失敗時
 */
export async function commit(): Promise<void> {
  await execute('COMMIT');
}

/**
 * 回滾交易
 * @throws {SQLiteError} 當回滾交易失敗時
 */
export async function rollback(): Promise<void> {
  await execute('ROLLBACK');
}

/**
 * 執行帶交易的操作
 * @param operation - 要執行的操作
 * @returns 操作結果
 * @throws {SQLiteError} 當操作失敗時
 */
export async function transaction<T>(operation: () => Promise<T>): Promise<T> {
  await beginTransaction();

  try {
    const result = await operation();
    await commit();
    return result;
  } catch (error) {
    await rollback();
    throw error;
  }
}

/**
 * 關閉資料庫連線
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 清除資料庫（刪除所有資料）
 * @throws {SQLiteError} 當清除失敗時
 */
export async function clearDatabase(): Promise<void> {
  try {
    // 關閉現有連線
    closeDatabase();

    // 移除 localStorage 中的資料庫
    localStorage.removeItem(DB_STORAGE_KEY);

    // 重新初始化空資料庫
    const SQL = await initSQLite();
    dbInstance = new SQL.Database();
  } catch (error) {
    throw new SQLiteError('無法清除資料庫', error instanceof Error ? error : undefined);
  }
}

/**
 * 取得資料庫大小（bytes）
 * @returns 資料庫大小
 */
export function getDatabaseSize(): number {
  const savedDb = localStorage.getItem(DB_STORAGE_KEY);
  if (!savedDb) {
    return 0;
  }
  // base64 編碼後的大小約為原始大小的 1.37 倍
  // 還原為實際大小
  return Math.floor((savedDb.length * 3) / 4);
}

/**
 * 檢查資料庫是否已初始化
 * @returns 是否已初始化
 */
export function isDatabaseInitialized(): boolean {
  return localStorage.getItem(DB_STORAGE_KEY) !== null;
}
