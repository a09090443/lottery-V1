# 手動測試文件

此目錄包含完整的手動測試文件與測試資料。

## 📁 檔案說明

### 主要文件

| 檔案 | 說明 |
|------|------|
| **test-checklist.md** | 📋 詳細測試清單（200+ 測試項目） |
| **test-data.md** | 📊 完整測試資料集合 |
| **README.md** | 📖 本檔案，使用說明 |

### 測試資料檔案

所有 CSV 與測試檔案儲存於 `tests/fixtures/` 目錄：

```
tests/fixtures/
├── csv/
│   ├── participants_20.csv        # 20 筆標準測試資料
│   ├── participants_100.csv       # 100 筆中型測試資料
│   ├── participants_500.csv       # 500 筆大型測試資料
│   └── participants_with_errors.csv  # 含錯誤資料（驗證測試用）
├── json/
│   ├── event_standard.json        # 標準活動資料
│   └── prizes_complete.json       # 完整獎項組合
└── screenshots/
    └── (測試截圖)
```

---

## 🚀 快速開始

### 1. 首次測試準備

```bash
# 1. 啟動開發伺服器
npm run dev

# 2. 清空瀏覽器資料（若需要乾淨環境）
# 開啟 DevTools (F12) → Application → Storage → Clear site data

# 3. 開啟測試清單
# 打開 test-checklist.md
```

### 2. 執行標準測試流程

#### Step 1: 管理員登入測試
- 開啟 `test-checklist.md` → §2 管理員登入測試
- 使用測試密碼: `Test1234`
- 完成 TC-AUTH-001 ~ TC-AUTH-014

#### Step 2: 建立測試活動
- 使用測試資料: [test-data.md §2.1 活動A](./test-data.md#活動-a---小型活動)
- 活動名稱: `部門尾牙抽獎`
- 完成 TC-CREATE-001 ~ TC-CREATE-011

#### Step 3: 新增參與者
**選項 A: 手動新增**
- 使用測試資料: [test-data.md §4.1](./test-data.md#41-手動輸入測試資料10-筆)
- 新增 5-10 位參與者
- 完成 TC-PART-001 ~ TC-PART-009

**選項 B: CSV 批次匯入**
- 使用檔案: `tests/fixtures/csv/participants_20.csv`
- 完成 TC-IMPORT-001 ~ TC-IMPORT-012

#### Step 4: 新增獎項
- 使用測試資料: [test-data.md §3.1 組合A](./test-data.md#組合-a---傳統獎項3-個獎項)
- 新增 3 個獎項（特等獎、頭獎、貳獎）
- 完成 TC-EDIT-009 ~ TC-EDIT-011

#### Step 5: 執行抽獎
- 完成 TC-DRAW-001 ~ TC-DRAW-022
- 驗證抽獎動畫、重複中獎規則等

#### Step 6: 查看與匯出結果
- 完成 TC-RESULT-001 ~ TC-RESULT-019

---

## 📊 測試資料使用指南

### 使用測試資料產生器（推薦）

```typescript
// 方法 1: 在瀏覽器 Console 中使用（開發模式）
// 1. 開啟開發者工具 (F12)
// 2. 切換到 Console 分頁
// 3. 執行以下程式碼

// 生成小型測試場景（20人, 2獎項）
const testData = {
  participants: [
    { name: '王小明', employeeId: 'EMP20250001', email: 'test1@example.com' },
    { name: '李小華', employeeId: 'EMP20250002', email: 'test2@example.com' },
    // ... 共 20 人
  ]
};

// 方法 2: 使用內建產生器（自動化測試）
import {
  generateSmallTestScenario,
  generateTestParticipantsCSV
} from '@/tests/helpers/test-data-generator';

const scenario = generateSmallTestScenario();
console.log(scenario.event);        // 活動資料
console.log(scenario.prizes);       // 獎項資料
console.log(scenario.participants); // 參與者資料
```

### 使用預設 CSV 檔案

```bash
# CSV 檔案位置
tests/fixtures/csv/participants_20.csv

# 在系統中匯入
1. 進入活動編輯頁面
2. 點擊「匯入參與者」
3. 選擇 CSV 檔案
4. 確認匯入
```

### 使用測試資料文件

所有測試項目都包含測試資料引用連結，例如：

```markdown
- [ ] **TC-PART-002**: 成功新增參與者
  - **測試資料**: → [test-data.md §4.1](./test-data.md#41-手動輸入測試資料10-筆)
    - 姓名: `王小明`
    - 員工編號: `EMP20250001`
    ...
```

點擊連結即可查看完整測試資料。

---

## ✅ 測試檢查清單

### 基本功能測試（必做）

- [ ] 管理員登入與認證
- [ ] 活動建立、編輯、刪除
- [ ] 參與者手動新增與編輯
- [ ] 參與者 CSV 批次匯入
- [ ] 獎項管理
- [ ] 抽獎執行（含動畫）
- [ ] 抽獎結果查看與匯出
- [ ] 公開前台瀏覽

### 進階功能測試（建議）

- [ ] 重複中獎規則測試
- [ ] 多數量獎項抽獎
- [ ] ID 遮罩顯示驗證
- [ ] 資料持久化（重新整理、關閉瀏覽器）
- [ ] 響應式設計（手機、平板、桌面）

### 效能測試（選做）

- [ ] 大量參與者匯入（500 筆）
- [ ] 大型活動抽獎（1000 參與者）
- [ ] 抽獎動畫流暢度
- [ ] 結果匯出效能

### 邊界與錯誤測試（選做）

- [ ] 無效資料輸入驗證
- [ ] 空狀態顯示
- [ ] 數量邊界測試
- [ ] 特殊字元與 XSS 防護

---

## 📝 測試報告

完成測試後，請使用 **test-checklist.md** 末尾的測試報告範本填寫報告。

### 測試報告範本位置
- [test-checklist.md §測試報告範本](./test-checklist.md#測試報告範本)

### 報告包含項目
- 測試環境資訊
- 測試結果摘要（通過率）
- 失敗測試項目明細
- 發現的問題與建議

---

## 🔧 常見問題

### Q1: 如何清空測試資料？

**A**: 開啟開發者工具 (F12) → Application → Storage → Local Storage → 選擇網站 → 點擊「Clear All」

### Q2: CSV 匯入失敗，顯示編碼錯誤？

**A**: 確保 CSV 檔案使用 **UTF-8 with BOM** 編碼。可用記事本開啟 CSV，選擇「另存新檔」→ 編碼選擇「UTF-8」。

### Q3: 測試資料產生器如何使用？

**A**: 參考 [test-data.md §9 測試資料產生器](./test-data.md#9-測試資料產生器)

### Q4: 抽獎動畫太快/太慢？

**A**: 這可能是效能問題或動畫設定問題，請記錄於測試報告中。

### Q5: 如何驗證 ID 遮罩功能？

**A**:
1. 新增參與者時輸入完整 ID（如 `EMP20250001`）
2. 檢查列表顯示是否為 `EMP202****`
3. 匯出結果檢查 CSV 是否包含完整 ID

---

## 🔗 相關連結

- **功能規格**: `specs/001-browser-lottery-system/spec.md`
- **資料模型**: `specs/001-browser-lottery-system/data-model.md`
- **專案說明**: `CLAUDE.md`
- **專案憲章**: `.specify/memory/constitution.md`

---

## 📞 聯絡與支援

如有測試相關問題：
1. 查閱本文件與 test-data.md
2. 參考功能規格文件
3. 聯繫開發團隊

---

**最後更新**: 2025-10-25
**版本**: 1.0
**狀態**: ✅ 測試資料已完整建立
