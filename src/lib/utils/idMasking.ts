/**
 * ID Masking Utility
 * 遮罩員工編號與身分證字號
 */

/**
 * 遮罩 ID（顯示前 6 字元，其餘以 * 代替）
 * @param id - 原始 ID
 * @returns 遮罩後的 ID
 *
 * @example
 * maskId('A123456789') // 'A12345****'
 * maskId('E001') // 'E001'
 * maskId(null) // null
 */
export function maskId(id: string | null): string | null {
  if (!id) {
    return null;
  }

  // 若長度 ≤ 6，全部顯示
  if (id.length <= 6) {
    return id;
  }

  // 顯示前 6 個字元，其餘以 * 代替
  const visible = id.substring(0, 6);
  const masked = '*'.repeat(id.length - 6);

  return visible + masked;
}

/**
 * 遮罩員工編號
 * @param employeeId - 員工編號
 * @returns 遮罩後的員工編號
 */
export function maskEmployeeId(employeeId: string | null): string | null {
  return maskId(employeeId);
}

/**
 * 遮罩身分證字號
 * @param nationalId - 身分證字號
 * @returns 遮罩後的身分證字號
 */
export function maskNationalId(nationalId: string | null): string | null {
  return maskId(nationalId);
}
