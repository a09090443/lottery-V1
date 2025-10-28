# E2E 測試說明

## 📋 測試概覽

本專案使用 Playwright 進行端對端（E2E）測試，涵蓋完整的抽獎系統功能。

### 測試文件結構

```
tests/
├── helpers/
│   ├── test-data-generator.ts    # 測試資料生成器
│   └── test-helpers.ts            # 測試輔助函式
└── e2e/
    ├── 01-admin-login.spec.ts     # 管理員登入測試（12 個測試）
    ├── 02-complete-workflow.spec.ts  # 完整流程測試（8 個測試）
    └── 03-public-frontend.spec.ts    # 公開前台測試（10 個測試）
```

**總測試數量**: 30+ 測試案例

---

## 🚀 執行測試

### 前置準備

```bash
# 確保已安裝所有依賴
npm install

# 安裝 Playwright 瀏覽器
npx playwright install
```

### 執行所有測試

```bash
# 執行所有 E2E 測試
npm run test:e2e

# 或使用 Playwright 命令
npx playwright test
```

### 執行特定測試檔案

```bash
# 只執行登入測試
npx playwright test 01-admin-login

# 只執行完整流程測試
npx playwright test 02-complete-workflow

# 只執行公開前台測試
npx playwright test 03-public-frontend
```

### 執行特定測試案例

```bash
# 執行包含特定文字的測試
npx playwright test -g "完整流程"

# 執行特定測試 ID
npx playwright test -g "01-01"
```

### UI 模式（推薦用於開發）

```bash
# 開啟 Playwright UI 模式
npm run test:e2e:ui

# 或
npx playwright test --ui
```

### 偵錯模式

```bash
# 以偵錯模式執行測試
npm run test:e2e:debug

# 或
npx playwright test --debug
```

### 查看測試報告

```bash
# 執行測試並產生報告
npx playwright test --reporter=html

# 查看報告
npx playwright show-report
```

---

## 📊 測試涵蓋功能

### 1. 管理員登入測試 (01-admin-login.spec.ts)

- ✅ 首次訪問密碼設定
- ✅ 密碼驗證（長度、一致性）
- ✅ 正確/錯誤密碼登入
- ✅ 登入速率限制（5次失敗鎖定）
- ✅ 登出功能
- ✅ 未登入重定向
- ✅ Session 逾時
- ✅ 安全提示顯示
- ✅ Loading 狀態

### 2. 完整流程測試 (02-complete-workflow.spec.ts)

- ✅ 端對端完整流程：建立活動 → 設定獎項 → 匯入參與者 → 抽獎 → 匯出結果
- ✅ 手動新增參與者
- ✅ 參與者搜尋功能
- ✅ 參與者分頁功能
- ✅ 不允許重複中獎測試
- ✅ 儲存空間監控
- ✅ 匯出提醒
- ✅ 確認對話框

### 3. 公開前台測試 (03-public-frontend.spec.ts)

- ✅ 首頁顯示
- ✅ 活動列表頁
- ✅ 活動詳情頁
- ✅ 中獎名單顯示（ID 遮罩）
- ✅ 中獎查詢頁
- ✅ 無管理功能按鈕
- ✅ 響應式設計（手機/平板）
- ✅ 活動狀態顯示
- ✅ 404 錯誤處理

---

## 🔧 測試資料生成器

### 使用測試資料生成器

```typescript
import {
  generateTestEvent,
  generateTestPrizes,
  generateTestParticipants,
  generateCompleteTestScenario,
  generateSmallTestScenario,
  generateMediumTestScenario,
  generateLargeTestScenario,
} from '../helpers/test-data-generator';

// 生成小型測試場景（20 位參與者，2 個獎項）
const smallScenario = generateSmallTestScenario();

// 生成中型測試場景（100 位參與者，3 個獎項）
const mediumScenario = generateMediumTestScenario();

// 生成大型測試場景（500 位參與者，5 個獎項）
const largeScenario = generateLargeTestScenario();

// 自訂參與者數量
const customScenario = generateCompleteTestScenario({
  participantCount: 150,
  prizeCount: 4,
  includeEmail: true,
  includePhone: true,
});
```

### 測試資料特性

- **中文姓名**: 隨機生成真實的中文姓名
- **員工編號**: EMP{年份}{流水號}，如 EMP20240001
- **身分證字號**: 隨機生成（僅供測試，非真實資料）
- **Email**: user{序號}@{隨機網域}
- **電話**: 隨機生成台灣手機/市話號碼
- **CSV 格式**: 自動產生含 BOM 的 UTF-8 CSV（Excel 相容）

---

## 🛠️ 測試輔助函式

### 常用輔助函式

```typescript
import {
  clearBrowserStorage,    // 清除瀏覽器儲存
  setupAdminPassword,     // 設定管理員密碼
  adminLogin,             // 管理員登入
  adminLogout,            // 管理員登出
  createTestEvent,        // 建立測試活動
  addPrize,               // 新增獎項
  addParticipant,         // 新增參與者
  importParticipantsCSV,  // 匯入參與者 CSV
  executeDraw,            // 執行抽獎
  confirmWinner,          // 確認中獎者
  exportResults,          // 匯出結果
  expectToast,            // 檢查 Toast 通知
  confirmDialog,          // 確認對話框
  takeScreenshot,         // 截圖
} from '../helpers/test-helpers';
```

---

## 📈 測試最佳實踐

### 1. 獨立性
每個測試應該獨立運行，不依賴其他測試的狀態。

```typescript
test.beforeEach(async ({ page }) => {
  // 每個測試前清除狀態
  await clearBrowserStorage(page);
});
```

### 2. 清晰的測試命名
使用編號和描述性名稱。

```typescript
test('01-01: 首次訪問應顯示密碼設定頁面', async ({ page }) => {
  // ...
});
```

### 3. 使用測試資料生成器
避免硬編碼測試資料，使用生成器建立隨機且真實的資料。

```typescript
const scenario = generateSmallTestScenario();
const eventName = generateUniqueEventName('測試活動');
```

### 4. 適當的等待時間
使用 Playwright 的等待機制，而非固定延遲。

```typescript
// ✅ 好的做法
await expect(page.locator('text=成功')).toBeVisible();

// ❌ 不好的做法
await page.waitForTimeout(3000);
```

### 5. 錯誤截圖
測試失敗時自動截圖。

```typescript
test('測試案例', async ({ page }) => {
  try {
    // 測試邏輯
  } catch (error) {
    await takeScreenshot(page, 'error-state');
    throw error;
  }
});
```

---

## 🐛 除錯技巧

### 1. 使用 UI 模式
```bash
npx playwright test --ui
```
可視化查看測試執行過程，暫停、步進除錯。

### 2. 使用 --debug
```bash
npx playwright test --debug
```
開啟 Playwright Inspector 進行互動式除錯。

### 3. 查看追蹤記錄
```bash
npx playwright test --trace on
```
記錄完整的測試執行過程，失敗後可回放。

### 4. 只執行失敗的測試
```bash
npx playwright test --last-failed
```

---

## 📝 撰寫新測試

### 測試模板

```typescript
import { test, expect } from '@playwright/test';
import {
  clearBrowserStorage,
  setupAdminPassword,
  adminLogin,
} from '../helpers/test-helpers';

test.describe('功能名稱測試', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
    await setupAdminPassword(page);
    await adminLogin(page);
  });

  test('測試案例描述', async ({ page }) => {
    // Arrange: 準備測試資料
    const testData = generateTestData();

    // Act: 執行操作
    await performAction(page, testData);

    // Assert: 驗證結果
    await expect(page.locator('text=預期結果')).toBeVisible();
  });
});
```

---

## ⚙️ 設定檔

Playwright 設定位於 `playwright.config.ts`。

主要設定項目：
- **baseURL**: http://localhost:3000
- **瀏覽器**: Chromium, Firefox, WebKit
- **並行執行**: 是
- **重試次數**: 失敗時重試 1 次
- **超時時間**: 30 秒

---

## 📊 持續整合 (CI)

### GitHub Actions 範例

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 測試覆蓋目標

- ✅ **功能覆蓋**: 100% 核心功能
- ✅ **路由覆蓋**: 所有主要頁面
- ✅ **使用者流程**: 完整端對端流程
- ✅ **錯誤處理**: 邊界案例與錯誤狀態
- ✅ **響應式**: 手機/平板/桌面

---

## 📞 問題回報

如果測試失敗或發現問題，請提供：
1. 測試名稱
2. 錯誤訊息
3. 截圖或追蹤記錄
4. 重現步驟

---

**最後更新**: 2025-10-25
**測試案例總數**: 30+
**狀態**: ✅ 完整測試套件已建立
