# 測試文件總索引

**專案名稱**: Lottery-V1 (Browser-Based Lottery System)
**建立日期**: 2025-10-25

本文件提供所有測試相關文件的快速導航與概覽。

---

## 📋 文件結構

```
tests/
├── TESTING-GUIDE.md                          ✅ 完整測試指南（主要文件）
├── QUICK-REFERENCE.md                        ✅ 測試快速參考卡
├── TEST-FILES-READY.md                       ✅ 測試檔案準備狀態
├── INDEX.md                                  ✅ 本文件（總索引）
│
├── manual/                                    # 手動測試文件
│   ├── README.md                             ✅ 測試使用說明
│   ├── test-checklist.md                     ✅ 詳細測試清單（200+ 項目）
│   ├── test-data.md                          ✅ 完整測試資料集合
│   ├── test-checklist-quickstart-comparison.md  ✅ 與 quickstart 對照表
│   └── file-upload-testing-guide.md         ✅ 檔案上傳測試指南
│
├── fixtures/                                  # 測試資料檔案
│   ├── csv/                                  # CSV 測試檔案
│   │   ├── README.md                         ✅ CSV 使用說明
│   │   ├── participants_20.csv               ✅ 20 筆標準資料
│   │   ├── participants_100.csv              ✅ 100 筆資料
│   │   ├── participants_500.csv              ✅ 500 筆資料
│   │   ├── participants_1000.csv             ✅ 1000 筆資料
│   │   ├── participants_template.csv         ✅ 5 筆範本
│   │   └── participants_with_errors.csv      ✅ 含錯誤資料
│   │
│   ├── excel/                                # Excel 測試檔案
│   │   └── README.md                         ✅ Excel 建立說明
│   │
│   ├── json/                                 # JSON 測試檔案
│   │   ├── README.md                         ✅ JSON 使用說明
│   │   ├── event-complete.json               ✅ 完整活動資料
│   │   └── participants-20.json              ✅ 20 筆參與者資料
│   │
│   └── scripts/                              # 測試資料生成腳本
│       └── generate-csv-files.js             ✅ CSV 生成器
│
├── helpers/                                   # 測試輔助工具
│   ├── test-data-generator.ts                ✅ TypeScript 資料生成器
│   └── test-helpers.ts                       ✅ 測試輔助函式
│
├── e2e/                                      # E2E 測試（Playwright）
│   ├── 01-admin-login.spec.ts               ✅ 管理員登入測試（12 個測試）
│   ├── 02-complete-workflow.spec.ts         ✅ 完整流程測試（8 個測試）
│   └── 03-public-frontend.spec.ts           ✅ 公開前台測試（10 個測試）
│
└── setup.ts                                  ✅ 測試設定檔（Vitest）
```

---

## 🚀 快速開始

### 新手入門（5 分鐘）

1. **閱讀測試指南**
   - 📘 **完整指南**: [TESTING-GUIDE.md](./TESTING-GUIDE.md) - 涵蓋所有測試類型與流程
   - 📄 **快速參考**: [QUICK-REFERENCE.md](./QUICK-REFERENCE.md) - 常用指令與資料速查
   - 📋 **手動測試**: [manual/README.md](./manual/README.md) - 手動測試使用說明

2. **準備測試環境**
   ```bash
   npm install                # 安裝依賴
   npx playwright install    # 安裝瀏覽器
   npm run dev               # 啟動開發伺服器
   # 開啟 http://localhost:3000
   ```

3. **執行快速驗證**

   **方法 1: 自動化測試**（推薦）
   ```bash
   npm run test:e2e          # 執行所有 E2E 測試 (5-10 分鐘)
   ```

   **方法 2: 手動測試**
   - 使用測試密碼: `Test1234`
   - 使用 5 人快速資料集
   - 參考 [test-checklist.md §常用測試資料](./manual/test-checklist.md#常用測試資料快速參考)

---

## 📖 主要文件說明

### 0. 測試指南 (TESTING-GUIDE.md) ⭐ **最重要**

**用途**: 完整的測試執行指南與流程

**內容**:
- 測試概覽與覆蓋範圍
- 快速開始指南（5 分鐘驗證）
- 自動化測試執行方法（E2E、單元測試）
- 手動測試執行方法
- 測試資料準備與使用
- 測試流程建議（新功能開發、Bug 修復、發佈前）
- 常見問題解答（Q&A）

**適用對象**: 所有測試人員、開發者

**路徑**: [tests/TESTING-GUIDE.md](./TESTING-GUIDE.md)

**何時使用**:
- 第一次執行測試
- 不確定如何測試某個功能
- 需要了解完整測試流程
- 遇到測試問題需要排查

---

### 0.1. 快速參考卡 (QUICK-REFERENCE.md) ⭐ **隨時查閱**

**用途**: 常用指令、資料、場景的快速索引

**內容**:
- 常用測試指令速查
- 測試資料快速參考
- 測試場景速查（5分鐘/30分鐘/1小時）
- 發佈前檢查清單
- 常見問題速查
- 偵錯技巧

**適用對象**: 所有測試人員、開發者

**路徑**: [tests/QUICK-REFERENCE.md](./QUICK-REFERENCE.md)

**何時使用**:
- 忘記測試指令
- 需要快速查找測試資料
- 需要執行標準測試場景
- 快速排查問題

---

### 1. 測試清單 (test-checklist.md)

**用途**: 完整的手動測試檢查清單

**內容**:
- 200+ 測試項目
- 涵蓋 9 大功能模組
- 每個項目包含測試資料、步驟、預期結果
- 與 quickstart.md 100% 一致

**適用對象**: QA 測試人員、開發者自測

**路徑**: [tests/manual/test-checklist.md](./manual/test-checklist.md)

---

### 2. 測試資料 (test-data.md)

**用途**: 所有測試所需的資料集合

**內容**:
- 管理員帳號（有效/無效密碼）
- 活動資料（小/中/大型，7 種場景）
- 獎項資料（3 種組合）
- 參與者資料（10 筆 + 邊界/錯誤測試）
- CSV/JSON 檔案說明
- 快速測試資料集

**適用對象**: 所有測試人員

**路徑**: [tests/manual/test-data.md](./manual/test-data.md)

---

### 3. 檔案上傳測試指南 (file-upload-testing-guide.md)

**用途**: CSV/Excel/JSON 檔案上傳的完整測試指南

**內容**:
- CSV 上傳測試（20/100/500/1000 筆）
- Excel 上傳測試
- JSON 上傳測試
- 錯誤處理測試
- 效能測試
- 跨瀏覽器測試

**適用對象**: 測試檔案上傳功能的測試人員

**路徑**: [tests/manual/file-upload-testing-guide.md](./manual/file-upload-testing-guide.md)

---

### 4. Quickstart 對照表 (test-checklist-quickstart-comparison.md)

**用途**: 確保測試清單與 quickstart.md 一致

**內容**:
- 已確認一致的項目對照表
- 修正紀錄
- 測試覆蓋率檢查（100%）
- 關鍵差異提醒

**適用對象**: 維護測試文件的開發者

**路徑**: [tests/manual/test-checklist-quickstart-comparison.md](./manual/test-checklist-quickstart-comparison.md)

---

## 📊 測試資料檔案

### CSV 檔案

| 檔案 | 用途 | 資料量 |
|------|------|--------|
| participants_20.csv | 標準測試 | 20 筆 |
| participants_100.csv | 效能測試 | 100 筆 |
| participants_500.csv | 大規模測試 | 500 筆 |
| participants_1000.csv | 壓力測試 | 1000 筆 |
| participants_template.csv | 範本檔案 | 5 筆 |
| participants_with_errors.csv | 錯誤處理測試 | 6 筆 |

**位置**: `tests/fixtures/csv/`
**說明**: [tests/fixtures/csv/README.md](./fixtures/csv/README.md)

---

### JSON 檔案

| 檔案 | 用途 |
|------|------|
| event-complete.json | 完整活動資料（含獎項） |
| participants-20.json | 20 筆參與者資料 |

**位置**: `tests/fixtures/json/`
**說明**: [tests/fixtures/json/README.md](./fixtures/json/README.md)

---

### Excel 檔案（需手動建立）

**位置**: `tests/fixtures/excel/`
**說明**: [tests/fixtures/excel/README.md](./fixtures/excel/README.md)

參考說明從 CSV 轉換或直接建立 Excel 測試檔案。

---

## 🛠️ 測試工具與腳本

### 測試資料生成器

#### Node.js 腳本（CSV）

```bash
# 生成所有 CSV 測試檔案
node tests/fixtures/scripts/generate-csv-files.js

# 輸出：
# - participants_100.csv
# - participants_500.csv
# - participants_1000.csv
# - participants_template.csv
```

**路徑**: `tests/fixtures/scripts/generate-csv-files.js`

---

#### TypeScript 模組

```typescript
import {
  generateSmallTestScenario,
  generateMediumTestScenario,
  generateLargeTestScenario,
  generateTestParticipantsCSV
} from '@/tests/helpers/test-data-generator';

// 小型場景（20 人，2 獎項）
const small = generateSmallTestScenario();

// 中型場景（100 人，3 獎項）
const medium = generateMediumTestScenario();

// 大型場景（500 人，5 獎項）
const large = generateLargeTestScenario();
```

**路徑**: `tests/helpers/test-data-generator.ts`

---

## ✅ 測試檢查清單

### 基本功能測試（必做）

- [ ] 管理員登入與認證（TC-AUTH-001 ~ TC-AUTH-014）
- [ ] 活動建立與管理（TC-CREATE-001 ~ TC-CREATE-011）
- [ ] 參與者手動新增（TC-PART-001 ~ TC-PART-009）
- [ ] 參與者 CSV 匯入（TC-IMPORT-001 ~ TC-IMPORT-012）
- [ ] 獎項管理（TC-EDIT-009 ~ TC-EDIT-011）
- [ ] 抽獎執行（TC-DRAW-001 ~ TC-DRAW-022）
- [ ] 結果查看與匯出（TC-RESULT-001 ~ TC-RESULT-019）
- [ ] 公開前台（TC-PUB-001 ~ TC-PUB-022）

### 進階測試（建議）

- [ ] 重複中獎規則（TC-DRAW-015 ~ TC-DRAW-016）
- [ ] ID 遮罩顯示（TC-PART-008, TC-RESULT-010）
- [ ] 資料持久化（TC-PERSIST-001 ~ TC-PERSIST-010）
- [ ] 響應式設計（TC-RWD-001 ~ TC-RWD-007）

### 效能測試（選做）

- [ ] 大量匯入（TC-PERF-007）
- [ ] 抽獎動畫（TC-PERF-004 ~ TC-PERF-006）
- [ ] 瀏覽器相容性（TC-COMPAT-001 ~ TC-COMPAT-007）

---

## 📝 測試流程建議

### 標準測試流程（30 分鐘）

```
1. 啟動開發伺服器
   npm run dev

2. 管理員登入測試
   密碼: Test1234

3. 建立測試活動
   名稱: 部門尾牙抽獎
   日期: 未來任一日期

4. 匯入參與者
   檔案: participants_20.csv

5. 設定獎項
   特等獎 x1, 頭獎 x2, 貳獎 x5

6. 執行抽獎
   觀察動畫、確認中獎者

7. 查看與匯出結果
   驗證 ID 遮罩、匯出 CSV

8. 公開前台驗證
   檢查前台顯示
```

### 完整測試流程（2-3 小時）

按照 [test-checklist.md](./manual/test-checklist.md) 逐項執行所有測試。

---

## 🔗 相關文件連結

### 專案文件

- **功能規格**: `specs/001-browser-lottery-system/spec.md`
- **快速開始**: `specs/001-browser-lottery-system/quickstart.md`
- **資料模型**: `specs/001-browser-lottery-system/data-model.md`
- **實作計畫**: `specs/001-browser-lottery-system/plan.md`
- **專案說明**: `CLAUDE.md`

### 測試文件

- **測試清單**: [tests/manual/test-checklist.md](./manual/test-checklist.md)
- **測試資料**: [tests/manual/test-data.md](./manual/test-data.md)
- **上傳測試**: [tests/manual/file-upload-testing-guide.md](./manual/file-upload-testing-guide.md)

---

## 📞 問題回報

如發現測試文件問題或需要補充：

1. 檢查相關 README 文件
2. 參考 quickstart.md 確認操作步驟
3. 查看測試資料是否完整
4. 聯繫開發團隊

---

## 🎯 文件維護

### 文件更新檢查清單

- [ ] 測試清單與 quickstart.md 保持一致
- [ ] 測試資料檔案完整可用
- [ ] 測試腳本可正常執行
- [ ] 文件連結正確無誤
- [ ] 範例資料格式正確

### 版本更新

當系統功能更新時，需同步更新：

1. **test-checklist.md** - 新增或修改測試項目
2. **test-data.md** - 更新測試資料
3. **test-checklist-quickstart-comparison.md** - 更新對照表
4. **本文件** - 更新索引與說明

---

**文件版本**: 1.0
**最後更新**: 2025-10-25
**維護者**: 測試團隊
**狀態**: ✅ 所有測試文件已完成
