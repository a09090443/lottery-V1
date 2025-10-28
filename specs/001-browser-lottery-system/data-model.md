# Data Model: Browser-Based Lottery System

**Feature**: 001-browser-lottery-system
**Date**: 2025-10-24
**Version**: 1.0.0

本文件定義抽獎系統的完整資料模型，包括實體關係、欄位定義、驗證規則與儲存策略。

---

## 資料架構概覽

### 儲存策略

本系統採用**雙層儲存架構**：

```
┌─────────────────────────────────────────────┐
│         Browser Storage Layer               │
├─────────────────────────────────────────────┤
│                                             │
│  localStorage (Primary)                     │
│  ├── 管理員認證資料                          │
│  ├── 系統設定                                │
│  └── 資料索引與快取                          │
│                                             │
│  SQLite WASM (Structured Data)              │
│  ├── 活動資料 (events)                       │
│  ├── 參與者資料 (participants)               │
│  ├── 獎項資料 (prizes)                       │
│  ├── 抽獎結果 (drawing_results)              │
│  └── 關聯表 (event_participants)             │
│                                             │
│  IndexedDB (Fallback, 未來擴充)              │
│  └── 大型檔案儲存（如匯入的原始檔案）          │
│                                             │
└─────────────────────────────────────────────┘
```

**設計理由**：
- **localStorage**：簡單鍵值對，適合認證資料與設定
- **SQLite WASM**：結構化查詢，適合關聯式資料（活動、參與者、結果）
- **IndexedDB**：大型資料與檔案，未來擴充使用

---

## 核心實體定義

### 1. Lottery Event（抽獎活動）

**實體說明**：代表一場抽獎活動，包含活動基本資訊、時間範圍與抽獎規則設定。

#### TypeScript 介面

```typescript
/**
 * 抽獎活動實體
 */
export interface LotteryEvent {
  // === 基本資訊 ===
  /** 活動唯一識別碼（UUID v4） */
  id: string;

  /** 活動名稱（必填，1-100 字元） */
  name: string;

  /** 活動描述（選填，最多 500 字元） */
  description: string | null;

  // === 時間資訊 ===
  /** 活動建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 活動更新時間（ISO 8601 格式） */
  updatedAt: string;

  /** 預定抽獎日期時間（ISO 8601 格式，不得早於當前日期） */
  scheduledAt: string;

  // === 狀態管理 ===
  /**
   * 活動狀態
   * - draft: 草稿（尚未完成設定）
   * - active: 進行中（可執行抽獎）
   * - completed: 已完成（所有獎項已抽出）
   * - archived: 已封存
   */
  status: 'draft' | 'active' | 'completed' | 'archived';

  // === 抽獎規則 ===
  /**
   * 是否允許重複中獎
   * - false (預設): 同一參與者只能中獎一次
   * - true: 同一參與者可以中多個獎項
   */
  allowDuplicateWinners: boolean;

  // === 統計資訊 ===
  /** 參與者總數（快取欄位） */
  participantCount: number;

  /** 獎項總數（快取欄位） */
  prizeCount: number;

  /** 已抽出的中獎者總數（快取欄位） */
  drawnWinnersCount: number;
}
```

#### SQLite 資料表結構

```sql
CREATE TABLE events (
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

-- 索引：依狀態查詢
CREATE INDEX idx_events_status ON events(status);

-- 索引：依預定時間排序
CREATE INDEX idx_events_scheduled_at ON events(scheduled_at);
```

#### 驗證規則

| 欄位 | 規則 |
|-----|------|
| `name` | 必填，1-100 字元，不可全空白 |
| `description` | 選填，最多 500 字元 |
| `scheduledAt` | 必填，ISO 8601 格式，不得早於當前日期 |
| `status` | 必填，限定值：draft \| active \| completed \| archived |
| `allowDuplicateWinners` | 必填，布林值 |

#### 業務規則

1. **活動名稱唯一性**：同名活動允許存在（以 ID 區分）
2. **狀態轉換規則**：
   - `draft` → `active`：需至少有 1 個參與者與 1 個獎項
   - `active` → `completed`：所有獎項已抽出
   - 任何狀態 → `archived`：允許手動封存
3. **日期驗證**：`scheduledAt` 不得早於 `createdAt`
4. **刪除限制**：
   - `draft` 狀態：可直接刪除
   - 其他狀態：需先封存再刪除，或強制刪除（需確認對話框）

---

### 2. Prize（獎項）

**實體說明**：代表活動中的一個獎項類別，包含獎項名稱、數量與抽獎進度。

#### TypeScript 介面

```typescript
/**
 * 獎項實體
 */
export interface Prize {
  // === 基本資訊 ===
  /** 獎項唯一識別碼（UUID v4） */
  id: string;

  /** 所屬活動 ID（外鍵） */
  eventId: string;

  /** 獎項名稱（必填，1-100 字元） */
  name: string;

  /** 獎項描述（選填，最多 300 字元） */
  description: string | null;

  // === 數量管理 ===
  /** 獎項總數量（必填，≥1） */
  totalQuantity: number;

  /** 剩餘數量（初始值 = totalQuantity，每抽出一個 -1） */
  remainingQuantity: number;

  // === 排序與顯示 ===
  /**
   * 排序順序（數字越小越前面）
   * 預設：頭獎 = 1，貳獎 = 2，依此類推
   */
  displayOrder: number;

  // === 時間資訊 ===
  /** 建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 更新時間（ISO 8601 格式） */
  updatedAt: string;
}
```

#### SQLite 資料表結構

```sql
CREATE TABLE prizes (
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

-- 索引：依活動查詢獎項
CREATE INDEX idx_prizes_event_id ON prizes(event_id);

-- 索引：依排序順序顯示
CREATE INDEX idx_prizes_display_order ON prizes(event_id, display_order);
```

#### 驗證規則

| 欄位 | 規則 |
|-----|------|
| `name` | 必填，1-100 字元 |
| `description` | 選填，最多 300 字元 |
| `totalQuantity` | 必填，整數，≥1 |
| `remainingQuantity` | 自動計算，0 ≤ remainingQuantity ≤ totalQuantity |
| `displayOrder` | 選填，預設 999 |

#### 業務規則

1. **數量一致性**：`remainingQuantity` 必須等於 `totalQuantity` 減去已抽出的中獎者數
2. **刪除限制**：
   - 若已有中獎者，不可刪除獎項
   - 可修改 `totalQuantity`（但不可小於已抽出數量）
3. **抽獎完成判定**：`remainingQuantity = 0` 表示該獎項已抽完
4. **排序規則**：數字越小越優先顯示（頭獎 = 1，貳獎 = 2）

---

### 3. Participant（參與者）

**實體說明**：代表一位參與抽獎的人員，包含基本資料與唯一識別資訊。

#### TypeScript 介面

```typescript
/**
 * 參與者實體
 */
export interface Participant {
  // === 基本資訊 ===
  /** 參與者唯一識別碼（UUID v4，系統自動生成） */
  id: string;

  /** 姓名（必填，1-100 字元） */
  name: string;

  // === 身分識別（至少一個必填） ===
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

  // === 聯絡資訊（選填） ===
  /** 電子郵件（選填，最多 100 字元） */
  email: string | null;

  /** 電話號碼（選填，最多 20 字元） */
  phone: string | null;

  // === 時間資訊 ===
  /** 建立時間（ISO 8601 格式） */
  createdAt: string;

  /** 更新時間（ISO 8601 格式） */
  updatedAt: string;
}

/**
 * 參與者顯示資料（UI 用，ID 已遮罩）
 */
export interface ParticipantDisplayData extends Omit<Participant, 'employeeId' | 'nationalId'> {
  /** 遮罩後的員工編號（例：A12345****） */
  maskedEmployeeId: string | null;

  /** 遮罩後的身分證字號（例：A12345****） */
  maskedNationalId: string | null;
}
```

#### SQLite 資料表結構

```sql
CREATE TABLE participants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL CHECK(length(name) >= 1 AND length(name) <= 100),
  employee_id TEXT CHECK(employee_id IS NULL OR length(employee_id) <= 50),
  national_id TEXT CHECK(national_id IS NULL OR length(national_id) <= 50),
  email TEXT CHECK(email IS NULL OR length(email) <= 100),
  phone TEXT CHECK(phone IS NULL OR length(phone) <= 20),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- 至少需要一個身分識別欄位
  CHECK (employee_id IS NOT NULL OR national_id IS NOT NULL)
);

-- 索引：依姓名搜尋
CREATE INDEX idx_participants_name ON participants(name);

-- 索引：依員工編號搜尋
CREATE INDEX idx_participants_employee_id ON participants(employee_id) WHERE employee_id IS NOT NULL;

-- 索引：依身分證字號搜尋
CREATE INDEX idx_participants_national_id ON participants(national_id) WHERE national_id IS NOT NULL;
```

#### 關聯表：Event ↔ Participant（多對多）

```sql
CREATE TABLE event_participants (
  event_id TEXT NOT NULL,
  participant_id TEXT NOT NULL,
  added_at TEXT NOT NULL DEFAULT (datetime('now')),

  PRIMARY KEY (event_id, participant_id),
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (participant_id) REFERENCES participants(id) ON DELETE CASCADE
);

-- 索引：快速查詢特定活動的參與者
CREATE INDEX idx_event_participants_event_id ON event_participants(event_id);

-- 索引：快速查詢特定參與者參加的活動
CREATE INDEX idx_event_participants_participant_id ON event_participants(participant_id);
```

#### 驗證規則

| 欄位 | 規則 |
|-----|------|
| `name` | 必填，1-100 字元，不可全空白 |
| `employeeId` | 選填，最多 50 字元 |
| `nationalId` | 選填，最多 50 字元 |
| **身分識別約束** | `employeeId` 與 `nationalId` 至少需提供一個 |
| `email` | 選填，需符合 email 格式（RFC 5322 簡化版） |
| `phone` | 選填，最多 20 字元，允許數字、+、-、()、空白 |

#### 業務規則

1. **唯一性約束**（在同一活動內）：
   - `name + employeeId` 組合唯一（若 employeeId 存在）
   - `name + nationalId` 組合唯一（若 nationalId 存在）
   - 允許不同活動有相同參與者（共用參與者資料）

2. **ID 遮罩規則**（UI 顯示）：
   - 顯示前 6 個字元，其餘以 `*` 代替
   - 例：`A123456789` → `A12345****`
   - 若長度 ≤ 6，全部顯示

3. **ID 完整資料保留**（匯出與內部邏輯）：
   - localStorage/SQLite 儲存完整資料
   - 匯出 CSV/JSON 包含完整 ID
   - 內部查詢與驗證使用完整 ID

4. **批次匯入規則**：
   - CSV 格式：`姓名,員工編號,身分證字號,Email,電話`
   - 若同名 + 同 ID，視為重複，跳過並記錄
   - 允許姓名相同但 ID 不同（視為不同人）

---

### 4. Drawing Result（抽獎結果）

**實體說明**：記錄每一次抽獎的結果，包含中獎者、獎項與時間戳記。

#### TypeScript 介面

```typescript
/**
 * 抽獎結果實體
 */
export interface DrawingResult {
  // === 基本資訊 ===
  /** 抽獎結果唯一識別碼（UUID v4） */
  id: string;

  /** 所屬活動 ID（外鍵） */
  eventId: string;

  /** 獎項 ID（外鍵） */
  prizeId: string;

  /** 中獎參與者 ID（外鍵） */
  participantId: string;

  // === 抽獎資訊 ===
  /** 抽獎時間（ISO 8601 格式） */
  drawnAt: string;

  /**
   * 該獎項的第幾個中獎者（序號）
   * 例：頭獎共 3 名，此欄位為 1, 2, 3
   */
  drawSequence: number;

  // === 狀態管理 ===
  /**
   * 結果狀態
   * - confirmed: 已確認（正常狀態）
   * - cancelled: 已取消（管理員撤銷）
   */
  status: 'confirmed' | 'cancelled';

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
```

#### SQLite 資料表結構

```sql
CREATE TABLE drawing_results (
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

  -- 同一活動、同一獎項、同一參與者不可重複中獎（除非 allowDuplicateWinners = true）
  UNIQUE(event_id, prize_id, participant_id)
);

-- 索引：快速查詢特定活動的所有結果
CREATE INDEX idx_drawing_results_event_id ON drawing_results(event_id);

-- 索引：快速查詢特定獎項的所有中獎者
CREATE INDEX idx_drawing_results_prize_id ON drawing_results(prize_id);

-- 索引：快速查詢特定參與者的中獎記錄
CREATE INDEX idx_drawing_results_participant_id ON drawing_results(participant_id);

-- 索引：依抽獎時間排序
CREATE INDEX idx_drawing_results_drawn_at ON drawing_results(drawn_at);
```

#### 驗證規則

| 欄位 | 規則 |
|-----|------|
| `eventId` | 必填，需存在於 events 表 |
| `prizeId` | 必填，需存在於 prizes 表 |
| `participantId` | 必填，需存在於 participants 表且已加入該活動 |
| `drawSequence` | 必填，整數，≥1 |
| `status` | 必填，限定值：confirmed \| cancelled |
| `notes` | 選填，最多 500 字元 |

#### 業務規則

1. **重複中獎檢查**：
   - 若活動設定 `allowDuplicateWinners = false`：
     - 同一參與者不可中多個獎項
     - 抽獎前需檢查該參與者是否已有 `status = 'confirmed'` 的記錄
   - 若 `allowDuplicateWinners = true`：
     - 允許同一參與者中多個獎項
     - 但同一獎項不可重複中獎（由 UNIQUE 約束保證）

2. **抽獎序號規則**：
   - 每個獎項的 `drawSequence` 從 1 開始遞增
   - 例：頭獎 3 名，序號為 1, 2, 3

3. **取消抽獎結果**：
   - 管理員可將狀態改為 `cancelled`
   - 取消後該獎項的 `remainingQuantity` 需 +1
   - 取消後該參與者可重新參與抽獎

4. **刪除限制**：
   - 原則上不刪除抽獎結果（保留歷史記錄）
   - 若需修正錯誤，使用 `cancelled` 狀態而非刪除

---

### 5. Admin Auth（管理員認證）

**實體說明**：管理員密碼與 session 資訊，儲存於 localStorage。

#### TypeScript 介面

```typescript
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
```

#### localStorage 儲存結構

```typescript
// Key: 'lottery_admin_auth'
{
  "passwordHash": "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
  "passwordSetAt": "2025-10-24T12:00:00.000Z",
  "lastLoginAt": "2025-10-24T14:30:00.000Z"
}
```

#### sessionStorage 儲存結構

```typescript
// Key: 'lottery_admin_session'
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2025-10-24T14:30:00.000Z",
  "lastActivityAt": "2025-10-24T14:45:00.000Z"
}
```

#### 業務規則

1. **密碼要求**：
   - 長度至少 8 字元
   - 建議包含數字、字母、特殊符號（非強制）

2. **Session 逾時**：
   - 預設 30 分鐘無操作自動登出
   - 每次操作更新 `lastActivityAt`

3. **密碼重置**：
   - 需清除所有資料（localStorage + SQLite WASM database）
   - 顯示警告對話框確認

---

## 資料關聯圖（ERD）

```
┌─────────────────────┐
│  LotteryEvent       │
│  (events)           │
├─────────────────────┤
│ • id (PK)           │
│ • name              │
│ • scheduledAt       │
│ • allowDuplicate... │
│ • status            │
└──────┬──────────────┘
       │ 1
       │
       │ N
       ├──────────────┐
       │              │
       │              │
┌──────▼──────────────┴─┐         ┌─────────────────────┐
│  Prize                 │         │  event_participants │
│  (prizes)              │         │  (關聯表)           │
├────────────────────────┤         ├─────────────────────┤
│ • id (PK)              │         │ • event_id (PK, FK) │
│ • event_id (FK)        │         │ • participant_id    │
│ • name                 │         │   (PK, FK)          │
│ • totalQuantity        │         └──────┬──────────────┘
│ • remainingQuantity    │                │ N
└──────┬─────────────────┘                │
       │ 1                                │
       │                                  │
       │ N                         ┌──────▼──────────────┐
       │         ┌─────────────────▶  Participant        │
       │         │                 │  (participants)     │
       │         │                 ├─────────────────────┤
       │         │                 │ • id (PK)           │
       │         │                 │ • name              │
       │         │                 │ • employeeId        │
┌──────▼─────────┴────────┐        │ • nationalId        │
│  DrawingResult           │        │ • email             │
│  (drawing_results)       │        │ • phone             │
├──────────────────────────┤        └─────────────────────┘
│ • id (PK)                │
│ • event_id (FK)          │
│ • prize_id (FK)          │
│ • participant_id (FK)    │
│ • drawnAt                │
│ • drawSequence           │
│ • status                 │
└──────────────────────────┘
```

**關聯說明**：
- 1 個活動有 N 個獎項（1:N）
- 1 個活動有 N 個參與者（N:M，透過 event_participants 關聯表）
- 1 個獎項有 N 個抽獎結果（1:N）
- 1 個參與者有 N 個抽獎結果（1:N）
- 1 個抽獎結果關聯 1 個活動、1 個獎項、1 個參與者（N:1:1:1）

---

## 儲存空間估算

### 單筆資料大小估算

| 實體 | 估算大小（JSON） | 說明 |
|-----|----------------|------|
| LotteryEvent | ~300 bytes | 包含所有欄位與 ISO 時間字串 |
| Prize | ~200 bytes | 包含獎項資訊 |
| Participant | ~250 bytes | 包含完整資料（未遮罩） |
| DrawingResult | ~180 bytes | 包含關聯 ID 與時間戳記 |
| event_participants | ~80 bytes | 僅 ID 關聯 |

### 典型活動儲存空間需求

**小型活動（50 人，5 個獎項，10 個中獎者）**：
- Event: 300 bytes
- Prizes: 200 × 5 = 1 KB
- Participants: 250 × 50 = 12.5 KB
- event_participants: 80 × 50 = 4 KB
- DrawingResults: 180 × 10 = 1.8 KB
- **總計：約 19.6 KB**

**中型活動（500 人，10 個獎項，50 個中獎者）**：
- Event: 300 bytes
- Prizes: 200 × 10 = 2 KB
- Participants: 250 × 500 = 125 KB
- event_participants: 80 × 500 = 40 KB
- DrawingResults: 180 × 50 = 9 KB
- **總計：約 176.3 KB**

**大型活動（1000 人，20 個獎項，100 個中獎者）**：
- Event: 300 bytes
- Prizes: 200 × 20 = 4 KB
- Participants: 250 × 1000 = 250 KB
- event_participants: 80 × 1000 = 80 KB
- DrawingResults: 180 × 100 = 18 KB
- **總計：約 352.3 KB**

### localStorage 限制與對策

**localStorage 典型限制**：5-10 MB

**儲存策略**：
1. **監控機制**：實作儲存空間使用率監控
2. **警告機制**：當使用率超過 80% 時顯示警告
3. **清理建議**：
   - 封存舊活動（status = 'archived'）
   - 匯出並刪除已完成的活動
   - 清理取消的抽獎結果（status = 'cancelled'）
4. **分層儲存**：
   - localStorage：僅儲存認證與設定（< 1 KB）
   - SQLite WASM：所有業務資料（可達數 MB）
   - IndexedDB（未來）：大型檔案（如匯入原始檔）

---

## 資料驗證策略

### 使用 Zod 進行 Runtime 驗證

```typescript
import { z } from 'zod';

/**
 * 活動資料驗證 schema
 */
export const LotteryEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  scheduledAt: z.string().datetime().refine(
    (date) => new Date(date) >= new Date(),
    { message: '預定日期不可早於當前日期' }
  ),
  status: z.enum(['draft', 'active', 'completed', 'archived']),
  allowDuplicateWinners: z.boolean(),
  participantCount: z.number().int().min(0),
  prizeCount: z.number().int().min(0),
  drawnWinnersCount: z.number().int().min(0),
});

/**
 * 參與者資料驗證 schema
 */
export const ParticipantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  employeeId: z.string().max(50).nullable(),
  nationalId: z.string().max(50).nullable(),
  email: z.string().email().max(100).nullable().or(z.literal(null)),
  phone: z.string().max(20).regex(/^[0-9+\-() ]*$/).nullable().or(z.literal(null)),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).refine(
  (data) => data.employeeId !== null || data.nationalId !== null,
  { message: '員工編號與身分證字號至少需提供一個' }
);

/**
 * 獎項資料驗證 schema
 */
export const PrizeSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(300).nullable(),
  totalQuantity: z.number().int().min(1),
  remainingQuantity: z.number().int().min(0),
  displayOrder: z.number().int().default(999),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).refine(
  (data) => data.remainingQuantity <= data.totalQuantity,
  { message: '剩餘數量不可大於總數量' }
);

/**
 * 抽獎結果驗證 schema
 */
export const DrawingResultSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  prizeId: z.string().uuid(),
  participantId: z.string().uuid(),
  drawnAt: z.string().datetime(),
  drawSequence: z.number().int().min(1),
  status: z.enum(['confirmed', 'cancelled']),
  notes: z.string().max(500).nullable(),
});
```

---

## 資料遷移與版本控制

### 資料版本標記

在 localStorage 儲存資料版本資訊：

```typescript
// localStorage key: 'lottery_data_version'
{
  "version": "1.0.0",
  "createdAt": "2025-10-24T12:00:00.000Z",
  "lastMigrationAt": null
}
```

### 未來版本遷移策略

若未來需要更新資料結構（例如 v1.0.0 → v2.0.0）：

1. **檢查版本**：讀取 `lottery_data_version`
2. **執行遷移**：依版本執行對應的遷移函式
3. **更新版本**：寫入新版本號與遷移時間
4. **備份資料**：遷移前自動匯出備份

---

## 匯入/匯出格式規範

### CSV 匯入格式（參與者）

**檔案格式**：UTF-8 編碼，含標題列

```csv
姓名,員工編號,身分證字號,Email,電話
張三,E001,A123456789,zhang@example.com,0912345678
李四,E002,,li@example.com,0923456789
王五,,B987654321,wang@example.com,
```

**驗證規則**：
- 第一列為標題列（必須）
- 姓名必填
- 員工編號與身分證字號至少需一個
- Email 與電話選填

### CSV 匯出格式（中獎者）

```csv
活動名稱,獎項名稱,中獎序號,姓名,員工編號,身分證字號,Email,電話,抽獎時間
2025 年終抽獎,頭獎,1,張三,E001,A123456789,zhang@example.com,0912345678,2025-10-24T14:30:00.000Z
2025 年終抽獎,頭獎,2,李四,E002,B987654321,li@example.com,0923456789,2025-10-24T14:30:15.000Z
```

**說明**：
- 包含完整資料（未遮罩的 ID）
- 依抽獎時間排序
- 僅匯出 `status = 'confirmed'` 的結果

### JSON 匯出格式（完整資料備份）

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-24T15:00:00.000Z",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "2025 年終抽獎",
    ...
  },
  "prizes": [...],
  "participants": [...],
  "drawingResults": [...]
}
```

---

## 總結

本資料模型設計遵循以下原則：

1. **簡潔設計**：使用 localStorage + SQLite WASM 雙層儲存，不引入過度複雜的抽象層
2. **資料完整性**：透過外鍵約束與 CHECK 約束確保資料一致性
3. **效能考量**：建立適當索引，支援快速查詢
4. **隱私保護**：ID 遮罩機制，UI 顯示部分資訊，匯出包含完整資料
5. **可擴展性**：預留 IndexedDB 儲存方案，支援未來擴充
6. **可維護性**：使用 Zod 進行 runtime 驗證，TypeScript 提供編譯時型別安全

**下一步**：Phase 1 將繼續設計 API Contracts（TypeScript 介面與 Zod schemas）與 Quickstart 指南。

---

**文件版本**: 1.0.0
**最後更新**: 2025-10-24
**狀態**: ✅ Phase 1 資料模型設計完成
