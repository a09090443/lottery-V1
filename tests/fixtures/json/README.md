# JSON 測試檔案

此目錄包含 JSON 格式的測試資料檔案。

---

## 📁 檔案說明

| 檔案名稱 | 說明 | 用途 |
|---------|------|------|
| **event-complete.json** | 完整活動資料（含獎項） | 測試活動匯入、資料結構驗證 |
| **participants-20.json** | 20 筆參與者資料 | 測試參與者批次匯入 |

---

## 📊 JSON 格式說明

### 1. event-complete.json - 完整活動資料

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-25T10:00:00.000Z",
  "event": {
    "id": "活動 ID (UUID)",
    "name": "活動名稱",
    "description": "活動描述",
    "scheduledAt": "預定日期時間 (ISO 8601)",
    "status": "draft | active | completed | archived",
    "allowDuplicateWinners": true/false,
    ...
  },
  "prizes": [
    {
      "id": "獎項 ID",
      "name": "獎項名稱",
      "totalQuantity": 數量,
      ...
    }
  ],
  "participants": [],
  "drawingResults": []
}
```

**用途**:
- 完整資料備份
- 測試活動匯入功能
- 驗證資料結構完整性

---

### 2. participants-20.json - 參與者資料

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-25T10:00:00.000Z",
  "participants": [
    {
      "id": "參與者 ID",
      "name": "姓名",
      "employeeId": "員工編號 (或 null)",
      "nationalId": "身分證字號 (或 null)",
      "email": "Email",
      "phone": "電話",
      "createdAt": "建立時間 (ISO 8601)",
      "updatedAt": "更新時間 (ISO 8601)"
    }
  ]
}
```

**用途**:
- 測試參與者批次匯入
- 驗證資料格式
- 測試唯一性約束（name + ID）

---

## 🔧 如何使用

### 方法 1：系統匯入功能（若已實作）

```
1. 進入管理後台
2. 選擇「匯入資料」
3. 選擇 JSON 檔案
4. 確認匯入
```

### 方法 2：手動複製貼上（測試用）

1. 開啟 JSON 檔案
2. 複製內容
3. 在開發者工具 Console 中執行：

```javascript
// 匯入參與者資料
const data = {匯入的 JSON 內容};
localStorage.setItem('lottery_participants', JSON.stringify(data.participants));

// 重新載入頁面
location.reload();
```

### 方法 3：使用測試腳本

```javascript
// tests/helpers/import-json-data.js
import participantsData from '../fixtures/json/participants-20.json';

function importParticipants() {
  // 匯入邏輯
}
```

---

## 📝 JSON 驗證規則

### 必要欄位

#### Event（活動）
- ✅ `id` - UUID 格式
- ✅ `name` - 1-100 字元
- ✅ `scheduledAt` - ISO 8601 日期時間
- ✅ `status` - draft | active | completed | archived
- ✅ `allowDuplicateWinners` - boolean

#### Prize（獎項）
- ✅ `id` - UUID 格式
- ✅ `eventId` - 關聯活動 ID
- ✅ `name` - 1-100 字元
- ✅ `totalQuantity` - 整數 ≥ 1

#### Participant（參與者）
- ✅ `id` - UUID 格式
- ✅ `name` - 1-100 字元
- ⚠️ `employeeId` OR `nationalId` - 至少需要一個
- ❌ `email` - 選填（需符合 email 格式）
- ❌ `phone` - 選填

---

## ⚙️ 建立自訂 JSON 測試檔案

### 範本

```json
{
  "version": "1.0.0",
  "exportedAt": "2025-10-25T10:00:00.000Z",
  "participants": [
    {
      "id": "p-001",
      "name": "測試者",
      "employeeId": "TEST001",
      "nationalId": null,
      "email": "test@example.com",
      "phone": "0912345678",
      "createdAt": "2025-10-25T10:00:00.000Z",
      "updatedAt": "2025-10-25T10:00:00.000Z"
    }
  ]
}
```

### 注意事項

1. **ID 格式**: 建議使用 UUID v4 或簡單前綴 + 流水號
2. **日期時間**: 使用 ISO 8601 格式 (`YYYY-MM-DDTHH:mm:ss.sssZ`)
3. **必填欄位**: 確保必填欄位不為 `null` 或空字串
4. **資料一致性**: employeeId 與 nationalId 至少需要一個

---

## 🔗 相關文件

- **CSV 測試檔案**: `tests/fixtures/csv/`
- **Excel 測試檔案**: `tests/fixtures/excel/`
- **測試資料文件**: `tests/manual/test-data.md`
- **資料模型**: `specs/001-browser-lottery-system/data-model.md`

---

**最後更新**: 2025-10-25
**維護者**: 測試團隊
