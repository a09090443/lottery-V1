/**
 * Cryptographic Utilities
 * 提供密碼 hashing 與加密功能
 */

/**
 * 使用 SHA-256 hash 密碼
 * @param password - 明文密碼
 * @returns hash 後的密碼（hex 格式）
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * 驗證密碼
 * @param password - 明文密碼
 * @param hash - 已 hash 的密碼
 * @returns 是否匹配
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

/**
 * 生成隨機 token (UUID v4)
 * @returns UUID v4 字串
 */
export function generateToken(): string {
  return crypto.randomUUID();
}
