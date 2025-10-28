# 測試快速參考卡

**專案**: Lottery-V1
**版本**: 1.0.0

---

## 🚀 快速指令

### 環境準備

```bash
npm install                    # 安裝依賴
npx playwright install        # 安裝瀏覽器
npm run dev                   # 啟動開發伺服器
```

---

## 🧪 執行測試

### E2E 測試

```bash
npm run test:e2e              # 執行所有 E2E 測試
npm run test:e2e:ui           # UI 模式（可視化）
npm run test:e2e:debug        # 偵錯模式（逐步執行）
npm run test:e2e:report       # 查看測試報告
```

### 單元測試

```bash
npm test                      # 執行單元測試
npm run test:watch            # 監聽模式
npm run test:coverage         # 覆蓋率報告
```

### 特定測試

```bash
# 執行特定檔案
npm run test:e2e -- 01-admin-login.spec.ts

# 執行特定測試案例
npm run test:e2e -- --grep "登入"

# 只測試失敗的案例
npm run test:e2e -- --last-failed
```

---

## 📋 測試類型

| 測試類型 | 數量 | 時間 | 指令 |
|---------|------|------|------|
| E2E 自動化 | 30 個 | 5-10 分 | `npm run test:e2e` |
| 手動測試 | 200+ 項 | 2-3 小時 | 參考 test-checklist.md |
| 單元測試 | TBD | ~1 分 | `npm test` |

---

## 🗂️ 測試文件

| 文件 | 用途 |
|-----|------|
| **TESTING-GUIDE.md** | 完整測試指南 |
| **test-checklist.md** | 手動測試清單 (200+項) |
| **test-data.md** | 測試資料集合 |
| **file-upload-testing-guide.md** | 檔案上傳測試 |
| **TEST-FILES-READY.md** | 測試檔案狀態 |
| **INDEX.md** | 文件總索引 |

---

## 📁 測試資料檔案

### CSV 檔案 (`tests/fixtures/csv/`)

```
participants_20.csv          → 標準測試 (20筆)
participants_100.csv         → 中量測試 (100筆)
participants_500.csv         → 效能測試 (500筆)
participants_1000.csv        → 壓力測試 (1000筆)
participants_template.csv    → 範本檔案 (5筆)
participants_with_errors.csv → 錯誤測試 (6筆)
```

### JSON 檔案 (`tests/fixtures/json/`)

```
event-complete.json          → 完整活動資料
participants-20.json         → 20筆參與者
```

---

## 🔧 常用測試資料

### 管理員密碼

```
測試密碼 1: Test1234
測試密碼 2: Admin@2025
測試密碼 3: Secure2025!
```

### 活動資料

```
活動名稱: 部門尾牙抽獎
描述: 2025 年業務部門尾牙抽獎活動
日期: 2025-12-15 18:00 (或任何未來日期)
允許重複中獎: 否
```

### 獎項設定

```
特等獎 x1
頭獎 x2
貳獎 x5
參獎 x10
```

### 參與者資料（快速測試用）

```csv
姓名,員工編號,身分證字號,Email,電話
王小明,EMP001,,wang@example.com,0912345678
李小華,,A123456789,li@example.com,0923456789
張大同,EMP002,,zhang@example.com,0934567890
陳美玲,,B234567890,chen@example.com,0945678901
林志強,EMP003,,lin@example.com,0956789012
```

---

## 🧹 清除測試資料

### 瀏覽器 Console (F12)

```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Chrome DevTools

```
F12 → Application → Storage → Clear site data
```

---

## 🔍 偵錯技巧

### Playwright 偵錯

```bash
# 產生測試程式碼
npx playwright codegen http://localhost:3000

# 查看 Trace
npx playwright show-trace trace.zip

# 偵錯模式執行
npm run test:e2e:debug
```

### Chrome DevTools

```javascript
// 檢查 localStorage
console.log(localStorage);

// 檢查 sessionStorage
console.log(sessionStorage);

// 檢查特定 key
console.log(localStorage.getItem('lottery_admin_password'));
```

---

## 🎯 測試場景速查

### 場景 1: 快速驗證 (5分鐘)

```
✓ 設定密碼: Test1234
✓ 建立活動: 部門尾牙抽獎
✓ 手動新增 5 位參與者
✓ 新增 1 個獎項: 頭獎 x1
✓ 執行抽獎
✓ 查看結果
```

### 場景 2: 標準測試 (30分鐘)

```
✓ 設定密碼: Test1234
✓ 建立活動: 部門尾牙抽獎
✓ 匯入參與者: participants_20.csv
✓ 新增獎項: 特等獎x1, 頭獎x2, 貳獎x5
✓ 執行抽獎（所有獎項）
✓ 查看並匯出結果
✓ 驗證公開前台
```

### 場景 3: 效能測試 (1小時)

```
✓ 建立活動: 集團感恩回饋抽獎
✓ 匯入參與者: participants_500.csv (或 1000)
✓ 新增 10 個獎項
✓ 執行所有抽獎
✓ 測試動畫流暢度 (FPS ≥ 30)
✓ 測試匯出速度 (< 3 秒)
```

### 場景 4: 錯誤處理 (30分鐘)

```
✓ 測試密碼太短 (< 8 字元)
✓ 測試密碼不一致
✓ 測試錯誤 CSV: participants_with_errors.csv
✓ 測試重複 ID
✓ 測試無效 Email
✓ 測試空白必填欄位
```

---

## ✅ 發佈前檢查清單

### 自動化測試 (30分鐘)

```
□ npm run test:run          (單元測試)
□ npm run test:e2e          (E2E 測試)
□ npm run test:coverage     (覆蓋率 ≥ 80%)
□ npm run lint              (無 errors)
```

### 手動測試 (1小時)

```
□ TC-AUTH-001~005  (管理員登入)
□ TC-CREATE-003    (活動建立)
□ TC-PART-002      (參與者新增)
□ TC-IMPORT-003    (CSV 匯入)
□ TC-DRAW-004      (抽獎執行)
□ TC-RESULT-008    (結果匯出)
□ TC-PUB-003       (公開前台)
```

### 跨瀏覽器測試 (30分鐘)

```
□ Chrome (最新版)
□ Firefox (最新版)
□ Safari (最新版)
□ Edge (最新版)
□ Mobile Chrome
□ Mobile Safari
```

### 效能測試 (30分鐘)

```
□ 首屏渲染 < 2 秒
□ 抽獎動畫 < 5 秒 (500人)
□ 匯入 500 筆 < 10 秒
□ 匯出結果 < 3 秒
□ FPS ≥ 30
```

---

## 🐛 常見問題速查

### 測試一直失敗?

```bash
# 1. 檢查開發伺服器
curl http://localhost:3000

# 2. 清除瀏覽器資料
# 在 Console 執行:
localStorage.clear(); sessionStorage.clear(); location.reload();

# 3. 重新安裝 Playwright
npx playwright install

# 4. 查看詳細報告
npm run test:e2e:report
```

### 測試太慢?

```bash
# 只執行失敗的測試
npm run test:e2e -- --last-failed

# 並行執行（加快速度）
npm run test:e2e -- --workers=4

# 只測試特定檔案
npm run test:e2e -- 01-admin-login.spec.ts
```

### 如何偵錯特定測試?

```bash
# 使用偵錯模式
npm run test:e2e:debug -- 01-admin-login.spec.ts

# 或在測試中加入 page.pause()
await page.pause();  // 測試會暫停
```

---

## 📞 尋求協助

### 查閱文件

1. **不確定如何測試?**
   → [TESTING-GUIDE.md](./TESTING-GUIDE.md)

2. **需要測試資料?**
   → [test-data.md](./manual/test-data.md)

3. **檔案上傳問題?**
   → [file-upload-testing-guide.md](./manual/file-upload-testing-guide.md)

4. **查找特定測試項目?**
   → [test-checklist.md](./manual/test-checklist.md)

### 完整文件索引

→ [INDEX.md](./INDEX.md)

---

## 🔗 重要連結

- **Playwright 文件**: https://playwright.dev/
- **Vitest 文件**: https://vitest.dev/
- **Testing Library**: https://testing-library.com/

---

**提示**: 將此文件列印或保存為書籤,以便快速查詢!

**最後更新**: 2025-10-25
