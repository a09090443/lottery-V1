# Claude Code Context: Lottery-V1

**專案名稱**: Lottery-V1 (Browser-Based Lottery System)
**當前功能**: 001-browser-lottery-system
**最後更新**: 2025-10-24

此檔案提供 Claude Code 專案背景資訊，協助 AI 助手理解專案技術堆疊與架構決策。

---

## 技術堆疊

### 核心技術

**語言**: TypeScript 5.x, JavaScript ES2022+

**前端框架**: Next.js 14+ (App Router), React 18+

**動畫函式庫**: Framer Motion
- 理由：React 原生整合、GPU 加速、效能優異、符合簡潔設計原則
- 替代方案：GSAP (複雜動畫), Anime.js (最小 bundle)

**資料庫**:
- **Primary**: Browser localStorage（認證資料、系統設定）
- **Structured Data**: SQLite WebAssembly (sql.js)（活動、參與者、結果）
- **Fallback**: IndexedDB（未來擴充用於大型檔案）

**測試框架**:
- **單元/整合測試**: Vitest + React Testing Library
- **E2E 測試**: Playwright
- **手動測試**: Chrome DevTools（憲章要求）

**程式碼品質**: ESLint + Prettier

**管理端保護**: 簡易密碼 + sessionStorage

---

## 專案類型與架構

**專案類型**: Web application (pure frontend, Jamstack)

**部署方式**: Static export (完全離線運作)

**架構模式**:
- Next.js App Router（路由群組：(public) 與 admin）
- 無 backend API server
- 所有資料存儲於瀏覽器本地

---

## 關鍵設計決策（來自 research.md）

### 1. 動畫函式庫：Framer Motion

**決策理由**:
1. React 原生整合最佳
2. GPU 硬體加速，處理 500-1000 筆資料流暢
3. 使用 LazyMotion 可優化至 5.5 kB
4. TypeScript 完整支援
5. 符合「簡潔設計」原則

**使用範例**:
```typescript
import { useAnimate } from 'framer-motion';

const [scope, animate] = useAnimate();

await animate(
  scope.current,
  { y: -5000 },
  { duration: 5, ease: [0.25, 0.1, 0.25, 1] }
);
```

### 2. 測試框架：Vitest + Playwright

**決策理由**:
1. 符合「簡潔設計」原則（Vitest 設定簡潔）
2. 滿足「Chrome DevTools 測試」憲章要求（Playwright 支援 CDP）
3. 測試速度快 3-5 倍
4. Next.js 官方推薦
5. 完整的跨瀏覽器支援（包含 Safari）

**重要配置**:
- SQLite WASM 測試：使用抽象層模式，測試環境用 better-sqlite3
- Chrome DevTools 整合：使用 Playwright CDP 進行自動化效能測試

### 3. 管理端保護：簡易密碼 + sessionStorage

**決策理由**:
1. 符合純前端架構限制（無法實現真正的伺服器端驗證）
2. 符合「簡潔設計」原則
3. 符合業務需求（單機版、活動現場使用）
4. 平衡安全性與可用性

**實作要點**:
- 密碼經 SHA-256 hash 後存於 localStorage
- Session token 存於 sessionStorage（關閉瀏覽器自動清除）
- 文件明確說明安全性限制與使用環境建議

---

## 資料模型概要

### 核心實體

1. **LotteryEvent**（抽獎活動）
   - 狀態：draft | active | completed | archived
   - 重複中獎設定：allowDuplicateWinners (預設 false)

2. **Prize**（獎項）
   - totalQuantity, remainingQuantity
   - displayOrder（排序）

3. **Participant**（參與者）
   - 唯一識別：name + (employeeId | nationalId)
   - ID 遮罩：顯示前 6 字元，其餘以 * 代替

4. **DrawingResult**（抽獎結果）
   - 狀態：confirmed | cancelled
   - drawSequence（同一獎項的第幾個中獎者）

### 儲存策略

```
localStorage (Primary)
├── 管理員認證資料
├── 系統設定
└── 資料索引與快取

SQLite WASM (Structured Data)
├── events
├── participants
├── prizes
├── drawing_results
└── event_participants（關聯表）

IndexedDB (Fallback, 未來擴充)
└── 大型檔案儲存
```

---

## 專案結構

```
lottery-v1/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (public)/         # 公開前台
│   │   └── admin/            # 管理端
│   ├── components/           # React 元件
│   │   ├── ui/               # 通用 UI
│   │   └── lottery/          # 抽獎元件
│   │       └── SlotMachine.tsx  # 吃角子老虎機動畫
│   ├── lib/                  # 核心函式庫
│   │   ├── database/         # 資料庫操作
│   │   ├── lottery/          # 抽獎邏輯
│   │   ├── data/             # 資料 CRUD
│   │   ├── import/           # 資料匯入
│   │   └── export/           # 資料匯出
│   ├── types/                # TypeScript 型別
│   └── contexts/             # React Context
├── tests/                    # 測試檔案
│   ├── unit/                 # 單元測試
│   ├── integration/          # 整合測試
│   └── e2e/                  # E2E 測試
└── specs/                    # 功能規格
    └── 001-browser-lottery-system/
        ├── spec.md           # 功能規格
        ├── plan.md           # 實作計畫
        ├── research.md       # 技術研究
        ├── data-model.md     # 資料模型
        ├── quickstart.md     # 快速開始
        └── contracts/        # API 合約
            └── data-schemas.ts
```

---

## 憲章合規性

### 遵循的原則

✅ **II. 可重複測試**：Vitest + Playwright + Chrome DevTools
✅ **III. 簡潔設計**：無過度抽象，直接操作 localStorage/SQLite
✅ **IV. 完整文件**：README.md + architecture + data-model + quickstart
✅ **V. 操作手冊**：user-manual.md + test-cases.md
✅ **VI. Chrome DevTools 測試**：Playwright CDP + 手動檢查清單
✅ **VII. 現代化程式碼**：Next.js 14, React 18, TypeScript 5
✅ **IX. 繁體中文優先**：所有文件與 UI 使用繁體中文

### 例外處理

⚠️ **I. 高可用性架構**：單機瀏覽器架構限制
  - 緩解：定期匯出提醒、警告訊息、完整備份功能

⚠️ **VIII. 高安全性標準**：localStorage 明文儲存、管理端保護有限
  - 緩解：UI 遮罩、文件警告、使用環境建議

---

## 效能目標

- 抽獎動畫完成時間：2-5 秒（參與者數量 ≤500）
- 首屏渲染時間：< 2 秒
- 批次匯入 500 筆參與者：< 10 秒
- 匯出結果（100 筆中獎者）：< 3 秒

---

## 限制與注意事項

1. **離線優先**：初次載入後無需網路連線
2. **單一裝置**：資料無法跨裝置同步
3. **儲存空間限制**：localStorage 5-10 MB
4. **瀏覽器需求**：Chrome / Firefox / Safari / Edge（最近 2 年版本）
5. **安全性限制**：純前端架構無法實現真正的安全驗證

---

## 開發指令

```bash
# 安裝依賴
npm install

# 開發伺服器
npm run dev

# 測試
npm test                  # 單元測試
npm run test:e2e          # E2E 測試
npm run test:coverage     # 覆蓋率報告

# 建置
npm run build             # 建置
npm run export            # 靜態匯出

# 程式碼品質
npm run lint              # ESLint 檢查
npm run lint:fix          # 自動修正
```

---

## 參考資料

- **功能規格**：`specs/001-browser-lottery-system/spec.md`
- **實作計畫**：`specs/001-browser-lottery-system/plan.md`
- **技術研究**：`specs/001-browser-lottery-system/research.md`
- **資料模型**：`specs/001-browser-lottery-system/data-model.md`
- **API 合約**：`specs/001-browser-lottery-system/contracts/data-schemas.ts`
- **快速開始**：`specs/001-browser-lottery-system/quickstart.md`
- **專案憲章**：`.specify/memory/constitution.md`

---

**Claude Code 使用提示**：
- 本專案採用 TypeScript strict mode，請確保型別安全
- 所有註解與文件使用繁體中文
- 遵循 ESLint 規則與 Prettier 格式
- 新增功能前請參考 research.md 的技術決策
- 實作前請閱讀 data-model.md 理解資料結構

---

**最後更新**: 2025-10-24
**狀態**: ✅ Phase 1 設計完成，準備進入 Phase 2 任務分解
