# 測試資料集合

**專案名稱**: Lottery-V1 (Browser-Based Lottery System)
**建立日期**: 2025-10-25
**用途**: 提供完整的測試資料，供手動測試與自動化測試使用

---

## 目錄

1. [管理員帳號測試資料](#1-管理員帳號測試資料)
2. [活動測試資料](#2-活動測試資料)
3. [獎項測試資料](#3-獎項測試資料)
4. [參與者測試資料](#4-參與者測試資料)
5. [CSV 匯入測試檔案](#5-csv-匯入測試檔案)
6. [邊界測試資料](#6-邊界測試資料)
7. [錯誤測試資料](#7-錯誤測試資料)

---

## 1. 管理員帳號測試資料

### 1.1 有效密碼

```
測試密碼 1: Test1234
測試密碼 2: Admin@2025
測試密碼 3: Lottery123!
測試密碼 4: SecurePass99
```

### 1.2 無效密碼（用於驗證測試）

```
太短: 12345              (少於 6 字元)
太短: Test1               (少於 6 字元)
空白: "   "              (全空白)
空值: ""                  (空字串)
```

---

## 2. 活動測試資料

### 2.1 標準測試活動

#### 活動 A - 小型活動
```json
{
  "name": "部門尾牙抽獎",
  "description": "2025 年業務部門尾牙抽獎活動",
  "scheduledAt": "2025-12-15T18:00:00+08:00",
  "allowDuplicateWinners": false
}
```

**適用測試**: 基本功能測試、小規模效能測試
**參與者數量**: 20-50 人
**獎項數量**: 2-3 個

---

#### 活動 B - 中型活動
```json
{
  "name": "2025 年終大抽獎",
  "description": "全公司年終尾牙大抽獎，獎品豐富！",
  "scheduledAt": "2025-12-31T19:00:00+08:00",
  "allowDuplicateWinners": false
}
```

**適用測試**: 標準功能測試、中規模效能測試
**參與者數量**: 100-200 人
**獎項數量**: 5-6 個

---

#### 活動 C - 大型活動
```json
{
  "name": "集團感恩回饋抽獎",
  "description": "集團成立 20 周年感恩回饋活動，全體員工皆可參加",
  "scheduledAt": "2025-11-20T15:00:00+08:00",
  "allowDuplicateWinners": false
}
```

**適用測試**: 壓力測試、大規模效能測試
**參與者數量**: 500-1000 人
**獎項數量**: 10-15 個

---

#### 活動 D - 允許重複中獎
```json
{
  "name": "每日小確幸抽獎",
  "description": "每日抽獎活動，同一人可重複中獎",
  "scheduledAt": "2025-11-01T12:00:00+08:00",
  "allowDuplicateWinners": true
}
```

**適用測試**: 重複中獎規則測試
**參與者數量**: 30 人
**獎項數量**: 3 個（總獎品數 50）

---

### 2.2 邊界測試活動

#### 活動 E - 今天的日期（邊界測試）
```json
{
  "name": "今日即時抽獎",
  "description": "設定今天的日期作為預定時間",
  "scheduledAt": "[使用當天日期 + 當前時間]",
  "allowDuplicateWinners": false
}
```

---

#### 活動 F - 超長名稱（驗證測試）
```json
{
  "name": "這是一個非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常非常長的活動名稱用來測試系統是否能正確處理超長輸入",
  "description": "測試超長活動名稱",
  "scheduledAt": "2025-12-01T10:00:00+08:00",
  "allowDuplicateWinners": false
}
```

**預期**: 若限制 100 字元，應被截斷或顯示錯誤訊息

---

#### 活動 G - 特殊字元測試
```json
{
  "name": "測試<script>alert('XSS')</script>活動",
  "description": "包含 HTML 標籤的描述 <b>粗體</b> & \"引號\"",
  "scheduledAt": "2025-12-01T10:00:00+08:00",
  "allowDuplicateWinners": false
}
```

**預期**: 特殊字元應被轉義顯示，不執行腳本

---

## 3. 獎項測試資料

### 3.1 標準獎項組合

#### 組合 A - 傳統獎項（3 個獎項）
```json
[
  {
    "name": "特等獎",
    "description": "iPhone 15 Pro Max",
    "totalQuantity": 1,
    "displayOrder": 1
  },
  {
    "name": "頭獎",
    "description": "iPad Air",
    "totalQuantity": 2,
    "displayOrder": 2
  },
  {
    "name": "貳獎",
    "description": "AirPods Pro",
    "totalQuantity": 5,
    "displayOrder": 3
  }
]
```

**總中獎人數**: 8 人
**適用**: 小型活動

---

#### 組合 B - 完整獎項（6 個獎項）
```json
[
  {
    "name": "特等獎",
    "description": "電動機車",
    "totalQuantity": 1,
    "displayOrder": 1
  },
  {
    "name": "頭獎",
    "description": "iPhone 15 Pro",
    "totalQuantity": 3,
    "displayOrder": 2
  },
  {
    "name": "貳獎",
    "description": "iPad",
    "totalQuantity": 5,
    "displayOrder": 3
  },
  {
    "name": "參獎",
    "description": "Switch 遊戲機",
    "totalQuantity": 10,
    "displayOrder": 4
  },
  {
    "name": "肆獎",
    "description": "藍牙耳機",
    "totalQuantity": 20,
    "displayOrder": 5
  },
  {
    "name": "普獎",
    "description": "超商禮券 500 元",
    "totalQuantity": 50,
    "displayOrder": 6
  }
]
```

**總中獎人數**: 89 人
**適用**: 中大型活動

---

### 3.2 特殊獎項測試

#### 單一獎項（抽獎動畫測試）
```json
{
  "name": "唯一大獎",
  "description": "頭獎只有一個",
  "totalQuantity": 1,
  "displayOrder": 1
}
```

---

#### 大數量獎項（多次抽獎測試）
```json
{
  "name": "參加獎",
  "description": "人人有獎",
  "totalQuantity": 100,
  "displayOrder": 99
}
```

---

## 4. 參與者測試資料

### 4.1 手動輸入測試資料（10 筆）

```
1. 姓名: 王小明   員工編號: EMP20250001   Email: wang.xiaoming@company.com   電話: 0912345678
2. 姓名: 李小華   員工編號: EMP20250002   Email: li.xiaohua@company.com     電話: 0923456789
3. 姓名: 張大偉   員工編號: EMP20250003   Email: zhang.dawei@company.com    電話: 0934567890
4. 姓名: 陳美玲   員工編號: EMP20250004   Email: chen.meiling@company.com   電話: 0945678901
5. 姓名: 林志強   員工編號: EMP20250005   Email: lin.zhiqiang@company.com   電話: 0956789012
6. 姓名: 黃秀英   身分證: A123456789      Email: huang.xiuying@company.com  電話: 0967890123
7. 姓名: 吳建國   身分證: B234567890      Email: wu.jianguo@company.com     電話: 0978901234
8. 姓名: 劉雅婷   身分證: C345678901      Email: liu.yating@company.com     電話: 0989012345
9. 姓名: 蔡宗翰   身分證: D456789012      Email: cai.zonghan@company.com    電話: 0921234567
10. 姓名: 鄭淑芬  身分證: E567890123      Email: zheng.shufen@company.com   電話: 0932345678
```

---

### 4.2 重複測試資料（用於驗證唯一性）

#### 重複姓名 + 員工編號（應被拒絕）
```
姓名: 王小明
員工編號: EMP20250001
Email: duplicate@test.com
```

**預期**: 顯示錯誤「此參與者已存在（姓名 + ID 重複）」

---

#### 同姓名不同 ID（應被接受）
```
姓名: 王小明
員工編號: EMP20259999
Email: another.wang@test.com
```

**預期**: 成功新增（允許同名不同 ID）

---

### 4.3 邊界測試資料

#### 極短 ID
```
姓名: 測試者
員工編號: A1
```

**預期**: 成功新增，遮罩時全部顯示（因長度 ≤ 6）

---

#### 極長 ID
```
姓名: 測試者
員工編號: ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789
```

**預期**: 遮罩顯示為 `ABCDEF*******************************`

---

#### 無 Email 無電話
```
姓名: 簡化資料
員工編號: EMP20250100
Email: (空白)
電話: (空白)
```

**預期**: 成功新增（Email 與電話為選填）

---

#### 僅有員工編號（無身分證）
```
姓名: 僅員工編號
員工編號: EMP20250200
身分證: (空白)
```

**預期**: 成功新增

---

#### 僅有身分證（無員工編號）
```
姓名: 僅身分證
員工編號: (空白)
身分證: F678901234
```

**預期**: 成功新增

---

#### 兩者皆無（應被拒絕）
```
姓名: 無ID者
員工編號: (空白)
身分證: (空白)
```

**預期**: 顯示錯誤「請輸入員工編號或身分證字號」

---

### 4.4 特殊字元測試資料

#### 姓名包含英文
```
姓名: John Smith
員工編號: EMP20250300
```

**預期**: 成功新增

---

#### 姓名包含數字與符號
```
姓名: 李小明(業務部)
員工編號: EMP20250400
```

**預期**: 根據驗證規則，可能接受或拒絕

---

#### Email 格式錯誤
```
姓名: Email錯誤
員工編號: EMP20250500
Email: not-an-email
```

**預期**: 顯示錯誤「Email 格式不正確」

---

## 5. CSV 匯入測試檔案

### 5.1 標準 CSV 檔案（20 筆）

**檔案名稱**: `participants_20.csv`

```csv
姓名,員工編號,身分證字號,Email,電話
王建國,EMP20251001,,wang.jianguo@company.com,0912111001
李美玲,EMP20251002,,li.meiling@company.com,0912111002
張志強,EMP20251003,,zhang.zhiqiang@company.com,0912111003
陳淑芬,EMP20251004,,chen.shufen@company.com,0912111004
林雅婷,EMP20251005,,lin.yating@company.com,0912111005
黃宗翰,EMP20251006,,huang.zonghan@company.com,0912111006
吳佳玲,EMP20251007,,wu.jialing@company.com,0912111007
劉建宏,EMP20251008,,liu.jianhong@company.com,0912111008
蔡雅雯,EMP20251009,,cai.yawen@company.com,0912111009
鄭志豪,EMP20251010,,zheng.zhihao@company.com,0912111010
楊淑惠,,A123456001,yang.shuhui@company.com,0922111011
賴文傑,,B234567002,lai.wenjie@company.com,0922111012
許美華,,C345678003,xu.meihua@company.com,0922111013
曾志偉,,D456789004,zeng.zhiwei@company.com,0922111014
謝佳穎,,E567890005,xie.jiaying@company.com,0922111015
范建銘,,F678901006,fan.jianming@company.com,0922111016
游淑芳,,G789012007,you.shufang@company.com,0922111017
詹宗憲,,H890123008,zhan.zongxian@company.com,0922111018
高雅慧,,J901234009,gao.yahui@company.com,0922111019
周建華,,K012345010,zhou.jianhua@company.com,0922111020
```

**用途**: 標準批次匯入測試
**預期**: 全部 20 筆成功匯入

---

### 5.2 包含錯誤的 CSV（驗證測試）

**檔案名稱**: `participants_with_errors.csv`

```csv
姓名,員工編號,身分證字號,Email,電話
正常資料,EMP20252001,,normal@test.com,0912222001
缺少姓名,,EMP20252002,no-name@test.com,0912222002
無ID者,,,no-id@test.com,0912222003
Email錯誤,EMP20252004,,not-an-email,0912222004
重複ID,EMP20252001,,duplicate@test.com,0912222005
正常資料2,EMP20252006,,normal2@test.com,0912222006
```

**預期**:
- 第 1 筆: ✅ 成功
- 第 2 筆: ❌ 錯誤（缺少姓名）
- 第 3 筆: ❌ 錯誤（無 ID）
- 第 4 筆: ⚠️ 警告（Email 格式錯誤，但可能仍匯入）
- 第 5 筆: ❌ 錯誤（重複 ID）
- 第 6 筆: ✅ 成功

**成功**: 2-3 筆 | **失敗**: 3-4 筆

---

### 5.3 大量 CSV 檔案（效能測試）

#### 100 筆資料
**檔案名稱**: `participants_100.csv`
**用途**: 中等規模匯入測試
**預期匯入時間**: < 5 秒

#### 500 筆資料
**檔案名稱**: `participants_500.csv`
**用途**: 大規模匯入測試
**預期匯入時間**: < 10 秒

#### 1000 筆資料
**檔案名稱**: `participants_1000.csv`
**用途**: 壓力測試
**預期匯入時間**: < 20 秒

---

### 5.4 特殊格式 CSV

#### UTF-8 with BOM（Excel 相容）
**檔案名稱**: `participants_utf8_bom.csv`
**編碼**: UTF-8 with BOM
**預期**: 正確識別中文字元

#### Big5 編碼（傳統中文）
**檔案名稱**: `participants_big5.csv`
**編碼**: Big5
**預期**: 可能需要轉換，或顯示錯誤

---

## 6. 邊界測試資料

### 6.1 數量邊界

#### 參與者數量 = 獎項總數
- **參與者**: 10 人
- **獎項總數**: 10 個（全部中獎）
- **預期**: 所有人都中獎

---

#### 參與者數量 < 獎項總數
- **參與者**: 5 人
- **獎項總數**: 10 個
- **預期**: 顯示警告「參與者不足」，最多只能抽 5 個

---

#### 參與者數量 >> 獎項總數
- **參與者**: 1000 人
- **獎項總數**: 10 個
- **預期**: 正常抽獎，剩餘 990 人未中獎

---

### 6.2 時間邊界

#### 今天 00:00:00
```
scheduledAt: "2025-10-25T00:00:00+08:00"
```
**預期**: 若當前時間已過午夜，視為過去（錯誤）

#### 今天當前時間
```
scheduledAt: "[當前時間]"
```
**預期**: 可接受（今天但未來時間）

#### 一年後
```
scheduledAt: "2026-10-25T10:00:00+08:00"
```
**預期**: 可接受

---

## 7. 錯誤測試資料

### 7.1 無效活動資料

#### 缺少必填欄位
```json
{
  "name": "",
  "description": "測試空白名稱",
  "scheduledAt": "2025-12-01T10:00:00+08:00"
}
```
**預期**: 錯誤「活動名稱不可為空」

---

#### 過去日期
```json
{
  "name": "過去的活動",
  "scheduledAt": "2020-01-01T10:00:00+08:00"
}
```
**預期**: 錯誤「預定日期不可早於今天」

---

### 7.2 無效獎項資料

#### 數量為 0
```json
{
  "name": "零數量獎項",
  "totalQuantity": 0
}
```
**預期**: 錯誤「獎項數量至少為 1」

---

#### 負數數量
```json
{
  "name": "負數量獎項",
  "totalQuantity": -5
}
```
**預期**: 錯誤「獎項數量必須為正整數」

---

### 7.3 無效參與者資料

#### 空白姓名
```json
{
  "name": "   ",
  "employeeId": "EMP001"
}
```
**預期**: 錯誤「姓名不可為空白」

---

## 8. 快速測試資料集

### 8.1 最小可用資料集（快速驗證）

**活動**: 快速測試活動
**獎項**: 1 個（頭獎 x1）
**參與者**: 5 人

```
王小明 (EMP001)
李小華 (EMP002)
張大偉 (EMP003)
陳美玲 (EMP004)
林志強 (EMP005)
```

**用途**: 快速驗證基本抽獎功能
**測試時間**: < 2 分鐘

---

### 8.2 標準測試資料集（完整測試）

**活動**: 標準測試活動
**獎項**: 3 個（特等獎 x1, 頭獎 x2, 貳獎 x5）
**參與者**: 50 人

**用途**: 完整功能測試
**測試時間**: 5-10 分鐘

---

### 8.3 壓力測試資料集

**活動**: 壓力測試活動
**獎項**: 10 個（總計 100 個名額）
**參與者**: 1000 人

**用途**: 效能與穩定性測試
**測試時間**: 30-60 分鐘

---

## 9. 測試資料產生器

系統已內建測試資料產生器，位於 `tests/helpers/test-data-generator.ts`

### 使用方式

```typescript
import {
  generateTestEvent,
  generateTestPrizes,
  generateTestParticipants,
  generateTestParticipantsCSVBlob,
  generateCompleteTestScenario
} from '@/tests/helpers/test-data-generator';

// 生成小型測試場景
const smallScenario = generateSmallTestScenario();
// 包含: 20 參與者, 2 獎項

// 生成中型測試場景
const mediumScenario = generateMediumTestScenario();
// 包含: 100 參與者, 3 獎項

// 生成大型測試場景
const largeScenario = generateLargeTestScenario();
// 包含: 500 參與者, 5 獎項
```

---

## 10. 測試資料檔案位置

所有測試資料檔案應儲存於：

```
tests/
  └── fixtures/
      ├── csv/
      │   ├── participants_20.csv
      │   ├── participants_100.csv
      │   ├── participants_500.csv
      │   ├── participants_with_errors.csv
      │   └── participants_utf8_bom.csv
      ├── json/
      │   ├── event_standard.json
      │   ├── prizes_complete.json
      │   └── participants.json
      └── images/
          └── test_screenshots/
```

---

**文件版本**: 1.0.0
**最後更新**: 2025-10-25
**維護者**: 測試團隊
