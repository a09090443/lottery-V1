# Quick Start Guide: Browser-Based Lottery System

**Feature**: 001-browser-lottery-system
**Date**: 2025-10-24
**Version**: 1.0.0

本指南提供快速開始開發與使用抽獎系統的步驟。

---

## 📋 專案簡介

**Browser-Based Lottery System** 是一個完全運作於瀏覽器端的單機版抽獎系統，使用 Next.js + TypeScript 開發，資料儲存於瀏覽器本地（localStorage + SQLite WASM），支援離線使用。

**核心功能**：
- ✅ 活動建立與管理
- ✅ 參與者管理（手動新增 + 批次匯入）
- ✅ 吃角子老虎機視覺特效抽獎
- ✅ 結果管理與匯出
- ✅ 公開前台（活動瀏覽 + 中獎查詢）
- ✅ 管理端保護（簡易密碼驗證）

---

## 💻 環境需求

### 必要環境

| 項目 | 版本需求 | 驗證指令 |
|-----|---------|---------|
| **Node.js** | ≥ 18.17.0 (推薦 20.x LTS) | `node --version` |
| **npm** | ≥ 9.x | `npm --version` |
| **作業系統** | Windows / macOS / Linux | - |
| **瀏覽器** | Chrome / Firefox / Safari / Edge（最近 2 年版本） | - |

### 推薦開發工具

- **程式碼編輯器**：Visual Studio Code
- **瀏覽器擴充套件**：React Developer Tools, Redux DevTools（選用）
- **Git**：版本控制（選用）

---

## 🚀 快速開始

### 步驟 1：取得專案原始碼

```bash
# 方法 A：從 Git repository clone（若有）
git clone <repository-url>
cd lottery-v1

# 方法 B：解壓縮專案壓縮檔
# 解壓縮後進入專案目錄
cd lottery-v1
```

### 步驟 2：安裝依賴套件

```bash
npm install
```

**預期輸出**：
```
added 500+ packages in 30s
```

**常見問題**：
- 若遇到 `EACCES` 權限錯誤，請參考 [npm 文件](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- 若遇到網路問題，可嘗試切換 npm registry：`npm config set registry https://registry.npmjs.org/`

### 步驟 3：啟動開發伺服器

```bash
npm run dev
```

**預期輸出**：
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

✓ Ready in 2.5s
```

### 步驟 4：開啟瀏覽器

在瀏覽器中開啟 **http://localhost:3000**

- **公開前台**：http://localhost:3000
- **管理端**：http://localhost:3000/admin

---

## 📂 專案結構快速導覽

```
lottery-v1/
├── src/
│   ├── app/                  # Next.js App Router 路由
│   │   ├── (public)/         # 公開前台
│   │   │   └── page.tsx      # 首頁（活動列表）
│   │   └── admin/            # 管理端
│   │       ├── page.tsx      # 管理儀表板
│   │       ├── login/        # 登入頁
│   │       ├── events/       # 活動管理
│   │       ├── draw/         # 抽獎執行
│   │       └── results/      # 結果管理
│   ├── components/           # React 元件
│   │   ├── ui/               # 通用 UI 元件
│   │   ├── lottery/          # 抽獎相關元件
│   │   │   └── SlotMachine.tsx  # 吃角子老虎機動畫
│   │   └── ...
│   ├── lib/                  # 核心函式庫
│   │   ├── database/         # 資料庫操作（localStorage + SQLite WASM）
│   │   ├── lottery/          # 抽獎邏輯
│   │   ├── data/             # 資料 CRUD
│   │   ├── import/           # 資料匯入（CSV, Excel）
│   │   └── export/           # 資料匯出（CSV, JSON）
│   ├── types/                # TypeScript 型別定義
│   └── contexts/             # React Context（全域狀態）
├── tests/                    # 測試檔案
│   ├── unit/                 # 單元測試
│   ├── integration/          # 整合測試
│   └── e2e/                  # E2E 測試
├── public/                   # 靜態資源（音效、圖片）
├── package.json              # 專案依賴
├── next.config.js            # Next.js 設定
├── tsconfig.json             # TypeScript 設定
└── README.md                 # 專案說明
```

---

## 🛠️ 開發環境設定

### TypeScript 設定

專案已預設啟用 TypeScript strict mode，確保型別安全。

**tsconfig.json 關鍵設定**：
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### ESLint + Prettier 設定

專案已設定 ESLint 與 Prettier 自動格式化。

**執行 Lint 檢查**：
```bash
npm run lint
```

**自動修正格式問題**：
```bash
npm run lint:fix
```

**VS Code 推薦設定**（.vscode/settings.json）：
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 環境變數設定（選用）

建立 `.env.local` 檔案（若需要）：
```bash
# .env.local
NEXT_PUBLIC_APP_NAME="抽獎系統"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

---

## 🧪 測試執行

### 單元測試（Vitest）

**執行所有測試**：
```bash
npm test
```

**Watch mode（開發時使用）**：
```bash
npm run test:watch
```

**測試覆蓋率報告**：
```bash
npm run test:coverage
```

**預期輸出**：
```
✓ src/lib/lottery/algorithm.test.ts (5 tests) 150ms
✓ src/lib/data/events.test.ts (8 tests) 200ms

Test Files  15 passed (15)
     Tests  120 passed (120)
  Duration  3.5s

Coverage:
  Statements: 85.2%
  Branches: 80.5%
  Functions: 90.1%
  Lines: 85.2%
```

### E2E 測試（Playwright）

**執行 E2E 測試**：
```bash
npm run test:e2e
```

**UI 模式（可視化偵錯）**：
```bash
npm run test:e2e:ui
```

**偵錯模式（單步執行）**：
```bash
npm run test:e2e:debug
```

**測試報告**：
```bash
npm run test:e2e:report
```

### Chrome DevTools 測試（憲章要求）

**手動測試檢查清單**（參考 `docs/testing-checklist.md`）：

1. **Performance**：首屏渲染時間 < 2 秒
2. **Network**：檢查所有資源載入狀態
3. **Console**：無錯誤與警告
4. **Device Mode**：響應式設計測試
5. **Lighthouse**：Performance Score ≥ 90
6. **Application**：localStorage/IndexedDB 資料檢查

---

## 📦 建置與部署

### 開發建置

```bash
npm run build
```

**預期輸出**：
```
Route (app)                              Size     First Load JS
┌ ○ /                                    5.2 kB         85 kB
├ ○ /admin                               3.8 kB         83 kB
├ ○ /admin/events                        4.5 kB         84 kB
└ ○ /admin/draw/[eventId]                6.1 kB         86 kB

○  (Static)  automatically rendered as static HTML (uses no initial props)
```

### 靜態匯出（完全離線使用）

```bash
npm run export
```

這會產生 `out/` 目錄，包含所有靜態檔案，可直接部署至任何靜態託管平台或本地伺服器。

**匯出後的目錄結構**：
```
out/
├── index.html
├── admin.html
├── _next/
│   ├── static/
│   └── ...
└── ...
```

### 本地預覽建置結果

```bash
npm run start
```

在瀏覽器中開啟 http://localhost:3000 預覽建置後的版本。

### 部署至靜態託管平台

#### Vercel（推薦）

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel
```

#### Netlify

```bash
# 安裝 Netlify CLI
npm install -g netlify-cli

# 部署
netlify deploy
```

#### GitHub Pages

```bash
# 修改 next.config.js，設定 basePath 與 assetPrefix
# 然後執行
npm run export

# 將 out/ 目錄內容推送至 gh-pages 分支
```

#### 本地伺服器（完全離線）

```bash
# 方法 A：使用 Python HTTP Server
cd out
python -m http.server 8000

# 方法 B：使用 Node.js serve 套件
npx serve out
```

---

## 🎯 首次使用指南

### 步驟 1：設定管理員密碼

1. 開啟 **http://localhost:3000/admin**
2. 系統偵測到首次使用，顯示「設定密碼」頁面
3. 輸入密碼（至少 8 字元，建議包含數字、字母、特殊符號）
4. 確認密碼並儲存

**注意**：密碼儲存於瀏覽器 localStorage，遺失後需清除所有資料重新設定。

### 步驟 2：建立第一個活動

1. 登入管理端後，點擊「建立新活動」
2. 填寫活動資訊：
   - 活動名稱：例如「2025 年終抽獎」
   - 活動描述：選填
   - 預定日期時間：不可早於當前日期
   - 是否允許重複中獎：預設為「否」
3. 點擊「儲存」

### 步驟 3：新增參與者

**方法 A：手動新增**
1. 進入活動詳情頁，點擊「新增參與者」
2. 填寫參與者資訊：
   - 姓名：必填
   - 員工編號 / 身分證字號：至少一個必填
   - Email / 電話：選填
3. 點擊「儲存」

**方法 B：批次匯入（CSV）**
1. 準備 CSV 檔案（UTF-8 編碼）：
   ```csv
   姓名,員工編號,身分證字號,Email,電話
   張三,E001,A123456789,zhang@example.com,0912345678
   李四,E002,,li@example.com,0923456789
   ```
2. 點擊「批次匯入」上傳檔案
3. 系統驗證資料並顯示匯入結果

### 步驟 4：設定獎項

1. 進入活動詳情頁，點擊「新增獎項」
2. 填寫獎項資訊：
   - 獎項名稱：例如「頭獎」
   - 獎項描述：選填
   - 獎項數量：例如 3（表示抽出 3 位中獎者）
   - 排序順序：1（數字越小越優先顯示）
3. 重複步驟新增多個獎項

### 步驟 5：執行抽獎

1. 進入「抽獎執行」頁面
2. 選擇要抽的獎項（例如：頭獎）
3. 點擊「開始抽獎」
4. 觀看吃角子老虎機動畫（5 秒）
5. 動畫結束後，顯示中獎者資訊
6. 確認中獎者，點擊「確認並繼續」
7. 若獎項數量 > 1，重複步驟 3-6 直到抽完所有名額

### 步驟 6：查看與匯出結果

1. 進入「結果管理」頁面
2. 查看所有中獎者列表（ID 已遮罩顯示）
3. 點擊「匯出結果」下載 CSV 或 JSON 檔案
4. 匯出檔案包含完整資料（未遮罩的 ID）

### 步驟 7：公開前台查看（選用）

1. 開啟 **http://localhost:3000**（公開前台）
2. 查看活動列表
3. 點擊活動查看詳情與中獎名單
4. 前台為唯讀模式，無管理功能

---

## 🔧 常見問題

### Q1: 如何重置管理員密碼？

**答**：由於密碼儲存於 localStorage，遺失後無法復原。需清除所有資料重新開始。

**步驟**：
1. 開啟瀏覽器開發者工具（F12）
2. 進入 Application → Local Storage
3. 刪除所有 `lottery_*` 開頭的項目
4. 重新整理頁面，系統會要求重新設定密碼

**警告**：此操作會清除所有活動、參與者與抽獎結果！

### Q2: 資料會不會遺失？

**答**：資料儲存於瀏覽器本地（localStorage + SQLite WASM），有以下風險：

1. **清除瀏覽器資料**：會導致資料遺失
2. **瀏覽器更新或故障**：可能導致資料損毀
3. **切換不同瀏覽器或裝置**：資料無法同步

**建議**：
- 定期匯出活動資料備份
- 使用完畢後立即匯出結果
- 在安全環境下使用（個人電腦、專用裝置）

### Q3: 支援哪些檔案格式匯入？

**答**：目前支援以下格式：

| 格式 | 編碼 | 說明 |
|-----|------|------|
| **CSV** | UTF-8 | 必須包含標題列 |
| **Excel** | - | .xlsx 或 .xls（未來版本支援） |

**CSV 格式範例**：
```csv
姓名,員工編號,身分證字號,Email,電話
張三,E001,A123456789,zhang@example.com,0912345678
```

### Q4: 如何在離線環境下使用？

**答**：

1. **開發環境（需先建置）**：
   ```bash
   npm run build
   npm run export
   cd out
   python -m http.server 8000
   ```

2. **生產環境（已部署）**：
   - 首次開啟網站時，瀏覽器會快取所有靜態資源
   - 之後即使離線也可正常使用
   - 資料完全儲存於本地，無需網路連線

### Q5: 瀏覽器儲存空間不足怎麼辦？

**答**：localStorage 典型限制為 5-10 MB。

**解決方案**：
1. **封存舊活動**：將已完成的活動狀態改為 `archived`
2. **匯出並刪除**：匯出活動資料後刪除
3. **清理取消的結果**：刪除 `status = 'cancelled'` 的抽獎結果

**監控**：系統會在使用率超過 80% 時顯示警告。

### Q6: 如何調整動畫速度？

**答**：動畫速度可在系統設定中調整。

**預設值**：5 秒

**調整方式**：
1. 進入「系統設定」頁面
2. 修改「動畫持續時間」（範圍：2-10 秒）
3. 儲存設定

**程式碼層級調整**（開發者）：
```typescript
// src/lib/lottery/config.ts
export const ANIMATION_DURATION = 5; // 修改為想要的秒數
```

### Q7: 測試失敗怎麼辦？

**答**：

1. **確認 Node.js 版本**：
   ```bash
   node --version  # 應 ≥ 18.17.0
   ```

2. **重新安裝依賴**：
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **清除測試快取**：
   ```bash
   npm run test:clear
   npm test
   ```

4. **查看詳細錯誤訊息**：
   ```bash
   npm test -- --reporter=verbose
   ```

### Q8: 如何貢獻程式碼？

**答**：

1. **Fork 專案**（若為開源專案）
2. **建立功能分支**：
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **撰寫程式碼與測試**
4. **執行測試**：
   ```bash
   npm test
   npm run test:e2e
   ```
5. **提交變更**：
   ```bash
   git add .
   git commit -m "feat: 新增功能描述"
   ```
6. **推送至遠端**：
   ```bash
   git push origin feature/your-feature-name
   ```
7. **建立 Pull Request**

---

## 📚 進階閱讀

- **完整文件**：`docs/README.md`
- **資料模型**：`specs/001-browser-lottery-system/data-model.md`
- **API 文件**：`specs/001-browser-lottery-system/contracts/data-schemas.ts`
- **測試文件**：`docs/test-cases.md`
- **操作手冊**：`docs/user-manual.md`
- **專案憲章**：`.specify/memory/constitution.md`

---

## 🆘 取得協助

**問題回報**：
- GitHub Issues：<repository-url>/issues
- Email：<team-email>

**文件回饋**：
- 若發現文件錯誤或不清楚的地方，歡迎提交 Issue 或 Pull Request

---

## 📝 授權資訊

本專案採用 MIT License。詳見 `LICENSE` 檔案。

---

**文件版本**: 1.0.0
**最後更新**: 2025-10-24
**狀態**: ✅ Quick Start Guide 完成
