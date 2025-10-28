/**
 * Data Schemas & Type Definitions
 * Browser-Based Lottery System
 *
 * 本檔案定義所有資料實體的 TypeScript 介面與 Zod 驗證 schemas
 *
 * @version 1.0.0
 * @date 2025-10-24
 */

import { z } from 'zod';

// ============================================================================
// 1. LOTTERY EVENT (抽獎活動)
// ============================================================================

/**
 * 活動狀態列舉
 */
export const EventStatus = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const;

export type EventStatusType = (typeof EventStatus)[keyof typeof EventStatus];

/**
 * 抽獎活動實體
 */
export interface LotteryEvent {
  /** 活動唯一識別碼（UUID v4） */
  id: string;

  /** 活動名稱（必填，1-100 字元） */
  name: string;

  /** 活動描述（選填，最多 500 字元） */
  description: string | null;

  /** 活動建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 活動更新時間（ISO 8601 格式） */
  updatedAt: string;

  /** 預定抽獎日期時間（ISO 8601 格式，不得早於當前日期） */
  scheduledAt: string;

  /**
   * 活動狀態
   * - draft: 草稿（尚未完成設定）
   * - active: 進行中（可執行抽獎）
   * - completed: 已完成（所有獎項已抽出）
   * - archived: 已封存
   */
  status: EventStatusType;

  /**
   * 是否允許重複中獎
   * - false (預設): 同一參與者只能中獎一次
   * - true: 同一參與者可以中多個獎項
   */
  allowDuplicateWinners: boolean;

  /** 參與者總數（快取欄位） */
  participantCount: number;

  /** 獎項總數（快取欄位） */
  prizeCount: number;

  /** 已抽出的中獎者總數（快取欄位） */
  drawnWinnersCount: number;
}

/**
 * 活動建立輸入資料
 */
export interface CreateEventInput {
  name: string;
  description?: string | null;
  scheduledAt: string;
  allowDuplicateWinners?: boolean;
}

/**
 * 活動更新輸入資料
 */
export interface UpdateEventInput {
  name?: string;
  description?: string | null;
  scheduledAt?: string;
  allowDuplicateWinners?: boolean;
  status?: EventStatusType;
}

/**
 * 活動資料驗證 schema
 */
const LotteryEventSchema = z.object({
  id: z.string().uuid('ID 必須為有效的 UUID 格式'),
  name: z
    .string()
    .min(1, '活動名稱不可為空')
    .max(100, '活動名稱不可超過 100 字元')
    .trim(),
  description: z
    .string()
    .max(500, '活動描述不可超過 500 字元')
    .nullable(),
  createdAt: z.string().datetime('建立時間必須為 ISO 8601 格式'),
  updatedAt: z.string().datetime('更新時間必須為 ISO 8601 格式'),
  scheduledAt: z
    .string()
    .datetime('預定時間必須為 ISO 8601 格式')
    .refine((date) => new Date(date) >= new Date(), {
      message: '預定日期不可早於當前日期',
    }),
  status: z.enum(['draft', 'active', 'completed', 'archived'], {
    errorMap: () => ({ message: '無效的活動狀態' }),
  }),
  allowDuplicateWinners: z.boolean(),
  participantCount: z.number().int().min(0),
  prizeCount: z.number().int().min(0),
  drawnWinnersCount: z.number().int().min(0),
});

/**
 * 建立活動輸入驗證 schema
 */
const CreateEventInputSchema = z.object({
  name: z
    .string()
    .min(1, '活動名稱不可為空')
    .max(100, '活動名稱不可超過 100 字元')
    .trim(),
  description: z
    .string()
    .max(500, '活動描述不可超過 500 字元')
    .nullable()
    .optional(),
  scheduledAt: z
    .string()
    .datetime('預定時間必須為 ISO 8601 格式')
    .refine((date) => new Date(date) >= new Date(), {
      message: '預定日期不可早於當前日期',
    }),
  allowDuplicateWinners: z.boolean().optional().default(false),
});

/**
 * 更新活動輸入驗證 schema
 */
const UpdateEventInputSchema = z.object({
  name: z
    .string()
    .min(1, '活動名稱不可為空')
    .max(100, '活動名稱不可超過 100 字元')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, '活動描述不可超過 500 字元')
    .nullable()
    .optional(),
  scheduledAt: z
    .string()
    .datetime('預定時間必須為 ISO 8601 格式')
    .refine((date) => new Date(date) >= new Date(), {
      message: '預定日期不可早於當前日期',
    })
    .optional(),
  allowDuplicateWinners: z.boolean().optional(),
  status: z.enum(['draft', 'active', 'completed', 'archived']).optional(),
});

// ============================================================================
// 2. PRIZE (獎項)
// ============================================================================

/**
 * 獎項實體
 */
export interface Prize {
  /** 獎項唯一識別碼（UUID v4） */
  id: string;

  /** 所屬活動 ID（外鍵） */
  eventId: string;

  /** 獎項名稱（必填，1-100 字元） */
  name: string;

  /** 獎項描述（選填，最多 300 字元） */
  description: string | null;

  /** 獎項總數量（必填，≥1） */
  totalQuantity: number;

  /** 剩餘數量（初始值 = totalQuantity，每抽出一個 -1） */
  remainingQuantity: number;

  /**
   * 排序順序（數字越小越前面）
   * 預設：頭獎 = 1，貳獎 = 2，依此類推
   */
  displayOrder: number;

  /** 建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 更新時間（ISO 8601 格式） */
  updatedAt: string;
}

/**
 * 獎項建立輸入資料
 */
export interface CreatePrizeInput {
  eventId: string;
  name: string;
  description?: string | null;
  totalQuantity: number;
  displayOrder?: number;
}

/**
 * 獎項更新輸入資料
 */
export interface UpdatePrizeInput {
  name?: string;
  description?: string | null;
  totalQuantity?: number;
  displayOrder?: number;
}

/**
 * 獎項資料驗證 schema
 */
const PrizeSchema = z
  .object({
    id: z.string().uuid('ID 必須為有效的 UUID 格式'),
    eventId: z.string().uuid('活動 ID 必須為有效的 UUID 格式'),
    name: z
      .string()
      .min(1, '獎項名稱不可為空')
      .max(100, '獎項名稱不可超過 100 字元')
      .trim(),
    description: z
      .string()
      .max(300, '獎項描述不可超過 300 字元')
      .nullable(),
    totalQuantity: z
      .number()
      .int('總數量必須為整數')
      .min(1, '總數量至少為 1'),
    remainingQuantity: z
      .number()
      .int('剩餘數量必須為整數')
      .min(0, '剩餘數量不可為負數'),
    displayOrder: z.number().int('排序順序必須為整數').default(999),
    createdAt: z.string().datetime('建立時間必須為 ISO 8601 格式'),
    updatedAt: z.string().datetime('更新時間必須為 ISO 8601 格式'),
  })
  .refine((data) => data.remainingQuantity <= data.totalQuantity, {
    message: '剩餘數量不可大於總數量',
  });

/**
 * 建立獎項輸入驗證 schema
 */
const CreatePrizeInputSchema = z.object({
  eventId: z.string().uuid('活動 ID 必須為有效的 UUID 格式'),
  name: z
    .string()
    .min(1, '獎項名稱不可為空')
    .max(100, '獎項名稱不可超過 100 字元')
    .trim(),
  description: z
    .string()
    .max(300, '獎項描述不可超過 300 字元')
    .nullable()
    .optional(),
  totalQuantity: z
    .number()
    .int('總數量必須為整數')
    .min(1, '總數量至少為 1'),
  displayOrder: z.number().int('排序順序必須為整數').optional().default(999),
});

/**
 * 更新獎項輸入驗證 schema
 */
const UpdatePrizeInputSchema = z.object({
  name: z
    .string()
    .min(1, '獎項名稱不可為空')
    .max(100, '獎項名稱不可超過 100 字元')
    .trim()
    .optional(),
  description: z
    .string()
    .max(300, '獎項描述不可超過 300 字元')
    .nullable()
    .optional(),
  totalQuantity: z
    .number()
    .int('總數量必須為整數')
    .min(1, '總數量至少為 1')
    .optional(),
  displayOrder: z.number().int('排序順序必須為整數').optional(),
});

// ============================================================================
// 3. PARTICIPANT (參與者)
// ============================================================================

/**
 * 參與者實體
 */
export interface Participant {
  /** 參與者唯一識別碼（UUID v4，系統自動生成） */
  id: string;

  /** 姓名（必填，1-100 字元） */
  name: string;

  /**
   * 員工編號（選填，最多 50 字元）
   * 注意：employeeId 與 nationalId 至少需提供一個
   */
  employeeId: string | null;

  /**
   * 身分證字號或護照號碼（選填，最多 50 字元）
   * 注意：employeeId 與 nationalId 至少需提供一個
   */
  nationalId: string | null;

  /** 電子郵件（選填，最多 100 字元） */
  email: string | null;

  /** 電話號碼（選填，最多 20 字元） */
  phone: string | null;

  /** 建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 更新時間（ISO 8601 格式） */
  updatedAt: string;
}

/**
 * 參與者顯示資料（UI 用，ID 已遮罩）
 */
export interface ParticipantDisplayData
  extends Omit<Participant, 'employeeId' | 'nationalId'> {
  /** 遮罩後的員工編號（例：A12345****） */
  maskedEmployeeId: string | null;

  /** 遮罩後的身分證字號（例：A12345****） */
  maskedNationalId: string | null;
}

/**
 * 參與者建立輸入資料
 */
export interface CreateParticipantInput {
  name: string;
  employeeId?: string | null;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * 參與者更新輸入資料
 */
export interface UpdateParticipantInput {
  name?: string;
  employeeId?: string | null;
  nationalId?: string | null;
  email?: string | null;
  phone?: string | null;
}

/**
 * 參與者資料驗證 schema
 */
const ParticipantSchema = z
  .object({
    id: z.string().uuid('ID 必須為有效的 UUID 格式'),
    name: z
      .string()
      .min(1, '姓名不可為空')
      .max(100, '姓名不可超過 100 字元')
      .trim(),
    employeeId: z
      .string()
      .max(50, '員工編號不可超過 50 字元')
      .nullable(),
    nationalId: z
      .string()
      .max(50, '身分證字號不可超過 50 字元')
      .nullable(),
    email: z
      .string()
      .email('Email 格式不正確')
      .max(100, 'Email 不可超過 100 字元')
      .nullable()
      .or(z.literal(null)),
    phone: z
      .string()
      .max(20, '電話號碼不可超過 20 字元')
      .regex(/^[0-9+\-() ]*$/, '電話號碼格式不正確')
      .nullable()
      .or(z.literal(null)),
    createdAt: z.string().datetime('建立時間必須為 ISO 8601 格式'),
    updatedAt: z.string().datetime('更新時間必須為 ISO 8601 格式'),
  })
  .refine((data) => data.employeeId !== null || data.nationalId !== null, {
    message: '員工編號與身分證字號至少需提供一個',
  });

/**
 * 建立參與者輸入驗證 schema
 */
const CreateParticipantInputSchema = z
  .object({
    name: z
      .string()
      .min(1, '姓名不可為空')
      .max(100, '姓名不可超過 100 字元')
      .trim(),
    employeeId: z
      .string()
      .max(50, '員工編號不可超過 50 字元')
      .nullable()
      .optional(),
    nationalId: z
      .string()
      .max(50, '身分證字號不可超過 50 字元')
      .nullable()
      .optional(),
    email: z
      .string()
      .email('Email 格式不正確')
      .max(100, 'Email 不可超過 100 字元')
      .nullable()
      .optional(),
    phone: z
      .string()
      .max(20, '電話號碼不可超過 20 字元')
      .regex(/^[0-9+\-() ]*$/, '電話號碼格式不正確')
      .nullable()
      .optional(),
  })
  .refine((data) => data.employeeId !== null || data.nationalId !== null, {
    message: '員工編號與身分證字號至少需提供一個',
  });

/**
 * 更新參與者輸入驗證 schema
 */
const UpdateParticipantInputSchema = z.object({
  name: z
    .string()
    .min(1, '姓名不可為空')
    .max(100, '姓名不可超過 100 字元')
    .trim()
    .optional(),
  employeeId: z
    .string()
    .max(50, '員工編號不可超過 50 字元')
    .nullable()
    .optional(),
  nationalId: z
    .string()
    .max(50, '身分證字號不可超過 50 字元')
    .nullable()
    .optional(),
  email: z
    .string()
    .email('Email 格式不正確')
    .max(100, 'Email 不可超過 100 字元')
    .nullable()
    .optional(),
  phone: z
    .string()
    .max(20, '電話號碼不可超過 20 字元')
    .regex(/^[0-9+\-() ]*$/, '電話號碼格式不正確')
    .nullable()
    .optional(),
});

// ============================================================================
// 4. DRAWING RESULT (抽獎結果)
// ============================================================================

/**
 * 抽獎結果狀態列舉
 */
export const DrawingResultStatus = {
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
} as const;

export type DrawingResultStatusType =
  (typeof DrawingResultStatus)[keyof typeof DrawingResultStatus];

/**
 * 抽獎結果實體
 */
export interface DrawingResult {
  /** 抽獎結果唯一識別碼（UUID v4） */
  id: string;

  /** 所屬活動 ID（外鍵） */
  eventId: string;

  /** 獎項 ID（外鍵） */
  prizeId: string;

  /** 中獎參與者 ID（外鍵） */
  participantId: string;

  /** 抽獎時間（ISO 8601 格式） */
  drawnAt: string;

  /**
   * 該獎項的第幾個中獎者（序號）
   * 例：頭獎共 3 名，此欄位為 1, 2, 3
   */
  drawSequence: number;

  /**
   * 結果狀態
   * - confirmed: 已確認（正常狀態）
   * - cancelled: 已取消（管理員撤銷）
   */
  status: DrawingResultStatusType;

  /** 備註（選填，管理員可註記） */
  notes: string | null;
}

/**
 * 抽獎結果完整資訊（含關聯資料）
 */
export interface DrawingResultWithDetails extends DrawingResult {
  /** 獎項資訊 */
  prize: Prize;

  /** 參與者資訊（ID 已遮罩） */
  participant: ParticipantDisplayData;

  /** 活動名稱 */
  eventName: string;
}

/**
 * 抽獎結果建立輸入資料
 */
export interface CreateDrawingResultInput {
  eventId: string;
  prizeId: string;
  participantId: string;
  drawSequence: number;
  notes?: string | null;
}

/**
 * 抽獎結果驗證 schema
 */
const DrawingResultSchema = z.object({
  id: z.string().uuid('ID 必須為有效的 UUID 格式'),
  eventId: z.string().uuid('活動 ID 必須為有效的 UUID 格式'),
  prizeId: z.string().uuid('獎項 ID 必須為有效的 UUID 格式'),
  participantId: z.string().uuid('參與者 ID 必須為有效的 UUID 格式'),
  drawnAt: z.string().datetime('抽獎時間必須為 ISO 8601 格式'),
  drawSequence: z
    .number()
    .int('抽獎序號必須為整數')
    .min(1, '抽獎序號至少為 1'),
  status: z.enum(['confirmed', 'cancelled'], {
    errorMap: () => ({ message: '無效的結果狀態' }),
  }),
  notes: z.string().max(500, '備註不可超過 500 字元').nullable(),
});

/**
 * 建立抽獎結果輸入驗證 schema
 */
const CreateDrawingResultInputSchema = z.object({
  eventId: z.string().uuid('活動 ID 必須為有效的 UUID 格式'),
  prizeId: z.string().uuid('獎項 ID 必須為有效的 UUID 格式'),
  participantId: z.string().uuid('參與者 ID 必須為有效的 UUID 格式'),
  drawSequence: z
    .number()
    .int('抽獎序號必須為整數')
    .min(1, '抽獎序號至少為 1'),
  notes: z
    .string()
    .max(500, '備註不可超過 500 字元')
    .nullable()
    .optional(),
});

// ============================================================================
// 5. ADMIN AUTH (管理員認證)
// ============================================================================

/**
 * 管理員認證資料（localStorage）
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
 * Session token（sessionStorage）
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
 * 管理員認證資料驗證 schema
 */
const AdminAuthSchema = z.object({
  passwordHash: z.string().length(64, 'passwordHash 必須為 64 字元的 SHA-256 hash'),
  passwordSetAt: z.string().datetime('密碼設定時間必須為 ISO 8601 格式'),
  lastLoginAt: z.string().datetime('上次登入時間必須為 ISO 8601 格式').nullable(),
});

/**
 * Session token 驗證 schema
 */
const AdminSessionSchema = z.object({
  token: z.string().uuid('Session token 必須為有效的 UUID 格式'),
  createdAt: z.string().datetime('建立時間必須為 ISO 8601 格式'),
  lastActivityAt: z.string().datetime('上次活動時間必須為 ISO 8601 格式'),
});

// ============================================================================
// 6. IMPORT / EXPORT FORMATS (匯入/匯出格式)
// ============================================================================

/**
 * CSV 匯入參與者資料（單列）
 */
export interface ParticipantImportRow {
  /** 姓名 */
  name: string;

  /** 員工編號 */
  employeeId?: string;

  /** 身分證字號 */
  nationalId?: string;

  /** Email */
  email?: string;

  /** 電話 */
  phone?: string;
}

/**
 * 匯入結果
 */
export interface ImportResult {
  /** 成功匯入數量 */
  successCount: number;

  /** 失敗數量 */
  failureCount: number;

  /** 跳過數量（重複資料） */
  skippedCount: number;

  /** 錯誤訊息列表 */
  errors: ImportError[];

  /** 成功匯入的參與者 ID 列表 */
  importedParticipantIds: string[];
}

/**
 * 匯入錯誤
 */
export interface ImportError {
  /** 錯誤發生的列號（從 1 開始） */
  rowNumber: number;

  /** 該列的原始資料 */
  rowData: ParticipantImportRow;

  /** 錯誤訊息 */
  errorMessage: string;
}

/**
 * CSV 匯出中獎者資料（單列）
 */
export interface WinnerExportRow {
  /** 活動名稱 */
  eventName: string;

  /** 獎項名稱 */
  prizeName: string;

  /** 中獎序號 */
  drawSequence: number;

  /** 姓名 */
  name: string;

  /** 員工編號（完整資料，未遮罩） */
  employeeId: string;

  /** 身分證字號（完整資料，未遮罩） */
  nationalId: string;

  /** Email */
  email: string;

  /** 電話 */
  phone: string;

  /** 抽獎時間 */
  drawnAt: string;
}

/**
 * JSON 匯出完整資料備份
 */
export interface EventBackupData {
  /** 資料版本 */
  version: string;

  /** 匯出時間 */
  exportedAt: string;

  /** 活動資料 */
  event: LotteryEvent;

  /** 獎項列表 */
  prizes: Prize[];

  /** 參與者列表 */
  participants: Participant[];

  /** 抽獎結果列表 */
  drawingResults: DrawingResult[];
}

/**
 * 參與者匯入資料驗證 schema
 */
const ParticipantImportRowSchema = z
  .object({
    name: z
      .string()
      .min(1, '姓名不可為空')
      .max(100, '姓名不可超過 100 字元')
      .trim(),
    employeeId: z
      .string()
      .max(50, '員工編號不可超過 50 字元')
      .optional(),
    nationalId: z
      .string()
      .max(50, '身分證字號不可超過 50 字元')
      .optional(),
    email: z
      .string()
      .email('Email 格式不正確')
      .max(100, 'Email 不可超過 100 字元')
      .optional(),
    phone: z
      .string()
      .max(20, '電話號碼不可超過 20 字元')
      .regex(/^[0-9+\-() ]*$/, '電話號碼格式不正確')
      .optional(),
  })
  .refine(
    (data) => data.employeeId !== undefined || data.nationalId !== undefined,
    {
      message: '員工編號與身分證字號至少需提供一個',
    }
  );

// ============================================================================
// 7. UTILITY TYPES (輔助型別)
// ============================================================================

/**
 * 分頁查詢參數
 */
export interface PaginationParams {
  /** 頁碼（從 1 開始） */
  page: number;

  /** 每頁筆數 */
  pageSize: number;
}

/**
 * 分頁查詢結果
 */
export interface PaginatedResult<T> {
  /** 資料列表 */
  data: T[];

  /** 總筆數 */
  total: number;

  /** 當前頁碼 */
  page: number;

  /** 每頁筆數 */
  pageSize: number;

  /** 總頁數 */
  totalPages: number;

  /** 是否有下一頁 */
  hasNextPage: boolean;

  /** 是否有上一頁 */
  hasPreviousPage: boolean;
}

/**
 * 排序參數
 */
export interface SortParams {
  /** 排序欄位 */
  field: string;

  /** 排序方向 */
  order: 'asc' | 'desc';
}

/**
 * 查詢過濾參數（活動）
 */
export interface EventFilterParams {
  /** 狀態過濾 */
  status?: EventStatusType;

  /** 關鍵字搜尋（名稱或描述） */
  keyword?: string;

  /** 開始日期範圍 */
  startDate?: string;

  /** 結束日期範圍 */
  endDate?: string;
}

/**
 * 查詢過濾參數（參與者）
 */
export interface ParticipantFilterParams {
  /** 活動 ID（查詢特定活動的參與者） */
  eventId?: string;

  /** 關鍵字搜尋（姓名、員工編號、身分證字號） */
  keyword?: string;
}

/**
 * 儲存空間資訊
 */
export interface StorageInfo {
  /** localStorage 已使用空間（bytes） */
  localStorageUsed: number;

  /** localStorage 總空間（bytes） */
  localStorageTotal: number;

  /** localStorage 使用率（0-1） */
  localStorageUsageRatio: number;

  /** SQLite WASM database 大小（bytes） */
  sqliteDatabaseSize: number;

  /** 是否接近儲存空間上限 */
  isNearLimit: boolean;
}

/**
 * 系統設定
 */
export interface SystemSettings {
  /** Session idle timeout（分鐘） */
  sessionIdleTimeout: number;

  /** 動畫持續時間（秒） */
  animationDuration: number;

  /** 每頁顯示筆數（預設值） */
  defaultPageSize: number;

  /** 是否啟用音效 */
  soundEnabled: boolean;

  /** 語言設定 */
  language: 'zh-TW';
}

/**
 * 資料版本資訊
 */
export interface DataVersion {
  /** 資料版本號 */
  version: string;

  /** 建立時間 */
  createdAt: string;

  /** 上次遷移時間 */
  lastMigrationAt: string | null;
}

// ============================================================================
// 8. TYPE GUARDS (型別守衛)
// ============================================================================

/**
 * 檢查是否為有效的活動狀態
 */
function isValidEventStatus(status: string): status is EventStatusType {
  return Object.values(EventStatus).includes(status as EventStatusType);
}

/**
 * 檢查是否為有效的抽獎結果狀態
 */
function isValidDrawingResultStatus(
  status: string
): status is DrawingResultStatusType {
  return Object.values(DrawingResultStatus).includes(
    status as DrawingResultStatusType
  );
}

// ============================================================================
// 9. CONSTANTS (常數)
// ============================================================================

/**
 * localStorage keys
 */
const STORAGE_KEYS = {
  ADMIN_AUTH: 'lottery_admin_auth',
  ADMIN_SESSION: 'lottery_admin_session',
  DATA_VERSION: 'lottery_data_version',
  SYSTEM_SETTINGS: 'lottery_system_settings',
} as const;

/**
 * 預設值
 */
const DEFAULTS = {
  PAGE_SIZE: 20,
  SESSION_IDLE_TIMEOUT: 30, // 分鐘
  ANIMATION_DURATION: 5, // 秒
  MIN_PASSWORD_LENGTH: 8,
  STORAGE_WARNING_THRESHOLD: 0.8, // 80% 使用率時警告
} as const;

/**
 * 驗證規則常數
 */
const VALIDATION = {
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  EMPLOYEE_ID_MAX_LENGTH: 50,
  NATIONAL_ID_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MAX_LENGTH: 20,
  NOTES_MAX_LENGTH: 500,
} as const;

/**
 * ID 遮罩規則
 */
const ID_MASKING = {
  /** 顯示前 N 個字元 */
  VISIBLE_CHARS: 6,

  /** 遮罩字元 */
  MASK_CHAR: '*',
} as const;

// ============================================================================
// END OF FILE
// ============================================================================

/**
 * 匯出所有型別與 schemas
 */
export type {
  // Core entities
  LotteryEvent,
  Prize,
  Participant,
  DrawingResult,
  // Display data
  ParticipantDisplayData,
  DrawingResultWithDetails,
  // Input types
  CreateEventInput,
  UpdateEventInput,
  CreatePrizeInput,
  UpdatePrizeInput,
  CreateParticipantInput,
  UpdateParticipantInput,
  CreateDrawingResultInput,
  // Auth
  AdminAuth,
  AdminSession,
  // Import/Export
  ParticipantImportRow,
  ImportResult,
  ImportError,
  WinnerExportRow,
  EventBackupData,
  // Utility types
  PaginationParams,
  PaginatedResult,
  SortParams,
  EventFilterParams,
  ParticipantFilterParams,
  StorageInfo,
  SystemSettings,
  DataVersion,
};

export {
  // Schemas
  LotteryEventSchema,
  CreateEventInputSchema,
  UpdateEventInputSchema,
  PrizeSchema,
  CreatePrizeInputSchema,
  UpdatePrizeInputSchema,
  ParticipantSchema,
  CreateParticipantInputSchema,
  UpdateParticipantInputSchema,
  DrawingResultSchema,
  CreateDrawingResultInputSchema,
  AdminAuthSchema,
  AdminSessionSchema,
  ParticipantImportRowSchema,
  // Type guards
  isValidEventStatus,
  isValidDrawingResultStatus,
  // Constants
  STORAGE_KEYS,
  DEFAULTS,
  VALIDATION,
  ID_MASKING,
};
