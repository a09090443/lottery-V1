/**
 * Validation Utilities
 * 驗證工具函式（基於 Zod schema）
 */

import { ZodSchema, ZodError } from 'zod';

/**
 * 驗證錯誤資訊
 */
export interface ValidationError {
  /** 欄位名稱 */
  field: string;

  /** 錯誤訊息 */
  message: string;
}

/**
 * 驗證結果
 */
export interface ValidationResult<T> {
  /** 是否驗證成功 */
  success: boolean;

  /** 驗證後的資料（若成功） */
  data?: T;

  /** 錯誤訊息（若失敗） */
  errors?: ValidationError[];
}

/**
 * 使用 Zod schema 驗證資料
 * @param schema - Zod schema
 * @param data - 要驗證的資料
 * @returns 驗證結果
 */
export function validate<T>(schema: ZodSchema<T>, data: unknown): ValidationResult<T> {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        errors,
      };
    }

    return {
      success: false,
      errors: [
        {
          field: 'unknown',
          message: '驗證失敗',
        },
      ],
    };
  }
}

/**
 * 格式化驗證錯誤訊息
 * @param errors - 驗證錯誤陣列
 * @returns 格式化後的錯誤訊息
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  return errors.map((error) => `${error.field}: ${error.message}`).join(', ');
}

/**
 * 檢查 Email 格式
 * @param email - Email 字串
 * @returns 是否為有效的 Email 格式
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 檢查電話號碼格式
 * @param phone - 電話號碼字串
 * @returns 是否為有效的電話號碼格式
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[0-9+\-() ]+$/;
  return phoneRegex.test(phone);
}

/**
 * 檢查字串是否為空白
 * @param str - 字串
 * @returns 是否為空白
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}
