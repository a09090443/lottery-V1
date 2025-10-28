/**
 * Admin Authentication
 * 管理員認證功能
 */

import * as crypto from './crypto';
import * as storage from '../database/storage';

/**
 * 管理員認證資料
 */
export interface AdminAuth {
  /** 密碼 hash (SHA-256) */
  passwordHash: string;

  /** 密碼設定時間（ISO 8601 格式） */
  passwordSetAt: string;

  /** 上次登入時間（ISO 8601 格式） */
  lastLoginAt: string | null;
}

/**
 * Session token
 */
export interface AdminSession {
  /** Session token (UUID v4) */
  token: string;

  /** Session 建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 上次活動時間（ISO 8601 格式，用於 idle timeout） */
  lastActivityAt: string;
}

/**
 * localStorage 鍵值
 */
const ADMIN_AUTH_KEY = 'lottery_admin_auth';
const SESSION_TOKEN_KEY = 'lottery_admin_session';
const LOGIN_ATTEMPTS_KEY = 'lottery_login_attempts';

/**
 * Session 逾時時間（毫秒）- 30 分鐘
 */
const SESSION_TIMEOUT = 30 * 60 * 1000;

/**
 * 登入速率限制設定
 */
const MAX_LOGIN_ATTEMPTS = 5; // 最多嘗試次數
const LOCKOUT_DURATION = 5 * 60 * 1000; // 鎖定時間（5 分鐘）

/**
 * 登入嘗試紀錄
 */
export interface LoginAttempts {
  /** 失敗次數 */
  failedCount: number;

  /** 鎖定開始時間（ISO 8601 格式）*/
  lockedUntil: string | null;

  /** 最後嘗試時間（ISO 8601 格式）*/
  lastAttemptAt: string;
}

/**
 * 檢查是否已設定密碼
 * @returns 是否已設定密碼
 */
export function isPasswordSet(): boolean {
  return storage.hasItem(ADMIN_AUTH_KEY);
}

/**
 * 設定管理員密碼（首次使用）
 * @param password - 明文密碼
 * @throws {Error} 當密碼不符合要求時
 */
export async function setPassword(password: string): Promise<void> {
  // 驗證密碼強度
  if (password.length < 8) {
    throw new Error('密碼長度至少需要 8 字元');
  }

  const passwordHash = await crypto.hashPassword(password);

  const auth: AdminAuth = {
    passwordHash,
    passwordSetAt: new Date().toISOString(),
    lastLoginAt: null,
  };

  storage.setItem(ADMIN_AUTH_KEY, auth);
}

/**
 * 驗證管理員密碼
 * @param password - 明文密碼
 * @returns 是否驗證成功
 */
export async function verifyPassword(password: string): Promise<boolean> {
  const auth = storage.getItem<AdminAuth>(ADMIN_AUTH_KEY);

  if (!auth) {
    return false;
  }

  return crypto.verifyPassword(password, auth.passwordHash);
}

/**
 * 建立 session token
 * @returns session token
 */
export function createSession(): string {
  const token = crypto.generateToken();

  const session: AdminSession = {
    token,
    createdAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  };

  // 使用 sessionStorage（關閉分頁後自動清除）
  sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(session));

  // 更新最後登入時間
  const auth = storage.getItem<AdminAuth>(ADMIN_AUTH_KEY);
  if (auth) {
    auth.lastLoginAt = new Date().toISOString();
    storage.setItem(ADMIN_AUTH_KEY, auth);
  }

  // 清除登入嘗試紀錄（登入成功）
  clearLoginAttempts();

  return token;
}

/**
 * 檢查是否已登入
 * @returns 是否已登入
 */
export function isLoggedIn(): boolean {
  const sessionStr = sessionStorage.getItem(SESSION_TOKEN_KEY);

  if (!sessionStr) {
    return false;
  }

  try {
    const session: AdminSession = JSON.parse(sessionStr);

    // 檢查 session 是否逾時
    const lastActivity = new Date(session.lastActivityAt);
    const now = new Date();
    const timeDiff = now.getTime() - lastActivity.getTime();

    if (timeDiff > SESSION_TIMEOUT) {
      // Session 已逾時，清除
      logout();
      return false;
    }

    // 更新最後活動時間
    session.lastActivityAt = now.toISOString();
    sessionStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(session));

    return true;
  } catch {
    return false;
  }
}

/**
 * 登出
 */
export function logout(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

/**
 * 取得 session 資訊
 * @returns session 資訊，若未登入則返回 null
 */
export function getSession(): AdminSession | null {
  const sessionStr = sessionStorage.getItem(SESSION_TOKEN_KEY);

  if (!sessionStr) {
    return null;
  }

  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

/**
 * 重置密碼（需清除所有資料）
 */
export function resetPassword(): void {
  storage.removeItem(ADMIN_AUTH_KEY);
  logout();
}

/**
 * 取得管理員認證資訊（不含密碼 hash）
 * @returns 認證資訊
 */
export function getAuthInfo(): Omit<AdminAuth, 'passwordHash'> | null {
  const auth = storage.getItem<AdminAuth>(ADMIN_AUTH_KEY);

  if (!auth) {
    return null;
  }

  return {
    passwordSetAt: auth.passwordSetAt,
    lastLoginAt: auth.lastLoginAt,
  };
}

/**
 * 檢查是否被鎖定
 * @returns 是否被鎖定與剩餘鎖定時間（秒）
 */
export function checkLockout(): { isLocked: boolean; remainingSeconds: number } {
  const attempts = storage.getItem<LoginAttempts>(LOGIN_ATTEMPTS_KEY);

  if (!attempts || !attempts.lockedUntil) {
    return { isLocked: false, remainingSeconds: 0 };
  }

  const lockedUntil = new Date(attempts.lockedUntil);
  const now = new Date();

  if (now < lockedUntil) {
    const remainingMs = lockedUntil.getTime() - now.getTime();
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    return { isLocked: true, remainingSeconds };
  }

  // 鎖定時間已過，清除鎖定
  attempts.lockedUntil = null;
  attempts.failedCount = 0;
  storage.setItem(LOGIN_ATTEMPTS_KEY, attempts);

  return { isLocked: false, remainingSeconds: 0 };
}

/**
 * 記錄登入失敗
 */
export function recordLoginFailure(): void {
  let attempts = storage.getItem<LoginAttempts>(LOGIN_ATTEMPTS_KEY);

  if (!attempts) {
    attempts = {
      failedCount: 0,
      lockedUntil: null,
      lastAttemptAt: new Date().toISOString(),
    };
  }

  attempts.failedCount += 1;
  attempts.lastAttemptAt = new Date().toISOString();

  // 達到最大嘗試次數，鎖定帳號
  if (attempts.failedCount >= MAX_LOGIN_ATTEMPTS) {
    const lockoutEnd = new Date(Date.now() + LOCKOUT_DURATION);
    attempts.lockedUntil = lockoutEnd.toISOString();
  }

  storage.setItem(LOGIN_ATTEMPTS_KEY, attempts);
}

/**
 * 清除登入嘗試紀錄（登入成功時呼叫）
 */
export function clearLoginAttempts(): void {
  storage.removeItem(LOGIN_ATTEMPTS_KEY);
}

/**
 * 取得登入嘗試資訊
 * @returns 登入嘗試資訊
 */
export function getLoginAttempts(): LoginAttempts | null {
  return storage.getItem<LoginAttempts>(LOGIN_ATTEMPTS_KEY);
}
