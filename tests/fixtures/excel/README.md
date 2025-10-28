# Excel 測試檔案說明

此目錄用於存放 Excel 格式的測試檔案。

---

## 📋 如何建立 Excel 測試檔案

由於系統無法直接生成 `.xlsx` 檔案，請使用以下方法建立：

### 方法 1：從 CSV 轉換（推薦）

1. **使用現有 CSV 檔案**
   ```
   tests/fixtures/csv/participants_20.csv
   tests/fixtures/csv/participants_100.csv
   tests/fixtures/csv/participants_template.csv
   ```

2. **在 Excel 中開啟 CSV**
   - 開啟 Microsoft Excel
   - 檔案 → 開啟 → 選擇 CSV 檔案
   - 確認編碼為 UTF-8

3. **另存為 Excel 格式**
   - 檔案 → 另存新檔
   - 選擇格式：`Excel 活頁簿 (*.xlsx)`
   - 儲存至此目錄：`tests/fixtures/excel/`

### 方法 2：直接在 Excel 建立

1. **開啟 Excel 新檔案**

2. **填寫標題列（第 1 列）**
   ```
   A1: 姓名
   B1: 員工編號
   C1: 身分證字號
   D1: Email
   E1: 電話
   ```

3. **填寫測試資料（從第 2 列開始）**

   範例：
   ```
   A2: 王小明    B2: EMP20250001    C2: (空白)         D2: wang@example.com    E2: 0912345678
   A3: 李小華    B3: EMP20250002    C3: (空白)         D3: li@example.com      E3: 0923456789
   A4: 張大偉    B4: (空白)         C4: A123456789    D4: zhang@example.com   E4: 0934567890
   ```

4. **儲存檔案**
   - 檔案名稱：`participants_20.xlsx`（或其他數量）
   - 格式：`Excel 活頁簿 (*.xlsx)`

---

## 📁 建議建立的 Excel 檔案

### 標準測試檔案

| 檔案名稱 | 資料量 | 用途 |
|---------|--------|------|
| **participants_20.xlsx** | 20 筆 | 標準批次匯入測試 |
| **participants_100.xlsx** | 100 筆 | 中等規模匯入測試 |
| **participants_500.xlsx** | 500 筆 | 大規模匯入測試 |
| **participants_template.xlsx** | 5 筆 | 範本檔案（供使用者下載） |

### 特殊測試檔案

| 檔案名稱 | 說明 | 用途 |
|---------|------|------|
| **participants_with_errors.xlsx** | 含錯誤資料 | 驗證錯誤處理 |
| **participants_empty.xlsx** | 僅有標題列，無資料 | 測試空檔案處理 |
| **participants_special_chars.xlsx** | 包含特殊字元 | 測試特殊字元處理 |

---

## 🔧 Excel 格式要求

### 必要欄位（標題列）

```
姓名 | 員工編號 | 身分證字號 | Email | 電話
```

**注意事項**:
- 標題列必須位於第 1 列
- 欄位名稱必須完全一致（包含中文）
- 順序可以不同，但建議按上述順序排列

### 資料格式要求

| 欄位 | 格式 | 必填 | 範例 |
|-----|------|------|------|
| 姓名 | 純文字 | ✅ 是 | `王小明` |
| 員工編號 | 純文字 | ⚠️ 二選一 | `EMP20250001` |
| 身分證字號 | 純文字 | ⚠️ 二選一 | `A123456789` |
| Email | 純文字（email格式） | ❌ 否 | `wang@example.com` |
| 電話 | 純文字或數字 | ❌ 否 | `0912345678` 或 `'0912345678` |

**重要提醒**:
- 員工編號與身分證字號至少需填寫一個
- 電話號碼建議設定為「文字」格式（前面加 `'`），避免 Excel 自動轉換為數字而丟失前導 0

---

## 📊 Excel 範本內容範例

### Sheet 1: 參與者資料

| 姓名 | 員工編號 | 身分證字號 | Email | 電話 |
|------|---------|-----------|-------|------|
| 王建國 | EMP20251001 |  | wang.jianguo@company.com | 0912111001 |
| 李美玲 | EMP20251002 |  | li.meiling@company.com | 0912111002 |
| 張志強 | EMP20251003 |  | zhang.zhiqiang@company.com | 0912111003 |
| 楊淑惠 |  | A123456001 | yang.shuhui@company.com | 0922111011 |
| 賴文傑 |  | B234567002 | lai.wenjie@company.com | 0922111012 |

### Sheet 2: 說明文件（選填）

可在第二個工作表加入說明：

```
參與者匯入範本

格式說明：
1. 姓名：必填，1-100 字元
2. 員工編號：與身分證字號至少填一個
3. 身分證字號：與員工編號至少填一個
4. Email：選填，需符合 email 格式
5. 電話：選填，建議設為文字格式

注意事項：
- 請勿修改標題列
- 每列代表一位參與者
- 刪除此說明工作表後再上傳
```

---

## ⚠️ 常見問題

### Q1: Excel 檔案匯入失敗，顯示「無法讀取檔案」？

**A**: 確認：
1. 檔案格式為 `.xlsx`（不是 `.xls` 或 `.xlsm`）
2. 檔案未損壞
3. 標題列位於第 1 列
4. 標題列欄位名稱正確

### Q2: 電話號碼前面的 0 消失了？

**A**: Excel 會將電話號碼視為數字，導致前導 0 消失。解決方法：
- 在數字前加單引號：`'0912345678`
- 或將儲存格格式設為「文字」

### Q3: 中文亂碼？

**A**: Excel 檔案應使用 UTF-8 編碼。若從 CSV 轉換，確保 CSV 檔案為 UTF-8 with BOM 編碼。

### Q4: 可以包含多個工作表嗎？

**A**: 系統只會讀取第一個工作表的資料，其他工作表會被忽略。

---

## 🔗 相關檔案

- **CSV 測試檔案**: `tests/fixtures/csv/`
- **JSON 測試檔案**: `tests/fixtures/json/`
- **測試資料文件**: `tests/manual/test-data.md`
- **測試清單**: `tests/manual/test-checklist.md`

---

## 📝 快速建立 Excel 測試檔案步驟

```bash
# 1. 使用 CSV 檔案
cd tests/fixtures/csv

# 2. 在 Excel 中開啟 participants_20.csv

# 3. 另存為 Excel 格式
# 檔案 → 另存新檔 → 格式選擇「Excel 活頁簿 (*.xlsx)」
# 儲存至 tests/fixtures/excel/participants_20.xlsx

# 4. 重複步驟 2-3 建立其他測試檔案
```

---

**最後更新**: 2025-10-25
**維護者**: 測試團隊
