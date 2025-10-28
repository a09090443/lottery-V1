# CSV 測試檔案

此目錄包含用於測試的 CSV 檔案。

## 📁 檔案說明

### 標準測試檔案

| 檔案名稱 | 說明 | 資料量 | 用途 |
|---------|------|--------|------|
| **participants_20.csv** | 標準測試資料 | 20 筆 | 標準批次匯入測試 |
| **participants_100.csv** | 中量測試資料 | 100 筆 | 中等規模匯入測試 |
| **participants_500.csv** | 大量測試資料 | 500 筆 | 大規模匯入、效能測試 |
| **participants_1000.csv** | 超大量測試資料 | 1000 筆 | 壓力測試、極限測試 |
| **participants_template.csv** | 範本檔案 | 5 筆 | 使用者下載範本 |
| **participants_with_errors.csv** | 含錯誤資料 | 6 筆（2筆錯誤） | 驗證與錯誤處理測試 |

**註**: 所有檔案已生成完成，可直接使用。若需重新生成，請執行：
```bash
node tests/fixtures/scripts/generate-csv-files.js
```

---

## 🔧 如何使用

### 1. 使用現有 CSV 檔案

```bash
# 在系統中匯入
1. 登入管理後台
2. 建立或編輯活動
3. 點擊「匯入參與者」
4. 選擇 CSV 檔案（如 participants_20.csv）
5. 確認匯入
```

### 2. 生成大量測試 CSV

使用測試資料產生器：

```typescript
import { generateTestParticipantsCSV } from '@/tests/helpers/test-data-generator';

// 生成 100 筆資料的 CSV
const csv100 = generateTestParticipantsCSV(100);

// 下載為檔案（在瀏覽器中）
const blob = new Blob(['\uFEFF' + csv100], { type: 'text/csv;charset=utf-8;' });
const link = document.createElement('a');
link.href = URL.createObjectURL(blob);
link.download = 'participants_100.csv';
link.click();
```

---

## 📊 CSV 格式說明

### 標準格式

```csv
姓名,員工編號,身分證字號,Email,電話
王小明,EMP001,,wang@example.com,0912345678
李小華,,A123456789,li@example.com,0923456789
```

### 欄位說明

| 欄位 | 必填 | 說明 |
|-----|------|------|
| 姓名 | ✅ 是 | 1-100 字元 |
| 員工編號 | ⚠️ 二選一 | 與身分證字號至少需填一個 |
| 身分證字號 | ⚠️ 二選一 | 與員工編號至少需填一個 |
| Email | ❌ 否 | 需符合 Email 格式 |
| 電話 | ❌ 否 | 允許數字、+、-、()、空白 |

### 編碼要求

- **建議編碼**: UTF-8 with BOM
- **原因**: 確保 Excel 正確顯示中文字元
- **其他支援編碼**: UTF-8（無 BOM）

---

## ✅ 測試案例

### participants_20.csv
- ✅ 10 筆使用員工編號
- ✅ 10 筆使用身分證字號
- ✅ 所有資料完整且有效
- ✅ 預期：全部成功匯入（20 筆）

### participants_with_errors.csv
- ✅ 第 1 筆：正常資料（預期成功）
- ❌ 第 2 筆：缺少姓名（預期失敗）
- ❌ 第 3 筆：無 ID（預期失敗）
- ⚠️ 第 4 筆：Email 格式錯誤（可能成功或失敗）
- ❌ 第 5 筆：重複員工編號（預期失敗）
- ✅ 第 6 筆：正常資料（預期成功）

**預期結果**: 2-3 筆成功，3-4 筆失敗

---

## 🔗 相關文件

- [測試資料文件](../../manual/test-data.md)
- [測試清單](../../manual/test-checklist.md)
- [測試資料產生器](../../helpers/test-data-generator.ts)

---

**最後更新**: 2025-10-25
