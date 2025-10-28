# 測試執行指南

**專案名稱**: Lottery-V1 (Browser-Based Lottery System)
**建立日期**: 2025-10-25
**最後更新**: 2025-10-25

本指南提供完整的測試執行流程,涵蓋手動測試、自動化測試、效能測試等各個面向。

---

## 📋 目錄

1. [測試概覽](#測試概覽)
2. [快速開始](#快速開始)
3. [自動化測試](#自動化測試)
4. [手動測試](#手動測試)
5. [測試資料準備](#測試資料準備)
6. [測試流程建議](#測試流程建議)
7. [常見問題](#常見問題)

---

## 測試概覽

### 測試類型與覆蓋範圍

| 測試類型 | 測試數量 | 執行時間 | 適用場景 |
|---------|---------|----------|----------|
| **E2E 自動化測試** | 30 個測試案例 | ~5-10 分鐘 | CI/CD、快速回歸測試 |
| **手動測試** | 200+ 檢查項目 | 2-3 小時 | 完整功能驗證、UI/UX 測試 |
| **單元測試** | (待實作) | ~1 分鐘 | 開發期間持續驗證 |
| **效能測試** | 包含在手動測試中 | 30 分鐘 | 大量資料處理驗證 |

### 測試覆蓋的功能模組

✅ **管理員認證與授權** (14 項測試)
✅ **活動建立與管理** (11 項測試)
✅ **參與者管理** (手動新增、CSV匯入、編輯、刪除)
✅ **獎項管理** (新增、編輯、排序、刪除)
✅ **抽獎執行** (動畫、中獎規則、重抽機制)
✅ **結果查看與匯出** (ID 遮罩、CSV/JSON 匯出)
✅ **公開前台** (活動列表、中獎名單查詢)
✅ **資料持久化** (localStorage/SQLite)
✅ **響應式設計** (手機/平板/桌面)
✅ **瀏覽器相容性** (Chrome/Firefox/Safari/Edge)

---

## 快速開始

### 環境準備

#### 1. 安裝依賴

```bash
# 安裝所有依賴（包含測試工具）
npm install

# 安裝 Playwright 瀏覽器
npx playwright install
```

#### 2. 啟動開發伺服器

```bash
# 啟動開發伺服器（在背景執行或開啟新終端）
npm run dev
```

伺服器會在 `http://localhost:3000` 啟動。

#### 3. 驗證環境

```bash
# 檢查 Playwright 是否正常
npx playwright --version

# 檢查 Vitest 是否正常（若未來實作單元測試）
npm test -- --version
```

---

### 5 分鐘快速驗證

執行最基本的功能驗證,確保系統核心功能正常。

```bash
# 執行自動化測試（管理員登入 + 完整流程）
npm run test:e2e -- 01-admin-login.spec.ts 02-complete-workflow.spec.ts
```

**預期結果**:
- 所有測試通過 (✓)
- 約 3-5 分鐘完成
- 產生測試報告於 `playwright-report/`

**如果測試失敗**:
1. 確認開發伺服器正在運作 (`http://localhost:3000`)
2. 清除瀏覽器資料 (localStorage/sessionStorage)
3. 查看測試報告 `npm run test:e2e:report`

---

## 自動化測試

### E2E 測試（Playwright）

#### 執行所有 E2E 測試

```bash
# 執行所有 E2E 測試
npm run test:e2e

# 在 UI 模式執行（可視化測試執行過程）
npm run test:e2e:ui

# 偵錯模式（逐步執行）
npm run test:e2e:debug
```

#### 執行特定測試檔案

```bash
# 只測試管理員登入
npm run test:e2e -- 01-admin-login.spec.ts

# 只測試完整流程
npm run test:e2e -- 02-complete-workflow.spec.ts

# 只測試公開前台
npm run test:e2e -- 03-public-frontend.spec.ts
```

#### 執行特定測試案例

```bash
# 執行特定測試案例（使用 grep）
npm run test:e2e -- --grep "首次訪問"

# 執行包含特定關鍵字的測試
npm run test:e2e -- --grep "登入"
```

#### 跨瀏覽器測試

```bash
# 在特定瀏覽器執行
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit

# 在所有桌面瀏覽器執行
npm run test:e2e -- --project=chromium --project=firefox --project=webkit

# 在行動裝置模擬器執行
npm run test:e2e -- --project="Mobile Chrome" --project="Mobile Safari"
```

#### 測試報告

```bash
# 查看最近的測試報告
npm run test:e2e:report

# 自動開啟瀏覽器顯示報告
```

測試報告包含:
- 測試結果統計
- 失敗測試的截圖
- 失敗測試的影片錄製
- Trace 檔案（可在 Playwright Trace Viewer 查看）

---

### E2E 測試涵蓋項目

#### 01-admin-login.spec.ts（12 個測試）

```
✓ 01-01: 首次訪問應顯示密碼設定頁面
✓ 01-02: 設定管理員密碼（密碼太短應失敗）
✓ 01-03: 設定管理員密碼（密碼不一致應失敗）
✓ 01-04: 成功設定管理員密碼
✓ 01-05: 使用正確密碼登入
✓ 01-06: 使用錯誤密碼登入應失敗
✓ 01-07: 登入速率限制（5次失敗後鎖定）
✓ 01-08: 登入後可以登出
✓ 01-09: 未登入時訪問管理頁面應重定向到登入頁
✓ 01-10: Session 逾時測試（模擬）
✓ 01-11: 登入頁面顯示安全提示
✓ 01-12: Loading 狀態顯示
```

#### 02-complete-workflow.spec.ts（8 個測試）

```
✓ 02-01: 完整流程 - 建立活動 → 設定獎項 → 匯入參與者 → 抽獎 → 匯出結果
✓ 02-02: 手動新增參與者並抽獎
✓ 02-03: 參與者搜尋功能測試
✓ 02-04: 參與者分頁功能測試
✓ 02-05: 不允許重複中獎測試
✓ 02-06: 儲存空間監控測試
✓ 02-07: 匯出提醒測試
✓ 02-08: 確認對話框測試
```

#### 03-public-frontend.spec.ts（10 個測試）

```
✓ 03-01: 公開首頁顯示活動列表
✓ 03-02: 公開活動列表頁面
✓ 03-03: 公開活動詳情頁面
✓ 03-04: 公開頁面顯示中獎名單（ID 已遮罩）
✓ 03-05: 公開中獎名單頁面
✓ 03-06: 公開頁面無管理功能按鈕
✓ 03-07: 公開頁面響應式設計（手機版）
✓ 03-08: 公開頁面響應式設計（平板版）
✓ 03-09: 公開頁面活動狀態顯示
✓ 03-10: 訪問不存在的活動應顯示錯誤
```

---

### 單元測試（Vitest）

> ⚠️ **注意**: 單元測試尚未實作完成,以下為預計指令。

```bash
# 執行所有單元測試
npm test

# 監聽模式（檔案變更自動執行）
npm run test:watch

# UI 模式
npm run test:ui

# 產生覆蓋率報告
npm run test:coverage

# 執行一次並退出
npm run test:run
```

---

## 手動測試

### 手動測試文件

| 文件名稱 | 用途 | 測試項目數 |
|---------|------|-----------|
| [test-checklist.md](./manual/test-checklist.md) | 完整測試檢查清單 | 200+ 項 |
| [test-data.md](./manual/test-data.md) | 測試資料集合 | 10 大類 |
| [file-upload-testing-guide.md](./manual/file-upload-testing-guide.md) | 檔案上傳測試指南 | CSV/Excel/JSON |

### 手動測試執行步驟

#### 準備工作

1. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

2. **清除測試資料**（如需要）
   - 開啟瀏覽器 DevTools Console (F12)
   - 執行:
     ```javascript
     localStorage.clear();
     sessionStorage.clear();
     location.reload();
     ```

3. **準備測試資料**
   - 開啟 [test-data.md](./manual/test-data.md)
   - 準備 CSV 測試檔案（位於 `tests/fixtures/csv/`）
   - 準備 JSON 測試檔案（位於 `tests/fixtures/json/`）

#### 測試執行

**方法 1: 使用測試清單**

開啟 [test-checklist.md](./manual/test-checklist.md),按照順序執行:

1. **管理員登入與認證** (TC-AUTH-001 ~ TC-AUTH-014)
2. **活動建立** (TC-CREATE-001 ~ TC-CREATE-011)
3. **參與者管理** (TC-PART-001 ~ TC-PART-009)
4. **參與者匯入** (TC-IMPORT-001 ~ TC-IMPORT-012)
5. **獎項管理** (TC-EDIT-009 ~ TC-EDIT-011)
6. **抽獎執行** (TC-DRAW-001 ~ TC-DRAW-022)
7. **結果查看與匯出** (TC-RESULT-001 ~ TC-RESULT-019)
8. **公開前台** (TC-PUB-001 ~ TC-PUB-022)

**方法 2: 使用快速測試場景**

參考 [TEST-FILES-READY.md](./TEST-FILES-READY.md) 的測試場景:

- **場景 1**: 快速驗證（5 分鐘）
- **場景 2**: 標準測試（30 分鐘）
- **場景 3**: 效能測試（1 小時）
- **場景 4**: 錯誤處理測試（30 分鐘）

### 手動測試記錄

建議使用以下格式記錄測試結果:

```markdown
## 測試執行紀錄

**日期**: 2025-10-25
**測試人員**: [姓名]
**環境**: Chrome 120 / Windows 11

### 執行結果

| 測試項目 | 狀態 | 備註 |
|---------|------|------|
| TC-AUTH-001 | ✅ 通過 | |
| TC-AUTH-002 | ✅ 通過 | |
| TC-AUTH-003 | ❌ 失敗 | 密碼驗證錯誤訊息未顯示 |

### 發現的問題

1. **問題描述**: 密碼驗證錯誤訊息未顯示
   - **嚴重程度**: 中
   - **重現步驟**: ...
   - **預期結果**: ...
   - **實際結果**: ...
```

---

## 測試資料準備

### CSV 測試檔案

所有 CSV 測試檔案已預先生成,位於 `tests/fixtures/csv/`:

| 檔案名稱 | 資料量 | 用途 |
|---------|--------|------|
| **participants_20.csv** | 20 筆 | 標準測試 |
| **participants_100.csv** | 100 筆 | 中量測試 |
| **participants_500.csv** | 500 筆 | 效能測試 |
| **participants_1000.csv** | 1000 筆 | 壓力測試 |
| **participants_template.csv** | 5 筆 | 範本檔案 |
| **participants_with_errors.csv** | 6 筆 | 錯誤處理測試 |

#### 重新生成 CSV 檔案

如需重新生成測試檔案:

```bash
node tests/fixtures/scripts/generate-csv-files.js
```

#### CSV 格式說明

```csv
姓名,員工編號,身分證字號,Email,電話
王小明,EMP001,,wang@example.com,0912345678
李小華,,A123456789,li@example.com,0923456789
```

**欄位規則**:
- `姓名`: 必填,1-100 字元
- `員工編號` / `身分證字號`: 至少需填一個
- `Email`: 選填,需符合 Email 格式
- `電話`: 選填,允許數字、+、-、()、空白

---

### JSON 測試檔案

JSON 測試檔案位於 `tests/fixtures/json/`:

| 檔案名稱 | 用途 |
|---------|------|
| **event-complete.json** | 完整活動資料（含獎項） |
| **participants-20.json** | 20 筆參與者資料 |

#### JSON 格式範例

**event-complete.json**:
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-25T10:00:00+08:00",
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "2025 年終大抽獎",
    "status": "active"
  },
  "prizes": [
    {
      "name": "特等獎",
      "totalQuantity": 1
    }
  ]
}
```

---

### Excel 測試檔案

Excel 檔案需手動建立。參考 [tests/fixtures/excel/README.md](./fixtures/excel/README.md) 的說明:

1. 從 CSV 檔案轉換（推薦）
2. 手動建立 Excel 檔案
3. 使用線上轉換工具

---

## 測試流程建議

### 新功能開發流程

```
1. 寫程式碼
   ↓
2. 寫單元測試（或 TDD）
   ↓
3. 執行單元測試
   npm test
   ↓
4. 執行 E2E 測試
   npm run test:e2e
   ↓
5. 手動測試關鍵路徑
   參考 test-checklist.md
   ↓
6. 提交程式碼
```

### Bug 修復流程

```
1. 重現問題
   ↓
2. 寫失敗的測試案例
   ↓
3. 修復 Bug
   ↓
4. 確認測試通過
   ↓
5. 執行回歸測試
   npm run test:all
   ↓
6. 提交程式碼
```

### 發佈前測試流程

#### 第 1 階段: 自動化測試（30 分鐘）

```bash
# 1. 執行所有單元測試
npm run test:run

# 2. 執行所有 E2E 測試（所有瀏覽器）
npm run test:e2e

# 3. 產生覆蓋率報告
npm run test:coverage
```

**驗收標準**:
- ✅ 所有測試通過
- ✅ 程式碼覆蓋率 ≥ 80%
- ✅ 無 critical 等級的 lint 錯誤

#### 第 2 階段: 手動關鍵路徑測試（1 小時）

執行 [test-checklist.md](./manual/test-checklist.md) 中標記為「必做」的測試項目:

- TC-AUTH-001 ~ TC-AUTH-005（管理員登入）
- TC-CREATE-003（活動建立）
- TC-PART-002（參與者新增）
- TC-IMPORT-003（CSV 匯入）
- TC-DRAW-004（抽獎執行）
- TC-RESULT-008（結果匯出）
- TC-PUB-003（公開前台）

#### 第 3 階段: 跨瀏覽器測試（30 分鐘）

在以下瀏覽器手動測試關鍵功能:

- ✅ Chrome（最新版）
- ✅ Firefox（最新版）
- ✅ Safari（最新版,macOS）
- ✅ Edge（最新版）
- ✅ Mobile Safari（iOS）
- ✅ Chrome Mobile（Android）

#### 第 4 階段: 效能測試（30 分鐘）

執行效能測試項目（參考 test-checklist.md §效能測試）:

- TC-PERF-001 ~ TC-PERF-007

**驗收標準**:
- ✅ 首屏渲染 < 2 秒
- ✅ 抽獎動畫完成 < 5 秒（500 人以下）
- ✅ 匯入 500 筆參與者 < 10 秒
- ✅ 匯出結果 < 3 秒

---

## 常見問題

### 自動化測試相關

#### Q1: E2E 測試執行很慢怎麼辦?

**解決方法**:

1. **只執行失敗的測試**
   ```bash
   npm run test:e2e -- --retries=0 --last-failed
   ```

2. **並行執行測試**
   ```bash
   npm run test:e2e -- --workers=4
   ```

3. **使用 headed 模式加速偵錯**
   ```bash
   npm run test:e2e:debug
   ```

#### Q2: 測試一直失敗怎麼辦?

**檢查清單**:

1. ✅ 開發伺服器是否正在運作?
   ```bash
   curl http://localhost:3000
   ```

2. ✅ 是否有殘留的測試資料?
   - 清除 localStorage/sessionStorage
   - 重啟開發伺服器

3. ✅ Playwright 瀏覽器是否已安裝?
   ```bash
   npx playwright install
   ```

4. ✅ 查看詳細錯誤訊息
   ```bash
   npm run test:e2e:report
   ```

#### Q3: 如何偵錯特定測試?

```bash
# 使用 Playwright Inspector
npm run test:e2e:debug -- 01-admin-login.spec.ts

# 在測試中加入 page.pause()
# 測試會暫停,可以手動操作瀏覽器
await page.pause();
```

#### Q4: 如何只測試某個功能?

```bash
# 使用 grep 過濾
npm run test:e2e -- --grep "登入"

# 或直接執行特定檔案
npm run test:e2e -- 01-admin-login.spec.ts
```

---

### 手動測試相關

#### Q5: 測試資料從哪裡來?

**測試資料來源**:

1. **預設測試資料**: [test-data.md](./manual/test-data.md)
2. **CSV 檔案**: `tests/fixtures/csv/`
3. **JSON 檔案**: `tests/fixtures/json/`
4. **動態生成**: 使用 `test-data-generator.ts`

#### Q6: 如何清除測試資料?

**方法 1: 瀏覽器 Console**
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**方法 2: 開發者工具**
1. 開啟 Chrome DevTools (F12)
2. Application → Storage → Clear site data

**方法 3: 管理後台**
- 刪除活動（會一併刪除相關資料）

#### Q7: 如何測試大量資料?

使用預先準備的大量資料檔案:

- `participants_500.csv` (500 筆)
- `participants_1000.csv` (1000 筆)

或使用生成器動態生成:

```javascript
import { generateTestParticipantsCSV } from '@/tests/helpers/test-data-generator';

const csv = generateTestParticipantsCSV(5000); // 生成 5000 筆
```

#### Q8: 如何測試錯誤處理?

使用專門的錯誤測試檔案:

- `participants_with_errors.csv` (包含 6 筆資料,其中 2-4 筆有錯誤)
- 參考 [test-data.md §7 錯誤與邊界測試資料](./manual/test-data.md#7-錯誤與邊界測試資料)

---

### 效能測試相關

#### Q9: 如何測試抽獎動畫效能?

1. 開啟 Chrome DevTools Performance
2. 點擊「Record」
3. 執行抽獎
4. 停止錄製
5. 分析 FPS、記憶體使用

**參考標準**:
- FPS ≥ 30 (流暢)
- FPS ≥ 60 (非常流暢)

#### Q10: 如何測試大量資料匯入?

```bash
# 使用 500 筆測試檔案
# 在管理後台匯入 participants_500.csv

# 使用 1000 筆測試檔案（壓力測試）
# 在管理後台匯入 participants_1000.csv
```

**驗收標準**:
- 500 筆 < 10 秒
- 1000 筆 < 20 秒
- 無瀏覽器凍結

---

### 跨瀏覽器測試相關

#### Q11: 如何在不同瀏覽器測試?

**自動化測試**:
```bash
# Chromium
npm run test:e2e -- --project=chromium

# Firefox
npm run test:e2e -- --project=firefox

# WebKit (Safari)
npm run test:e2e -- --project=webkit

# 所有瀏覽器
npm run test:e2e
```

**手動測試**:
1. 在不同瀏覽器開啟 `http://localhost:3000`
2. 執行關鍵測試項目
3. 記錄瀏覽器特定問題

#### Q12: Safari 測試有特殊注意事項嗎?

✅ **注意事項**:

1. localStorage 限制更嚴格
2. 某些 CSS 屬性需加 `-webkit-` 前綴
3. IndexedDB 支援有限制
4. 需在 macOS 或 iOS 實機測試

---

## 測試工具參考

### Playwright 常用指令

```bash
# 產生測試程式碼
npx playwright codegen http://localhost:3000

# 查看 Trace
npx playwright show-trace trace.zip

# 查看測試報告
npm run test:e2e:report

# 更新 Playwright
npm install -D @playwright/test@latest
npx playwright install
```

### Chrome DevTools

**Console** (F12 → Console):
```javascript
// 檢查 localStorage
console.log(localStorage);

// 檢查 sessionStorage
console.log(sessionStorage);

// 清除資料
localStorage.clear();
```

**Application** (F12 → Application):
- Storage → Local Storage (查看資料)
- Storage → Session Storage (查看 session)
- Storage → IndexedDB (查看資料庫)

**Performance** (F12 → Performance):
- 錄製效能分析
- 查看 FPS、記憶體使用

---

## 參考文件

### 測試文件
- [test-checklist.md](./manual/test-checklist.md) - 手動測試檢查清單
- [test-data.md](./manual/test-data.md) - 測試資料集合
- [file-upload-testing-guide.md](./manual/file-upload-testing-guide.md) - 檔案上傳測試指南
- [TEST-FILES-READY.md](./TEST-FILES-READY.md) - 測試檔案準備狀態
- [INDEX.md](./INDEX.md) - 測試文件總索引

### 專案文件
- [quickstart.md](../specs/001-browser-lottery-system/quickstart.md) - 快速開始指南
- [spec.md](../specs/001-browser-lottery-system/spec.md) - 功能規格
- [data-model.md](../specs/001-browser-lottery-system/data-model.md) - 資料模型

### 測試框架文件
- [Playwright 官方文件](https://playwright.dev/)
- [Vitest 官方文件](https://vitest.dev/)
- [Testing Library 官方文件](https://testing-library.com/)

---

## 總結

### 測試檢查清單

在提交程式碼前,確認以下項目:

- [ ] 所有 E2E 測試通過
- [ ] 所有單元測試通過（若已實作）
- [ ] 手動測試關鍵路徑
- [ ] 程式碼覆蓋率 ≥ 80%
- [ ] 無 ESLint 錯誤
- [ ] 跨瀏覽器測試通過（至少 Chrome + Firefox）
- [ ] 效能測試符合標準
- [ ] 文件已更新

### 測試最佳實踐

1. **持續測試**: 開發時隨時執行測試
2. **優先自動化**: 重複性高的測試優先自動化
3. **保持簡潔**: 測試程式碼也要易讀易維護
4. **獨立性**: 測試之間不應相互依賴
5. **快速反饋**: 單元測試應該很快完成
6. **記錄結果**: 保存測試報告以便追蹤
7. **定期更新**: 功能變更時同步更新測試

---

**最後更新**: 2025-10-25
**維護者**: 開發團隊
**狀態**: ✅ 測試基礎設施已完成

如有問題請參考 [常見問題](#常見問題) 或聯繫開發團隊。
