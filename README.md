# Browser-Based Lottery System (抽獎系統)

**Version**: 1.0.0
**Status**: 🎉 Production Ready - All 124 Tasks Complete
**Tech Stack**: Next.js 14, React 18, TypeScript 5, Framer Motion, SQLite WASM

---

## 📋 專案簡介

單機版網頁抽獎系統，完全運作於瀏覽器端，支援離線使用。提供公平的隨機抽獎、吃角子老虎機視覺特效、參與者管理與結果匯出等功能。

### 核心功能

- ✅ **活動管理**：建立、編輯與管理抽獎活動
- ✅ **參與者管理**：手動新增或批次匯入（CSV/JSON）
- ✅ **獎項管理**：設定獎項名稱、數量與排序
- ✅ **抽獎執行**：吃角子老虎機動畫 + Fisher-Yates 隨機演算法
- ✅ **結果管理**：查看、匯出抽獎結果（CSV/JSON）
- ✅ **公開前台**：活動瀏覽、中獎名單與查詢功能
- ✅ **管理端保護**：簡易密碼驗證 + Session 管理
- ✅ **隱私保護**：ID 遮罩功能（顯示前 6 字元）

---

## 🚀 快速開始

### 環境需求

- **Node.js**: ≥ 18.17.0 (推薦 20.x LTS)
- **npm**: ≥ 9.x
- **瀏覽器**: Chrome / Firefox / Safari / Edge（最近 2 年版本）

### 安裝與啟動

```bash
# 1. 安裝依賴
npm install

# 2. 啟動開發伺服器
npm run dev

# 3. 開啟瀏覽器
# 公開前台: http://localhost:3000
# 管理端: http://localhost:3000/admin
```

### 初次使用

1. 前往 `http://localhost:3000/admin/login`
2. 設定管理員密碼（首次登入）
3. 建立第一個抽獎活動
4. 新增參與者（手動或批次匯入 CSV）
5. 設定獎項與數量
6. 開始抽獎！

### 建置與部署

```bash
# 建置專案
npm run build

# 靜態匯出（完全離線使用）
npm run export

# 預覽建置結果
npm run start
```

---

## 📂 專案結構

```
lottery-v1/
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (public)/            # 公開前台
│   │   │   ├── page.tsx         # 首頁（活動列表）
│   │   │   ├── events/          # 活動瀏覽
│   │   │   │   ├── page.tsx     # 活動列表
│   │   │   │   └── [id]/        # 活動詳情
│   │   │   └── winners/         # 中獎查詢
│   │   └── admin/               # 管理端
│   │       ├── login/           # 登入頁
│   │       ├── events/          # 活動管理
│   │       ├── draw/[eventId]/  # 抽獎執行
│   │       └── results/[eventId]/ # 結果管理
│   ├── components/              # React 元件
│   │   ├── common/              # 通用元件
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Toast.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   ├── admin/               # 管理端元件
│   │   ├── public/              # 公開前台元件
│   │   ├── lottery/             # 抽獎元件
│   │   │   ├── SlotMachine.tsx  # 吃角子老虎機動畫
│   │   │   ├── PrizeSelector.tsx
│   │   │   └── WinnerDisplay.tsx
│   │   └── results/             # 結果元件
│   ├── lib/                     # 核心函式庫
│   │   ├── database/            # 資料庫操作
│   │   │   ├── storage.ts       # localStorage wrapper
│   │   │   ├── sqlite.ts        # SQLite WASM
│   │   │   └── migrations.ts    # 遷移管理
│   │   ├── auth/                # 認證功能
│   │   ├── lottery/             # 抽獎邏輯
│   │   │   ├── algorithm.ts     # Fisher-Yates 演算法
│   │   │   ├── validator.ts     # 前置條件驗證
│   │   │   └── executor.ts      # 抽獎流程協調
│   │   ├── data/                # 資料 CRUD
│   │   ├── import/              # CSV/JSON 匯入
│   │   ├── export/              # CSV/JSON 匯出
│   │   └── utils/               # 工具函式
│   │       ├── privacy.ts       # ID 遮罩
│   │       ├── date.ts          # 日期格式化
│   │       └── storage.ts       # 儲存空間監控
│   ├── types/                   # TypeScript 型別
│   ├── contexts/                # React Context
│   │   └── DrawContext.tsx      # 抽獎狀態管理
│   └── styles/                  # 全域樣式
├── tests/                       # 測試檔案
├── specs/                       # 功能規格文件
└── README.md
```

---

## 🎯 功能特色

### 1. 公平抽獎演算法

採用 **Fisher-Yates Shuffle Algorithm** 確保隨機性：

```typescript
// 無偏差隨機排序
export function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
```

### 2. 吃角子老虎機動畫

使用 **Framer Motion** 實現流暢的 60fps 動畫：

- **階段 1**: 快速捲動（60% 時長）
- **階段 2**: 減速停止（40% 時長，Bezier 曲線）
- **階段 3**: 中獎者揭曉動畫

### 3. 隱私保護機制

```typescript
// ID 遮罩範例
maskNationalId('A123456789')  // → 'A12345****'
maskEmployeeId('EMP20240001')  // → 'EMP200****'
maskEmail('john@example.com')  // → 'jo****@example.com'
```

### 4. 多格式資料匯出

- **CSV**: Excel 相容（含 BOM），適合列印
- **JSON**: 完整備份，適合程式處理
- **匯出範圍**: 全部結果、單一獎項、完整備份

### 5. 儲存空間監控

```typescript
const { info, warningLevel } = getStorageMonitorData();
// info.usagePercent → 使用百分比
// warningLevel → 'safe' | 'warning' | 'critical' | 'full'
```

---

## 💾 資料架構

### 儲存策略

```
Browser Storage Layer
├── localStorage (5-10 MB)
│   ├── 管理員認證資料（SHA-256 hash）
│   ├── Session token (sessionStorage)
│   └── 系統設定
│
└── SQLite WASM (結構化資料)
    ├── events (活動)
    ├── prizes (獎項)
    ├── participants (參與者)
    ├── event_participants (關聯表)
    └── drawing_results (抽獎結果)
```

### 資料模型

```typescript
// 核心實體
interface LotteryEvent {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
  allowDuplicateWinners: boolean;
  // ... timestamps
}

interface Prize {
  id: string;
  eventId: string;
  name: string;
  totalQuantity: number;
  remainingQuantity: number;
  displayOrder: number;
}

interface DrawingResult {
  id: string;
  eventId: string;
  prizeId: string;
  participantId: string;
  drawnAt: string;
  drawSequence: number;
  status: 'confirmed' | 'cancelled';
}
```

---

## 🧪 測試

### 單元測試（Vitest）

```bash
npm test                 # 執行所有測試
npm run test:watch       # Watch mode
npm run test:coverage    # 覆蓋率報告
```

### E2E 測試（Playwright）

```bash
npm run test:e2e         # 執行 E2E 測試
npm run test:e2e:ui      # UI 模式
npm run test:e2e:debug   # 偵錯模式
```

### 程式碼品質

```bash
npm run lint             # ESLint 檢查
npm run lint:fix         # 自動修正
```

---

## 🛡️ 安全性

### 管理端保護

- ✅ **密碼驗證**：SHA-256 hash 儲存於 localStorage
- ✅ **Session 管理**：30 分鐘逾時（sessionStorage token）
- ✅ **路由保護**：ProtectedRoute 元件檢查
- ✅ **登入頁面**：簡易密碼設定介面

### 隱私保護

- ✅ **ID 遮罩**：公開頁面顯示前 6 字元
- ✅ **完整匯出**：管理員可匯出完整資料
- ✅ **遮罩函式**：員工編號、身分證字號、Email、電話

### ⚠️ 安全性限制（純前端架構）

**重要提示**：
- localStorage 資料可透過開發者工具查看（明文儲存）
- 前端驗證可被技術熟練者繞過
- **建議使用環境**：個人電腦、專用裝置、活動現場
- **不建議使用環境**：公共電腦、不受信任的網路環境

---

## 📦 技術堆疊

### 核心技術

| 技術 | 版本 | 用途 |
|------|------|------|
| **Next.js** | 14.2+ | App Router, SSG, Routing |
| **React** | 18+ | UI 框架 |
| **TypeScript** | 5.x | 型別安全 |
| **Framer Motion** | Latest | 動畫效果（LazyMotion 優化） |
| **Tailwind CSS** | 4.x | 樣式框架 |
| **Zod** | 3.x | 資料驗證 |

### 資料儲存

- **localStorage**: 認證、設定（5-10 MB 限制）
- **SQLite WASM** (sql.js): 結構化資料
- **SessionStorage**: Session token

### 測試與品質

- **Vitest**: 單元測試 + React Testing Library
- **Playwright**: E2E 測試（Chrome, Firefox, Safari）
- **ESLint + Prettier**: 程式碼規範

---

## 📝 開發進度

### ✅ Phase 1: Setup (10/10 tasks)
- Next.js 14 專案初始化
- TypeScript 嚴格模式
- ESLint + Prettier
- Vitest 測試環境
- Playwright E2E 配置

### ✅ Phase 2: Foundational Infrastructure (17/17 tasks)
- TypeScript interfaces & Zod schemas
- localStorage wrapper
- SQLite WASM 初始化
- Database schema + migrations
- 認證系統（密碼 hash, session）
- ProtectedRoute 元件

### ✅ Phase 3: Event Management (25/25 tasks)
- Event CRUD
- Prize CRUD
- Participant CRUD
- CSV/JSON 匯入
- 活動管理 UI
- 獎項管理 UI
- 參與者管理 UI

### ✅ Phase 4: Lottery Drawing (21/21 tasks)
- Fisher-Yates 演算法
- 前置條件驗證
- 抽獎執行流程
- SlotMachine 動畫元件
- DrawContext 狀態管理
- 抽獎頁面 UI

### ✅ Phase 5: Results Management (14/14 tasks)
- CSV 匯出
- JSON 匯出
- 匯出工作流程
- 結果列表元件
- 篩選與搜尋
- 結果管理頁面

### ✅ Phase 6: Public Frontend (10/10 tasks)
- EventCard 元件
- WinnerList 元件
- 公開首頁
- 活動列表頁
- 活動詳情頁
- 中獎查詢頁

### ✅ Phase 7: Polish & Optimization (27/27 tasks)
- ✅ SQL 索引優化檢查
- ✅ 資料分頁功能（參與者列表 50 筆/頁）
- ✅ Framer Motion LazyMotion 驗證
- ✅ Session idle timeout (30分鐘)
- ✅ ConfirmDialog 完善（所有破壞性操作）
- ✅ 儲存空間使用率監控
- ✅ 定期匯出提醒系統（7/14/30天提醒）
- ✅ Loading 狀態（登入、匯入、匯出）
- ✅ 登入速率限制（5次/5分鐘鎖定）
- ✅ 安全提示與警告
- ✅ ErrorBoundary 元件
- ✅ Toast 通知系統
- ✅ 使用者手冊 (docs/user-manual.md)
- ✅ README 更新

**總進度**: 124/124 tasks completed (100%)

---

## 🚀 部署指南

### 靜態部署（推薦）

```bash
# 1. 建置靜態檔案
npm run build

# 2. 輸出靜態網站
npm run export

# 3. 部署 out/ 目錄至任何靜態主機
# - GitHub Pages
# - Netlify
# - Vercel
# - 本機 HTTP Server
```

### 本機離線使用

```bash
# 使用 Python HTTP Server
cd out
python -m http.server 8000

# 或使用 Node.js serve
npx serve out
```

---

## 📚 文件

### 規格文件（specs/001-browser-lottery-system/）

- **spec.md**: 功能規格（User Stories, Requirements）
- **plan.md**: 實作計畫（Tech Stack, Architecture）
- **data-model.md**: 資料模型（ERD, Schemas）
- **research.md**: 技術研究（Framer Motion, Vitest, 認證）
- **quickstart.md**: 快速開始指南
- **tasks.md**: 任務分解（124 tasks）

### API 合約

- **contracts/data-schemas.ts**: TypeScript interfaces + Zod schemas

---

## 🚨 已知限制

1. **儲存空間**：localStorage 典型限制 5-10 MB
   - 建議：定期匯出備份，刪除舊活動

2. **單一裝置**：資料無法跨裝置同步
   - 緩解：使用匯出/匯入功能轉移資料

3. **安全性**：純前端架構，localStorage 明文儲存
   - 緩解：僅在安全環境使用、UI 遮罩、使用提示

4. **瀏覽器需求**：需支援 WASM
   - 支援：Chrome, Firefox, Safari, Edge（最近 2 年版本）

5. **效能限制**：大量參與者（>1000 人）可能影響動畫流暢度
   - 緩解：LazyMotion 優化、調整動畫時長

---

## 🤝 貢獻

本專案遵循 [Specify 工作流程](https://specify.sh/)：

```bash
/speckit.specify    # 建立功能規格
/speckit.plan       # 生成實作計畫
/speckit.tasks      # 分解任務
/speckit.implement  # 執行實作
```

---

## 📄 授權

MIT License

---

## 🔗 相關連結

- **Next.js 文件**: https://nextjs.org/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Vitest**: https://vitest.dev/
- **Playwright**: https://playwright.dev/
- **SQLite WASM**: https://sql.js.org/
- **Tailwind CSS**: https://tailwindcss.com/
- **Zod**: https://zod.dev/

---

**最後更新**: 2025-10-25
**狀態**: 🎉 100% Complete - Production Ready!
**版本**: v1.0.0
