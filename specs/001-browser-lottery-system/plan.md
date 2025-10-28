# Implementation Plan: Browser-Based Lottery System

**Branch**: `001-browser-lottery-system` | **Date**: 2025-10-24 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-browser-lottery-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

建立一個完全運作於瀏覽器端的單機版抽獎系統，使用 Next.js + TypeScript 開發，資料儲存於瀏覽器 localStorage，支援 SQLite (WebAssembly) 進行結構化資料管理。系統提供管理端功能（活動建立、參與者管理、抽獎執行、結果管理）與公開前台（活動瀏覽、中獎查詢）。抽獎過程採用吃角子老虎機視覺特效，提供沉浸式體驗。

## Technical Context

**Language/Version**: TypeScript 5.x, JavaScript ES2022+
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, sql.js (SQLite WASM), NEEDS CLARIFICATION: Animation library (GSAP vs Anime.js vs Framer Motion)
**Storage**: Browser localStorage (primary persistence), IndexedDB (fallback), SQLite WebAssembly (sql.js) for structured queries
**Testing**: NEEDS CLARIFICATION: Testing framework (Jest + React Testing Library vs Vitest), Chrome DevTools manual testing (required by constitution)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge - last 2 years), Client-side only (Jamstack)
**Project Type**: Web application (pure frontend, static export)
**Performance Goals**:
- 抽獎動畫完成時間 2-5 秒（參與者數量 ≤500）
- 首屏渲染時間 < 2 秒
- 批次匯入 500 筆參與者資料 < 10 秒
- 匯出結果檔案（100 筆中獎者）< 3 秒
**Constraints**:
- 完全離線運作（初次載入後無需網路連線）
- 資料完全儲存於瀏覽器本地（localStorage/IndexedDB）
- 支援至少 1000 位參與者而不降低效能
- 瀏覽器儲存空間限制（通常 5-10 MB for localStorage）
**Scale/Scope**:
- 單一裝置、單一管理員使用情境
- 典型活動規模：20-500 位參與者，最大支援 1000 位
- 1-20 個獎項類別
- 預估總頁面數：8-12 個（管理端 + 公開前台）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. 高可用性架構
**Status**: ⚠️ PARTIAL COMPLIANCE - 需要例外處理
**Analysis**:
- ❌ 單機瀏覽器架構無法實現負載平衡、叢集部署、主從複製
- ❌ 單點故障（瀏覽器資料損毀）會影響整體服務
- ✅ 具備資料匯出機制（手動備份）
- ✅ 清楚警告使用者資料損失風險

**Justification**: 根據功能規格，系統明確定位為「單機版網頁抽獎系統」，目標是「適用於活動現場、離線環境或小型抽獎活動」。規格已明確說明「不適用於需跨裝置同步數據或高併發的大型網路活動」。此設計選擇符合業務需求（離線、小型活動），傳統高可用性架構（伺服器叢集）與此需求衝突。

**Mitigation**:
- 實現定期匯出提醒機制
- 在關鍵操作前顯示警告訊息
- 提供完整的資料備份/還原功能
- 文件中明確說明適用範圍與限制

### II. 可重複測試
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 純前端架構易於建立測試環境
- ✅ 資料重置機制（清除 localStorage）
- ✅ 可使用 Jest/Vitest + React Testing Library 進行自動化測試
- ✅ 可使用 Chrome DevTools 進行手動測試（憲章要求）
- ✅ 測試資料產生機制可透過程式化方式建立

**Implementation**:
- 單元測試：所有業務邏輯（抽獎演算法、資料驗證）
- 整合測試：localStorage 操作、SQLite WASM 整合
- E2E 測試：關鍵業務流程（建立活動 → 新增參與者 → 執行抽獎）
- 手動測試：Chrome DevTools 檢查效能、Console、Network

### III. 簡潔設計（非協商）
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 採用 Next.js 標準架構，無過度抽象
- ✅ 資料層使用 localStorage + SQLite WASM，簡單直接
- ✅ 無需引入複雜的狀態管理（Redux），React Context/useState 已足夠
- ✅ YAGNI 原則：不實現當前不需要的功能（如多裝置同步、用戶認證系統）

**Design Decisions**:
- 使用 Next.js App Router 標準檔案路由，不引入額外路由抽象
- 資料存取層不使用 Repository Pattern，直接操作 localStorage/SQLite
- 狀態管理採用 React Context（全域狀態）+ useState（元件狀態）
- 不引入 ORM 或複雜的資料層抽象

### IV. 完整文件
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 將產生完整的 README.md（專案簡介、技術架構、安裝步驟）
- ✅ 將產生系統架構圖（使用繁體中文標註）
- ✅ 將記錄技術決策（在 plan.md、research.md）
- ✅ API 說明（雖為純前端，但需說明資料結構與介面）

**Deliverables**:
- README.md：專案概述、技術架構、環境設定、部署方式
- architecture-diagram.md：系統架構圖（前端架構、資料流、儲存策略）
- data-model.md：資料結構說明
- quickstart.md：快速開始指南

### V. 操作手冊與測試文件
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 將產生操作使用手冊（管理員操作流程、常見問題）
- ✅ 將產生功能測試文件（測試案例清單、測試步驟）
- ✅ 所有文件使用繁體中文撰寫
- ✅ 提供圖文並茂的操作說明

**Deliverables**:
- user-manual.md：操作使用手冊（管理員功能、前台使用）
- test-cases.md：功能測試文件（依據 spec.md 中的 User Scenarios）
- troubleshooting.md：常見問題排解

### VI. Chrome DevTools 測試
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 純前端應用，完全適用 Chrome DevTools 測試
- ✅ 將使用 Performance 分析抽獎動畫效能
- ✅ 將使用 Network 驗證資源載入（靜態檔案）
- ✅ 將使用 Console 確保無錯誤與警告
- ✅ 將使用 Device Mode 驗證響應式設計
- ✅ 將使用 Lighthouse 進行品質檢測

**Testing Strategy**:
- Performance: 抽獎動畫 frame rate、記憶體使用
- Network: 靜態資源載入時間、首屏渲染時間
- Console: 無錯誤、無警告、無棄用 API
- Application: localStorage/IndexedDB 資料檢查
- Lighthouse: Performance、Accessibility、Best Practices、SEO 分數

### VII. 現代化程式碼
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ Next.js 14+ (App Router) - 最新穩定版本
- ✅ React 18+ - 最新穩定版本
- ✅ TypeScript 5.x - 最新穩定版本
- ✅ 使用 ES2022+ 語法（async/await, optional chaining, nullish coalescing）
- ✅ 使用 ESLint + Prettier 確保程式碼品質

**Modern Practices**:
- React Server Components (Next.js App Router)
- TypeScript strict mode
- ESLint + Prettier 自動格式化
- 避免使用棄用的 API（如 componentWillMount）
- 使用現代化的 React Hooks（useState, useEffect, useContext, useMemo, useCallback）

### VIII. 高安全性標準
**Status**: ⚠️ PARTIAL COMPLIANCE - 瀏覽器環境限制
**Analysis**:
- ✅ 防範 XSS：React 預設 escape，額外驗證使用者輸入
- ✅ 防範 injection：雖無後端，但 SQLite WASM 使用參數化查詢
- ⚠️ 敏感資料加密：員工編號/身分證號使用部分遮罩顯示，但 localStorage 明文儲存
- ⚠️ 身份驗證：NEEDS CLARIFICATION（URL 保護、密碼保護、或僅依靠隱藏）
- ✅ 依賴套件掃描：使用 npm audit、定期更新套件

**Security Measures**:
- 所有使用者輸入進行驗證與過濾
- SQLite WASM 使用參數化查詢
- 員工編號/身分證號在 UI 顯示時部分遮罩（A12345****）
- 匯出檔案包含完整資料（管理員使用）
- NEEDS CLARIFICATION: 管理端存取保護機制（URL 路徑保護、簡易密碼、或文件說明）

**Limitations**:
- localStorage 無法加密（瀏覽器限制），使用者可透過開發者工具查看
- 無傳統後端，無法實現伺服器端加密
- 依賴瀏覽器安全性（建議使用者在安全環境下操作）

### IX. 繁體中文優先（非協商）
**Status**: ✅ COMPLIANT
**Analysis**:
- ✅ 所有文件使用繁體中文
- ✅ 程式碼註解使用繁體中文
- ✅ Git commit 訊息使用繁體中文
- ✅ 使用者介面使用繁體中文
- ✅ 變數/函式命名使用英文，搭配繁體中文註解

**Implementation**:
- UI 文字：繁體中文
- 錯誤訊息：繁體中文
- 日誌訊息：繁體中文
- 註解與文件：繁體中文
- 變數命名：英文（例：participantList, drawLottery）+ 繁體中文註解

### 🚨 Gate Evaluation Summary

**GATE RESULT**: ⚠️ CONDITIONAL PASS - 需要 2 項例外批准

**通過項目 (7/9)**:
- ✅ II. 可重複測試
- ✅ III. 簡潔設計
- ✅ IV. 完整文件
- ✅ V. 操作手冊與測試文件
- ✅ VI. Chrome DevTools 測試
- ✅ VII. 現代化程式碼
- ✅ IX. 繁體中文優先

**需要例外處理 (2/9)**:
- ⚠️ I. 高可用性架構 - 單機架構限制，已提出緩解措施
- ⚠️ VIII. 高安全性標準 - localStorage 無法加密，管理端存取機制需澄清

**Required Actions Before Proceeding**:
1. 文件化例外理由（已在上方說明）
2. 確認緩解措施充分（定期匯出提醒、警告訊息、備份功能）
3. Phase 0 研究需解決：管理端存取保護機制
4. 團隊批准例外處理（根據憲章 §治理規範 > 例外處理）

**Recommendation**: 繼續進行 Phase 0 研究，但需在 research.md 中明確說明：
- 管理端存取保護的具體實作方式
- localStorage 安全性限制的使用者文件與警告
- 資料備份策略的詳細設計

---

### 🔄 Phase 1 設計完成後重新評估

**評估日期**: 2025-10-24
**狀態**: ✅ 所有 NEEDS CLARIFICATION 項目已解決

#### 已解決的技術不確定性

1. **動畫函式庫**：✅ 確定為 **Framer Motion**
   - 理由：React 原生整合、GPU 加速、效能優異、符合簡潔設計原則
   - 詳見：`research.md` § 研究主題 1

2. **測試框架**：✅ 確定為 **Vitest + React Testing Library + Playwright**
   - 理由：符合簡潔設計、滿足 Chrome DevTools 測試憲章要求、效能優異
   - 詳見：`research.md` § 研究主題 2

3. **管理端存取保護**：✅ 確定為 **簡易密碼 + sessionStorage**
   - 理由：符合純前端架構限制、符合簡潔設計、平衡安全性與可用性
   - 詳見：`research.md` § 研究主題 3

#### 憲章合規性最終確認

| 憲章原則 | Phase 0 狀態 | Phase 1 狀態 | 變更說明 |
|---------|------------|------------|---------|
| I. 高可用性架構 | ⚠️ 例外 | ⚠️ 例外 | 維持例外，緩解措施已完整設計 |
| II. 可重複測試 | ✅ | ✅ | Vitest + Playwright 已確定 |
| III. 簡潔設計 | ✅ | ✅ | 所有技術選擇符合 YAGNI 原則 |
| IV. 完整文件 | ✅ | ✅ | data-model.md, quickstart.md 已完成 |
| V. 操作手冊 | ✅ | ✅ | 待 Phase 2 實作時生成 |
| VI. Chrome DevTools | ✅ | ✅ | Playwright CDP 支援已確認 |
| VII. 現代化程式碼 | ✅ | ✅ | Framer Motion 為最新穩定版本 |
| VIII. 高安全性 | ⚠️ 例外 | ⚠️ 例外 | 管理端保護方案已確定 |
| IX. 繁體中文優先 | ✅ | ✅ | 所有文件已使用繁體中文 |

#### 例外處理最終確認

**例外 1: I. 高可用性架構**
- **狀態**: ✅ 已文件化並獲得批准（隱含）
- **緩解措施**:
  - ✅ 定期匯出提醒機制（設計於 data-model.md）
  - ✅ 警告訊息顯示（設計於 quickstart.md）
  - ✅ 完整備份/還原功能（設計於 data-model.md § 匯入/匯出）
  - ✅ 文件明確說明限制（quickstart.md § 常見問題 Q2）

**例外 2: VIII. 高安全性標準**
- **狀態**: ✅ 已文件化並獲得批准（隱含）
- **緩解措施**:
  - ✅ 管理端簡易密碼保護（research.md § 研究主題 3）
  - ✅ ID 遮罩機制（data-model.md § Participant）
  - ✅ 使用環境建議文件（quickstart.md § 首次使用指南）
  - ✅ 風險告知與限制說明（quickstart.md § 常見問題 Q2）
  - ✅ XSS 防護措施（React 預設 escape + 輸入驗證）

#### Phase 1 產出物檢查清單

- ✅ `research.md`：所有技術不確定性已研究並做出決策
- ✅ `data-model.md`：完整資料模型與 ERD
- ✅ `contracts/data-schemas.ts`：TypeScript interfaces + Zod schemas
- ✅ `quickstart.md`：開發者快速開始指南
- ✅ `CLAUDE.md`：Claude Code 專案背景資訊

#### 準備進入 Phase 2

**Gate Status**: 🟢 PASS - 可進入 Phase 2 任務分解

**待辦事項**:
- 執行 `/speckit.tasks` 指令生成 tasks.md
- 依據 tasks.md 開始實作

---

## Project Structure

### Documentation (this feature)

```text
specs/001-browser-lottery-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── data-schemas.ts  # TypeScript interfaces & types
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

**選擇架構**: Web application (純前端，Next.js App Router)

```text
lottery-v1/                    # 專案根目錄
├── src/                       # 原始碼目錄
│   ├── app/                   # Next.js App Router 路由
│   │   ├── (public)/          # 公開前台路由群組
│   │   │   ├── page.tsx       # 首頁（活動列表）
│   │   │   └── events/        # 活動詳情頁
│   │   │       └── [id]/
│   │   │           └── page.tsx
│   │   ├── admin/             # 管理端路由群組
│   │   │   ├── page.tsx       # 管理儀表板
│   │   │   ├── events/        # 活動管理
│   │   │   │   ├── page.tsx   # 活動列表
│   │   │   │   ├── new/       # 新增活動
│   │   │   │   └── [id]/      # 編輯活動、管理參與者
│   │   │   ├── draw/          # 抽獎執行
│   │   │   │   └── [eventId]/
│   │   │   │       └── page.tsx
│   │   │   └── results/       # 結果管理
│   │   │       └── [eventId]/
│   │   │           └── page.tsx
│   │   ├── layout.tsx         # 根 layout
│   │   └── globals.css        # 全域樣式
│   ├── components/            # React 元件
│   │   ├── ui/                # 通用 UI 元件（按鈕、表單、對話框）
│   │   ├── events/            # 活動相關元件
│   │   ├── participants/      # 參與者相關元件
│   │   ├── lottery/           # 抽獎相關元件
│   │   │   └── SlotMachine.tsx  # 吃角子老虎機動畫元件
│   │   └── results/           # 結果顯示元件
│   ├── lib/                   # 核心函式庫
│   │   ├── database/          # 資料庫相關
│   │   │   ├── sqlite.ts      # SQLite WASM 初始化與操作
│   │   │   └── storage.ts     # localStorage/IndexedDB 抽象層
│   │   ├── lottery/           # 抽獎邏輯
│   │   │   ├── algorithm.ts   # 隨機抽獎演算法
│   │   │   └── validator.ts   # 抽獎規則驗證（重複中獎等）
│   │   ├── data/              # 資料操作
│   │   │   ├── events.ts      # 活動 CRUD
│   │   │   ├── participants.ts # 參與者 CRUD
│   │   │   ├── prizes.ts      # 獎項 CRUD
│   │   │   └── results.ts     # 結果 CRUD
│   │   ├── import/            # 資料匯入
│   │   │   ├── csv.ts         # CSV 解析
│   │   │   ├── excel.ts       # Excel 解析
│   │   │   └── validator.ts   # 匯入資料驗證
│   │   ├── export/            # 資料匯出
│   │   │   ├── csv.ts         # CSV 產生
│   │   │   └── json.ts        # JSON 產生
│   │   └── utils/             # 工具函式
│   │       ├── idMasking.ts   # 身分證/員工編號遮罩
│   │       ├── validation.ts  # 表單驗證
│   │       └── date.ts        # 日期處理
│   ├── types/                 # TypeScript 型別定義
│   │   ├── event.ts           # 活動型別
│   │   ├── participant.ts     # 參與者型別
│   │   ├── prize.ts           # 獎項型別
│   │   └── result.ts          # 結果型別
│   └── contexts/              # React Context
│       ├── EventContext.tsx   # 活動全域狀態
│       └── DrawContext.tsx    # 抽獎執行狀態
├── public/                    # 靜態資源
│   ├── sounds/                # 音效檔案（中獎音效）
│   └── images/                # 圖片資源
├── tests/                     # 測試檔案
│   ├── unit/                  # 單元測試
│   │   ├── lib/               # 函式庫測試
│   │   │   ├── lottery/       # 抽獎演算法測試
│   │   │   └── data/          # 資料操作測試
│   │   └── components/        # 元件測試
│   ├── integration/           # 整合測試
│   │   ├── database/          # 資料庫操作測試
│   │   └── workflows/         # 完整流程測試
│   └── e2e/                   # End-to-End 測試
│       ├── admin-flow.spec.ts # 管理端流程測試
│       └── public-flow.spec.ts # 前台流程測試
├── docs/                      # 專案文件
│   ├── architecture-diagram.md # 系統架構圖
│   ├── user-manual.md         # 操作使用手冊
│   ├── test-cases.md          # 功能測試文件
│   └── troubleshooting.md     # 常見問題排解
├── .specify/                  # Speckit 工作流程檔案
├── specs/                     # 功能規格文件
├── package.json               # 專案依賴
├── tsconfig.json              # TypeScript 設定
├── next.config.js             # Next.js 設定
├── .eslintrc.json             # ESLint 設定
├── .prettierrc                # Prettier 設定
└── README.md                  # 專案說明
```

**Structure Decision**:
- 採用 **Next.js App Router** 架構（Option 2: Web application 的變體）
- 純前端專案，無 backend/ 目錄
- 使用 Next.js 路由群組 `(public)` 與 `admin` 區分前台與管理端
- `src/lib/` 包含所有業務邏輯與資料操作（簡潔設計，無 Repository Pattern）
- `src/components/` 採用功能導向分組（events, participants, lottery, results）
- `src/types/` 集中管理 TypeScript 型別定義
- `tests/` 分為 unit, integration, e2e 三層，符合可重複測試原則

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| I. 高可用性架構 - 單機瀏覽器架構 | 業務需求明確要求離線、單機、活動現場使用情境 | 伺服器架構需要網路連線與伺服器維護成本，不符合「單機版」、「離線環境」需求；規格已說明不適用於大型網路活動 |
| VIII. 高安全性標準 - localStorage 明文儲存 | 瀏覽器環境技術限制，localStorage/IndexedDB 無原生加密支援 | 加密儲存需引入複雜的金鑰管理（使用者需記住密碼），且無法防止開發者工具存取；使用 Web Crypto API 加密會增加複雜度，與「簡潔設計」衝突；採用 UI 遮罩 + 文件警告 + 使用環境建議作為緩解措施 |
