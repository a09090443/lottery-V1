/**
 * Privacy Utilities
 * 隱私保護工具函式（ID 遮罩）
 */

/**
 * 遮罩身分證字號（顯示前 6 字元，其餘以 * 代替）
 * @param nationalId - 身分證字號
 * @returns 遮罩後的字號
 * @example
 * maskNationalId('A123456789') // 'A12345****'
 */
export function maskNationalId(nationalId: string | null | undefined): string | null {
  if (!nationalId) {
    return null;
  }

  const visibleLength = 6;
  if (nationalId.length <= visibleLength) {
    return nationalId;
  }

  const visible = nationalId.substring(0, visibleLength);
  const masked = '*'.repeat(nationalId.length - visibleLength);
  return visible + masked;
}

/**
 * 遮罩員工編號（顯示前 6 字元，其餘以 * 代替）
 * @param employeeId - 員工編號
 * @returns 遮罩後的編號
 * @example
 * maskEmployeeId('EMP20240001') // 'EMP200****'
 */
export function maskEmployeeId(employeeId: string | null | undefined): string | null {
  if (!employeeId) {
    return null;
  }

  const visibleLength = 6;
  if (employeeId.length <= visibleLength) {
    return employeeId;
  }

  const visible = employeeId.substring(0, visibleLength);
  const masked = '*'.repeat(employeeId.length - visibleLength);
  return visible + masked;
}

/**
 * 遮罩電子郵件（顯示開頭 2 字元與 @ 後的網域）
 * @param email - 電子郵件
 * @returns 遮罩後的郵件
 * @example
 * maskEmail('john.doe@example.com') // 'jo******@example.com'
 */
export function maskEmail(email: string | null | undefined): string | null {
  if (!email) {
    return null;
  }

  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    // 無效的 email 格式
    return email;
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (localPart.length <= 2) {
    return email;
  }

  const visible = localPart.substring(0, 2);
  const masked = '*'.repeat(localPart.length - 2);
  return visible + masked + domain;
}

/**
 * 遮罩電話號碼（顯示前 3 後 4 字元）
 * @param phone - 電話號碼
 * @returns 遮罩後的號碼
 * @example
 * maskPhone('0912345678') // '091****678'
 */
export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) {
    return null;
  }

  if (phone.length <= 7) {
    return phone;
  }

  const prefix = phone.substring(0, 3);
  const suffix = phone.substring(phone.length - 4);
  const masked = '*'.repeat(phone.length - 7);
  return prefix + masked + suffix;
}
