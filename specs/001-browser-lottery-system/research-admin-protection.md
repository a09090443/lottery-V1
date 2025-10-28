# 純前端 Next.js 專案管理端存取保護方案研究

**研究日期**: 2025-10-24
**專案**: Lottery-V1 單機版抽獎系統
**研究目標**: 比較純前端 Next.js 專案（完全靜態匯出）中實現管理端存取保護的可行方案

---

## 執行摘要

本研究針對 Lottery-V1 專案的管理端存取保護需求，比較了五種技術方案的可行性、安全性與複雜度。考量專案採用 **完全靜態匯出 (next export)** 無後端架構、憲章要求的**高安全性標準**與**簡潔設計原則**，以及實際使用場景（活動現場、管理員個人裝置），本研究提供以下建議:

**推薦方案**: **方案 1 - URL 路徑區隔 + 簡易密碼保護 (sessionStorage)**
**替代方案**: **方案 3 - Edge Functions 基本認證** (若部署至 Vercel/Netlify)

本研究明確說明純前端架構的**安全性限制**，並提供完整的實作指引、程式碼範例與使用者文件建議。

---

## 背景需求分析

### 專案特性
- **技術架構**: Next.js 14+ (App Router)，完全靜態匯出 (`next export`)，無後端伺服器
- **資料儲存**: 瀏覽器 localStorage/IndexedDB + SQLite WASM
- **使用場景**: 活動現場、離線環境、管理員個人電腦
- **使用者角色**:
  - **公開前台**: 所有使用者可存取，唯讀顯示活動列表與中獎名單
  - **管理端**: 僅管理員可存取，可建立活動、執行抽獎、匯出結果

### 憲章要求
- **VIII. 高安全性標準**: 防範 OWASP Top 10 風險、實現適當的身份驗證與授權機制、敏感資料加密
- **III. 簡潔設計 (非協商)**: YAGNI 原則、避免過度設計、優先選擇簡單直接的實現方案

### 核心挑戰
1. **完全靜態匯出限制**: 無法使用 Next.js Middleware（僅在伺服器端執行）
2. **localStorage 明文儲存**: 瀏覽器環境無法實現真正的加密儲存
3. **前端程式碼可讀**: 所有 JavaScript 程式碼與靜態檔案均可透過開發者工具檢視
4. **安全性與簡潔性權衡**: 需要在憲章要求的高安全性與簡潔設計之間取得平衡

---

## 方案比較總覽

| 方案 | 靜態匯出相容 | 需要後端 | 安全強度 | 實作複雜度 | 使用體驗 | YAGNI 符合度 | 憲章符合度 |
|------|------------|---------|---------|-----------|---------|------------|-----------|
| **方案 1**: URL 路徑 + sessionStorage 密碼 | ✅ 完全相容 | ❌ 不需要 | ⚠️ 低-中 (可繞過) | ⭐ 簡單 | ⭐⭐⭐ 良好 | ✅ 高 | ⚠️ 部分符合 |
| **方案 2**: URL 路徑區隔 (無技術保護) | ✅ 完全相容 | ❌ 不需要 | ❌ 無 (純模糊) | ⭐ 極簡單 | ⭐⭐⭐ 無感 | ✅ 最高 | ❌ 不符合 |
| **方案 3**: Edge Functions 基本認證 | ⚠️ 部分相容* | ⚠️ Edge 運算 | ✅ 高 (真正認證) | ⭐⭐⭐ 中等 | ⭐⭐ 標準 | ⚠️ 中 | ✅ 符合 |
| **方案 4**: Next.js Middleware | ❌ 不相容 | ✅ 需要伺服器 | ✅ 高 | ⭐⭐⭐⭐ 複雜 | ⭐⭐ 標準 | ❌ 低 (過度設計) | ⚠️ 違反簡潔原則 |
| **方案 5**: Web Crypto API 加密 token | ✅ 完全相容 | ❌ 不需要 | ⚠️ 低 (金鑰管理難) | ⭐⭐⭐⭐ 複雜 | ⭐ 複雜 | ❌ 低 | ❌ 違反簡潔原則 |

**\* 註解**: 方案 3 需要部署至 Vercel/Netlify/Cloudflare 等支援 Edge Functions 的平台，但與「完全靜態匯出」的精神部分衝突（需要邊緣運算）。

---

## 詳細方案分析

### 方案 1: URL 路徑區隔 + 簡易密碼保護 (sessionStorage)

#### 📋 方案說明
- 管理端位於 `/admin` 路徑
- 使用者首次進入 `/admin` 路徑時顯示登入畫面
- 輸入密碼後驗證成功，在 `sessionStorage` 設定 token
- 後續存取 `/admin/*` 頁面時檢查 `sessionStorage` token
- 密碼設定方式:
  - **選項 A**: 環境變數（建置時寫入，適合單一管理員）
  - **選項 B**: 首次啟動時由管理員設定（儲存於 localStorage，適合需變更密碼）

#### ✅ 優點
1. **完全靜態匯出相容**: 不需要任何伺服器端功能
2. **實作簡單**: 僅需 1 個登入元件 + 1 個路由守衛 Hook
3. **使用體驗良好**: 管理員僅需登入一次（瀏覽器分頁關閉前有效）
4. **符合 YAGNI 原則**: 不引入過度複雜的認證系統
5. **防範基本未授權存取**: 阻擋非技術使用者直接存取管理頁面

#### ❌ 缺點與限制
1. **低安全性 (可繞過)**:
   - 技術使用者可透過開發者工具直接修改 `sessionStorage`
   - 密碼儲存於前端程式碼（環境變數會內嵌至 JavaScript）
   - 無法防止逆向工程（bundled JavaScript 可反混淆）
2. **不符合「高安全性標準」**: 無法防範 OWASP 中的身份驗證弱點
3. **密碼管理挑戰**:
   - 選項 A (環境變數): 密碼變更需重新建置
   - 選項 B (localStorage): 密碼明文儲存於 localStorage

#### 📊 可行性評估
- **與靜態匯出相容性**: ✅ 100% 相容
- **部署複雜度**: ⭐ 極低（無額外設定）
- **適用場景**: ✅ 非常適合「活動現場專用裝置」、「管理員個人電腦」等**安全使用環境**

#### 🔒 安全性評估
- **防護強度**: ⚠️ 低-中（防範非技術使用者，無法防範技術攻擊）
- **可繞過性**: ❌ 高（開發者工具可輕易繞過）
- **密碼安全性**: ❌ 低（明文或內嵌於程式碼）
- **適用威脅模型**: ✅ **僅適用於低風險場景**（無敏感個資、信賴使用環境）

#### 📐 簡潔性評估
- **實作複雜度**: ⭐ 簡單（約 100-150 行程式碼）
- **維護負擔**: ⭐ 低
- **YAGNI 符合度**: ✅ 高（不引入不必要的複雜度）

#### 👤 使用體驗
- **管理員操作流程**:
  1. 開啟 `/admin` → 2. 輸入密碼 → 3. 開始管理作業
  2. 分頁關閉後需重新登入（sessionStorage 清除）
- **密碼記憶**: 需要（除非使用瀏覽器密碼管理器）
- **多裝置支援**: ❌ 每個裝置/瀏覽器需個別登入

#### ⚖️ 合規性評估
- **功能需求符合**: ✅ 符合 FR-014（區分管理端與公開前台）
- **憲章 VIII (高安全性)**: ⚠️ **部分符合**（需明確說明限制與例外理由）
- **憲章 III (簡潔設計)**: ✅ 符合

#### 💡 實作建議摘要
- 使用 **React Context** 管理認證狀態
- 使用 **React Hook (`useRequireAuth`)** 保護路由
- 密碼驗證使用 **bcrypt.js** 或 **SHA-256 雜湊** (前端)
- 提供**清楚的使用者文件**說明安全使用環境要求

---

### 方案 2: URL 路徑區隔 (無技術保護)

#### 📋 方案說明
- 管理端位於 `/admin` 路徑
- 公開前台**不顯示任何管理端連結**
- 僅透過**文件說明**管理端 URL (`/admin`)
- 完全依賴「**安全使用環境**」（管理員個人電腦、活動現場專用裝置）
- **無任何技術層級保護**（無密碼、無驗證）

#### ✅ 優點
1. **極致簡潔**: 無需任何認證程式碼，零額外開發成本
2. **使用體驗無感**: 管理員直接存取 `/admin`，無登入步驟
3. **完全靜態匯出相容**: 100% 前端，無任何動態功能
4. **YAGNI 極致實踐**: 不實現當前可能不需要的功能
5. **無密碼管理負擔**: 無需記住或管理密碼

#### ❌ 缺點與限制
1. **無任何安全保護**: 任何知道 `/admin` URL 的人均可存取
2. **完全依賴模糊性 (Security by Obscurity)**: 業界公認不安全的做法
3. **不符合憲章 VIII**: 無法滿足「適當的身份驗證與授權機制」要求
4. **易被發現**:
   - 自動化工具掃描 (`/admin`, `/administrator`, `/管理` 等常見路徑)
   - Next.js 路由檔案結構暴露於原始碼管理 (GitHub)
   - Google 搜尋引擎索引 (除非設定 `robots.txt`)
5. **無審計追蹤**: 無法記錄誰存取了管理功能

#### 📊 可行性評估
- **與靜態匯出相容性**: ✅ 100% 相容
- **部署複雜度**: ⭐ 零（無額外設定）
- **適用場景**: ⚠️ **極度受限**（僅適用於完全信賴的封閉環境，如管理員個人離線裝置）

#### 🔒 安全性評估
- **防護強度**: ❌ 無（零防護）
- **可繞過性**: ❌ 極高（無需繞過，直接存取）
- **適用威脅模型**: ❌ **不適用於任何有公開存取的場景**

#### 📐 簡潔性評估
- **實作複雜度**: ⭐ 零（無需實作）
- **YAGNI 符合度**: ✅ 最高

#### ⚖️ 合規性評估
- **功能需求符合**: ⚠️ 技術上符合（有區分前台/管理端），但**精神上不符合**（無存取控制）
- **憲章 VIII (高安全性)**: ❌ **明確不符合**
- **憲章 III (簡潔設計)**: ✅ 符合

#### 📢 業界共識
根據資安專家共識（來源: Stack Overflow, InfoSec StackExchange）:
> "Security through obscurity is barely security at all. Don't count on it."
> "Obscurity should only complement—not replace—stronger, more transparent security measures."

#### ⚠️ 風險警告
此方案**僅適用於極度受限的場景**:
- ✅ 管理員個人電腦（離線使用，無其他人存取）
- ✅ 活動現場專用平板（受物理保護，活動後清除資料）
- ❌ **不適用於任何有網路存取的場景**（即使是內網）
- ❌ **不適用於多人使用的裝置**

---

### 方案 3: Edge Functions 基本認證 (Vercel/Netlify/Cloudflare)

#### 📋 方案說明
- 使用 **HTTP Basic Authentication** (瀏覽器原生認證對話框)
- 依賴靜態託管平台的 **Edge Functions** 功能:
  - **Vercel**: Edge Middleware
  - **Netlify**: Edge Functions
  - **Cloudflare Pages**: Functions
- 認證邏輯在**邊緣節點**執行（非瀏覽器端）
- 靜態檔案本身無變動，保護層在 CDN 邊緣

#### ✅ 優點
1. **真正的伺服器端認證**: 認證邏輯在邊緣節點執行，無法透過瀏覽器繞過
2. **標準 HTTP 機制**: 使用瀏覽器內建的 Basic Auth 對話框
3. **安全性高**: 密碼儲存於環境變數（伺服器端），不暴露於前端程式碼
4. **符合憲章 VIII**: 提供適當的身份驗證機制
5. **無額外 UI 開發**: 使用瀏覽器原生認證介面

#### ❌ 缺點與限制
1. **平台依賴性**: 僅適用於 Vercel/Netlify/Cloudflare 等特定平台
2. **違反「完全靜態」精神**: 需要邊緣運算（雖然前端本身仍是靜態檔案）
3. **部署複雜度提升**: 需要設定 Edge Functions 與環境變數
4. **使用體驗較差**:
   - HTTP Basic Auth 對話框不美觀
   - 無自訂 UI（登出按鈕、密碼變更）
   - 密碼變更需透過平台控制台
5. **成本考量**: Edge Functions 可能有執行次數或流量限制
6. **本地開發限制**: 需要使用平台 CLI 工具模擬 Edge Functions

#### 📊 可行性評估
- **與靜態匯出相容性**: ⚠️ **技術相容，精神部分衝突**（前端靜態，但需邊緣運算）
- **部署複雜度**: ⭐⭐⭐ 中等（需設定 Edge Functions + 環境變數）
- **平台限制**: ⚠️ 僅適用於支援 Edge Functions 的託管平台

#### 🔒 安全性評估
- **防護強度**: ✅ **高**（真正的伺服器端認證）
- **可繞過性**: ✅ **極低**（需知道密碼，無法透過前端繞過）
- **密碼安全性**: ✅ **高**（儲存於平台環境變數，不暴露於前端）
- **適用威脅模型**: ✅ 適用於**中等風險場景**（有公開網路存取）

#### 📐 簡潔性評估
- **實作複雜度**: ⭐⭐⭐ 中等（需撰寫 Edge Function + 設定檔）
- **維護負擔**: ⭐⭐ 中（密碼變更需透過平台）
- **YAGNI 符合度**: ⚠️ 中（若僅在封閉環境使用，則屬過度設計）

#### 👤 使用體驗
- **管理員操作流程**:
  1. 存取 `/admin` → 2. 瀏覽器顯示 Basic Auth 對話框 → 3. 輸入帳密 → 4. 開始作業
- **密碼記憶**: 需要（瀏覽器可儲存）
- **登出功能**: ❌ 無標準方式（需關閉所有瀏覽器視窗）
- **UI 客製化**: ❌ 受限（瀏覽器原生對話框）

#### ⚖️ 合規性評估
- **功能需求符合**: ✅ 完全符合 FR-014
- **憲章 VIII (高安全性)**: ✅ **符合**
- **憲章 III (簡潔設計)**: ⚠️ 若部署場景有公開網路存取，則為合理複雜度；若僅封閉環境，則過度設計

#### 💡 適用場景
- ✅ **最適合**: 部署至公開網路（如公司內網、展場現場有 Wi-Fi）
- ✅ **最適合**: 使用 Vercel/Netlify 等平台託管
- ❌ **不適合**: 需要完全離線運作（Edge Functions 需網路）
- ❌ **不適合**: 需自行託管或部署至不支援 Edge Functions 的平台

---

### 方案 4: Next.js Middleware (伺服器端)

#### 📋 方案說明
- 使用 **Next.js Middleware** (`middleware.ts`) 進行路由保護
- Middleware 在**伺服器端**執行，攔截 `/admin/*` 請求
- 需要部署至支援 **Node.js 伺服器**或 **Edge Runtime** 的平台

#### ❌ 致命缺陷
- **與完全靜態匯出不相容**: Next.js 官方文件明確說明:
  > "Middleware is not executed for static exports."
- 靜態匯出 (`next export`) 產生純 HTML/CSS/JS 檔案，**無伺服器端執行環境**
- 需要使用 `next start` (Node.js 伺服器) 或部署至 Vercel (Edge Runtime)

#### 📊 可行性評估
- **與靜態匯出相容性**: ❌ **完全不相容**（違反專案核心需求）
- **部署複雜度**: ⭐⭐⭐⭐ 高（需要伺服器環境）

#### ⚖️ 合規性評估
- **功能需求符合**: ❌ 違反「完全靜態匯出」、「離線運作」需求
- **憲章 III (簡潔設計)**: ❌ 違反（引入不必要的伺服器依賴）

#### 📢 結論
**此方案不適用於本專案**，僅列出供對比參考。

---

### 方案 5: Web Crypto API 加密 Token (自訂實作)

#### 📋 方案說明
- 使用 **Web Crypto API** (`crypto.subtle`) 進行前端加密
- 密碼驗證流程:
  1. 管理員輸入密碼
  2. 使用密碼作為金鑰，加密固定的驗證訊息
  3. 將加密結果儲存於 `sessionStorage`
  4. 後續存取時解密驗證
- 理論上增加逆向工程難度（但仍可繞過）

#### ✅ 優點
1. **完全靜態匯出相容**: 純前端實作
2. **增加破解難度**: 相較於明文密碼，加密 token 增加一層混淆

#### ❌ 缺點與限制
1. **金鑰管理困境**:
   - 加密金鑰必須儲存於前端程式碼（否則無法解密）
   - 攻擊者可反編譯 JavaScript 取得金鑰
2. **安全性錯覺**: 看似安全，實則仍可繞過（開發者工具直接修改 sessionStorage）
3. **實作複雜度高**: 需處理加密/解密、金鑰衍生 (PBKDF2)、隨機鹽值 (salt)
4. **違反 YAGNI**: 引入複雜度但未真正提升安全性
5. **維護負擔**: 加密邏輯增加除錯難度

#### 🔒 安全性評估
- **防護強度**: ⚠️ **低**（僅提供混淆，無真正防護）
- **可繞過性**: ❌ **高**（繞過方式與方案 1 相同）
- **安全性提升**: ⚠️ **邊際效益低**（大量開發成本換取微小安全提升）

#### 📐 簡潔性評估
- **實作複雜度**: ⭐⭐⭐⭐ **高**（200+ 行加密邏輯）
- **YAGNI 符合度**: ❌ **低**（過度設計）

#### ⚖️ 合規性評估
- **憲章 VIII (高安全性)**: ⚠️ 未真正提升安全性
- **憲章 III (簡潔設計)**: ❌ **違反**（引入不必要的複雜度）

#### 📢 結論
**不推薦**。此方案屬於「為加密而加密」，未考量前端環境的根本限制，違反簡潔設計原則。

---

## 推薦方案

### 🏆 首選方案: **方案 1 - URL 路徑區隔 + 簡易密碼保護 (sessionStorage)**

#### 選擇理由

1. **符合專案核心需求**
   - ✅ 完全靜態匯出相容（無需伺服器或 Edge Functions）
   - ✅ 支援完全離線運作（符合規格需求）
   - ✅ 適合「活動現場專用裝置」、「管理員個人電腦」使用場景

2. **符合憲章簡潔設計原則**
   - ✅ 實作簡單直接（約 100-150 行程式碼）
   - ✅ 遵循 YAGNI 原則（不引入不必要的複雜度）
   - ✅ 易於測試與維護

3. **提供適當的防護層級**
   - ✅ 防範非技術使用者直接存取管理功能
   - ✅ 符合「低風險應用場景」（無敏感金融資料、信賴使用環境）
   - ✅ 透過文件明確說明安全使用環境要求

4. **良好的使用體驗**
   - ✅ 管理員僅需登入一次（分頁關閉前有效）
   - ✅ 可自訂登入 UI（符合品牌形象）
   - ✅ 密碼可透過環境變數或首次設定管理

5. **透明的風險溝通**
   - ✅ 明確說明純前端架構的安全性限制
   - ✅ 提供清楚的使用者文件與安全建議
   - ✅ 符合憲章要求的「高安全性標準」（在技術限制內）

#### 風險與緩解措施

| 風險 | 嚴重性 | 緩解措施 |
|------|--------|---------|
| 技術使用者可繞過密碼保護 | 中 | 文件明確說明「信賴使用環境」要求；建議僅在管理員個人裝置或受物理保護的裝置使用 |
| 密碼暴露於前端程式碼 | 中 | 使用環境變數（建置時內嵌）或首次設定（localStorage）；使用雜湊驗證而非明文比對 |
| localStorage 資料可被讀取 | 低 | 員工編號/身分證號在 UI 部分遮罩；文件說明資料儲存於本地的隱私風險 |
| 無審計追蹤 | 低 | 若需要，可在 localStorage 記錄操作日誌（純前端實作） |

#### 何時不適用此方案

- ❌ 需要真正的多使用者身份驗證（有多位管理員需區分權限）
- ❌ 部署至公開網路且無法信賴使用環境
- ❌ 處理高敏感資料（金融交易、醫療資訊）
- ❌ 需要符合嚴格的合規要求（ISO 27001、PCI DSS）

若專案有以上需求，應考慮**替代方案**或**重新評估「完全靜態匯出」的架構選擇**。

---

### 🥈 替代方案: **方案 3 - Edge Functions 基本認證**

#### 適用情境
若專案符合以下條件，應優先考慮方案 3:
1. **部署至 Vercel/Netlify/Cloudflare** 等支援 Edge Functions 的平台
2. **有公開網路存取需求**（如公司內網、展場現場有 Wi-Fi）
3. **可接受需要網路連線**（Edge Functions 需與 CDN 通訊）
4. **願意放棄「完全靜態」定義**（接受邊緣運算層）

#### 選擇理由
1. **真正的伺服器端認證**: 安全性顯著高於純前端方案
2. **符合憲章高安全性標準**: 無需例外處理
3. **標準 HTTP 機制**: 使用業界標準的 Basic Authentication
4. **平台整合良好**: Vercel/Netlify 提供完整的開發工具與文件

#### 實作成本
- 中等複雜度（需撰寫 Edge Function 約 30-50 行）
- 需學習平台特定的 Edge Functions API
- 本地開發需使用平台 CLI 工具

---

## 不推薦方案總結

### ❌ 方案 2 (無技術保護)
- **為何不推薦**: 違反憲章「高安全性標準」，完全依賴模糊性（業界不認可）
- **唯一例外**: 若專案使用場景為「管理員個人離線裝置且永不連網」，可考慮此方案並明確文件化例外理由

### ❌ 方案 4 (Next.js Middleware)
- **為何不推薦**: 與「完全靜態匯出」核心需求不相容

### ❌ 方案 5 (Web Crypto API)
- **為何不推薦**: 違反簡潔設計原則，高實作成本但未真正提升安全性

---

## 實作指引 - 方案 1 詳細步驟

### 步驟 1: 專案結構規劃

```text
src/
├── app/
│   ├── (public)/              # 公開前台路由群組
│   │   ├── page.tsx           # 首頁（活動列表）
│   │   └── events/[id]/page.tsx
│   ├── admin/                 # 管理端路由群組
│   │   ├── login/             # 登入頁面
│   │   │   └── page.tsx
│   │   ├── page.tsx           # 管理儀表板（受保護）
│   │   ├── events/            # 活動管理（受保護）
│   │   └── layout.tsx         # 管理端 Layout（路由守衛）
│   └── layout.tsx
├── components/
│   └── auth/
│       └── LoginForm.tsx      # 登入表單元件
├── lib/
│   └── auth/
│       ├── context.tsx        # 認證 Context
│       ├── useAuth.ts         # 認證 Hook
│       └── password.ts        # 密碼驗證邏輯
└── types/
    └── auth.ts                # 認證相關型別定義
```

### 步驟 2: 核心程式碼實作

#### 2.1 認證 Context (`src/lib/auth/context.tsx`)

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * 認證狀態介面
 */
interface AuthContextType {
  /** 是否已認證 */
  isAuthenticated: boolean;
  /** 登入函式 */
  login: (password: string) => Promise<boolean>;
  /** 登出函式 */
  logout: () => void;
  /** 是否正在驗證中 */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * 認證 Provider 元件
 * 管理全域認證狀態，使用 sessionStorage 儲存 token
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化時檢查 sessionStorage 中的認證狀態
  useEffect(() => {
    const token = sessionStorage.getItem('admin_token');
    if (token === 'authenticated') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  /**
   * 登入函式
   * @param password - 使用者輸入的密碼
   * @returns 是否登入成功
   */
  const login = async (password: string): Promise<boolean> => {
    // 選項 A: 使用環境變數（建置時內嵌）
    const correctPasswordHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH;

    // 計算輸入密碼的雜湊值（使用 SHA-256）
    const passwordHash = await hashPassword(password);

    if (passwordHash === correctPasswordHash) {
      sessionStorage.setItem('admin_token', 'authenticated');
      setIsAuthenticated(true);
      return true;
    }

    return false;
  };

  /**
   * 登出函式
   */
  const logout = () => {
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * 使用認證 Context 的 Hook
 */
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}

/**
 * 計算密碼的 SHA-256 雜湊值
 * @param password - 明文密碼
 * @returns 雜湊值（hex 字串）
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
```

#### 2.2 路由守衛 Hook (`src/lib/auth/useAuth.ts`)

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from './context';

/**
 * 路由守衛 Hook
 * 在受保護的頁面使用，未認證時自動導向登入頁
 *
 * @example
 * ```tsx
 * export default function AdminDashboard() {
 *   useRequireAuth();
 *   return <div>管理儀表板</div>;
 * }
 * ```
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    // 等待初始化完成
    if (isLoading) return;

    // 未認證則導向登入頁
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
```

#### 2.3 登入表單元件 (`src/components/auth/LoginForm.tsx`)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/auth/context';

/**
 * 管理端登入表單元件
 */
export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login(password);

      if (success) {
        // 登入成功，導向管理儀表板
        router.push('/admin');
      } else {
        setError('密碼錯誤，請重試');
        setPassword('');
      }
    } catch (err) {
      setError('登入過程發生錯誤');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            管理端登入
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            請輸入管理員密碼以繼續
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="sr-only">
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="管理員密碼"
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center" role="alert">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '驗證中...' : '登入'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-xs text-yellow-800">
            <strong>安全提醒：</strong>請確保您在安全的環境下使用此系統（如個人電腦或受物理保護的裝置）。
          </p>
        </div>
      </div>
    </div>
  );
}
```

#### 2.4 登入頁面 (`src/app/admin/login/page.tsx`)

```typescript
import { LoginForm } from '@/components/auth/LoginForm';

/**
 * 管理端登入頁面
 */
export default function AdminLoginPage() {
  return <LoginForm />;
}

export const metadata = {
  title: '管理端登入 - 抽獎系統',
  robots: 'noindex, nofollow', // 防止搜尋引擎索引
};
```

#### 2.5 管理端 Layout (`src/app/admin/layout.tsx`)

```typescript
'use client';

import { usePathname } from 'next/navigation';
import { useRequireAuth } from '@/lib/auth/useAuth';

/**
 * 管理端 Layout
 * 除了登入頁外，所有管理端頁面均需認證
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  // 登入頁不需認證
  if (!isLoginPage) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { isLoading } = useRequireAuth();

    // 驗證中顯示載入畫面
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-600">載入中...</div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
```

#### 2.6 根 Layout (`src/app/layout.tsx`)

```typescript
import { AuthProvider } from '@/lib/auth/context';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-TW">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 步驟 3: 環境變數設定

#### 3.1 生成密碼雜湊值

建立工具腳本 `scripts/generate-password-hash.js`:

```javascript
/**
 * 密碼雜湊值產生工具
 * 使用方式: node scripts/generate-password-hash.js <your-password>
 */
const crypto = require('crypto');

const password = process.argv[2];

if (!password) {
  console.error('❌ 請提供密碼作為參數');
  console.log('使用方式: node scripts/generate-password-hash.js <your-password>');
  process.exit(1);
}

const hash = crypto.createHash('sha256').update(password).digest('hex');

console.log('✅ 密碼雜湊值已生成:');
console.log('');
console.log(hash);
console.log('');
console.log('📝 請將以下內容加入 .env.local 檔案:');
console.log(`NEXT_PUBLIC_ADMIN_PASSWORD_HASH=${hash}`);
```

執行範例:
```bash
node scripts/generate-password-hash.js MySecurePassword123
```

#### 3.2 設定環境變數 (`.env.local`)

```bash
# 管理員密碼雜湊值（SHA-256）
# 請使用 scripts/generate-password-hash.js 產生
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=your_generated_hash_here
```

**⚠️ 重要安全注意事項**:
- `.env.local` 必須加入 `.gitignore`（避免提交至版本控制）
- `NEXT_PUBLIC_` 前綴的變數會在**建置時內嵌至前端程式碼**
- 雜湊值雖比明文安全，但仍可透過逆向工程取得
- 此方案**不適用於高安全性需求場景**

### 步驟 4: 測試與驗證

#### 4.1 單元測試 (`tests/unit/lib/auth/context.test.tsx`)

```typescript
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '@/lib/auth/context';

describe('AuthContext', () => {
  beforeEach(() => {
    // 清除 sessionStorage
    sessionStorage.clear();
  });

  it('初始狀態應為未認證', () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: AuthProvider,
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('正確密碼應登入成功', async () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.login('correct_password');
      expect(success).toBe(true);
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(sessionStorage.getItem('admin_token')).toBe('authenticated');
  });

  it('錯誤密碼應登入失敗', async () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      const success = await result.current.login('wrong_password');
      expect(success).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
  });

  it('登出應清除認證狀態', async () => {
    const { result } = renderHook(() => useAuthContext(), {
      wrapper: AuthProvider,
    });

    // 先登入
    await act(async () => {
      await result.current.login('correct_password');
    });

    // 登出
    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(sessionStorage.getItem('admin_token')).toBeNull();
  });
});
```

#### 4.2 整合測試（使用 Chrome DevTools 手動測試）

根據憲章要求，使用 Chrome DevTools 進行測試:

**測試案例 1: 基本登入流程**
1. 開啟瀏覽器，進入 `http://localhost:3000/admin`
2. **預期**: 自動導向 `/admin/login`
3. 輸入正確密碼，點擊「登入」
4. **預期**: 導向 `/admin` 管理儀表板
5. **驗證 (Application Tab)**: sessionStorage 中存在 `admin_token = "authenticated"`

**測試案例 2: 密碼錯誤處理**
1. 進入 `/admin/login`
2. 輸入錯誤密碼，點擊「登入」
3. **預期**: 顯示錯誤訊息「密碼錯誤，請重試」
4. **預期**: 仍停留在登入頁

**測試案例 3: 登出功能**
1. 已登入狀態下，點擊「登出」按鈕（需在管理頁面實作）
2. **預期**: 導向登入頁
3. **驗證 (Application Tab)**: sessionStorage 中 `admin_token` 已移除

**測試案例 4: 分頁關閉後重新驗證**
1. 登入後，關閉瀏覽器分頁
2. 重新開啟 `http://localhost:3000/admin`
3. **預期**: 需重新登入（sessionStorage 已清除）

**測試案例 5: 防止搜尋引擎索引**
1. 檢視頁面原始碼 (`Ctrl+U`)
2. **驗證**: `<meta name="robots" content="noindex, nofollow">` 存在於 `/admin/login`

### 步驟 5: 安全性強化（選用）

#### 5.1 登入嘗試次數限制

```typescript
// src/lib/auth/rateLimit.ts

/**
 * 簡易的登入速率限制（前端實作）
 * 注意: 此實作僅防範非技術使用者暴力破解，技術使用者可繞過
 */
export class LoginRateLimiter {
  private attempts: number = 0;
  private lockoutUntil: number | null = null;
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 5 * 60 * 1000; // 5 分鐘

  /**
   * 檢查是否被鎖定
   */
  isLockedOut(): boolean {
    if (this.lockoutUntil === null) return false;

    if (Date.now() > this.lockoutUntil) {
      // 鎖定期已過，重置
      this.reset();
      return false;
    }

    return true;
  }

  /**
   * 記錄失敗嘗試
   */
  recordFailedAttempt(): void {
    this.attempts++;

    if (this.attempts >= this.MAX_ATTEMPTS) {
      this.lockoutUntil = Date.now() + this.LOCKOUT_DURATION;
    }
  }

  /**
   * 重置計數器（登入成功時呼叫）
   */
  reset(): void {
    this.attempts = 0;
    this.lockoutUntil = null;
  }

  /**
   * 取得剩餘鎖定時間（秒）
   */
  getRemainingLockoutTime(): number {
    if (this.lockoutUntil === null) return 0;
    return Math.ceil((this.lockoutUntil - Date.now()) / 1000);
  }
}
```

在 `LoginForm` 中整合:

```typescript
const rateLimiter = new LoginRateLimiter();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 檢查是否被鎖定
  if (rateLimiter.isLockedOut()) {
    const remainingTime = rateLimiter.getRemainingLockoutTime();
    setError(`登入嘗試次數過多，請等待 ${remainingTime} 秒後重試`);
    return;
  }

  // ... 原有登入邏輯 ...

  if (success) {
    rateLimiter.reset();
    router.push('/admin');
  } else {
    rateLimiter.recordFailedAttempt();
    setError('密碼錯誤，請重試');
  }
};
```

#### 5.2 雙因素驗證（簡易版）

若需額外安全層級，可實作「第二因素」驗證（如「請輸入活動名稱前 3 個字」）:

```typescript
const login = async (password: string, secondFactor: string): Promise<boolean> => {
  const passwordHash = await hashPassword(password);
  const correctPasswordHash = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH;
  const correctSecondFactor = process.env.NEXT_PUBLIC_SECOND_FACTOR;

  if (passwordHash === correctPasswordHash && secondFactor === correctSecondFactor) {
    sessionStorage.setItem('admin_token', 'authenticated');
    setIsAuthenticated(true);
    return true;
  }

  return false;
};
```

**注意**: 第二因素仍儲存於環境變數（前端可見），僅增加破解難度，非真正的雙因素驗證。

---

## 實作指引 - 方案 3 (替代方案)

### Vercel Edge Middleware 實作

#### 步驟 1: 建立 Edge Middleware (`middleware.ts`)

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Vercel Edge Middleware - 保護 /admin 路徑
 * 使用 HTTP Basic Authentication
 */
export function middleware(request: NextRequest) {
  // 僅保護 /admin 路徑（login 頁面除外）
  const pathname = request.nextUrl.pathname;

  // 讀取 Authorization header
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    // 未提供認證，要求 Basic Auth
    return new NextResponse('Authentication required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Admin Area"',
      },
    });
  }

  // 解析 Basic Auth credentials
  const [scheme, encoded] = authHeader.split(' ');

  if (scheme !== 'Basic') {
    return new NextResponse('Invalid authentication scheme', { status: 401 });
  }

  const buffer = Buffer.from(encoded, 'base64');
  const [username, password] = buffer.toString().split(':');

  // 驗證帳密（從環境變數讀取）
  const correctUsername = process.env.ADMIN_USERNAME;
  const correctPassword = process.env.ADMIN_PASSWORD;

  if (username === correctUsername && password === correctPassword) {
    // 認證成功，放行
    return NextResponse.next();
  }

  // 認證失敗
  return new NextResponse('Invalid credentials', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Admin Area"',
    },
  });
}

// 僅對 /admin 路徑執行 middleware
export const config = {
  matcher: '/admin/:path*',
};
```

#### 步驟 2: 設定環境變數

在 Vercel 專案設定中新增環境變數:
```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here
```

**⚠️ 注意**:
- 這些環境變數**僅存在於 Vercel 邊緣節點**，不會暴露於前端程式碼
- 密碼可直接使用明文（因為在伺服器端）

#### 步驟 3: 本地開發設定

`.env.local`:
```bash
ADMIN_USERNAME=admin
ADMIN_PASSWORD=dev_password_123
```

執行開發伺服器:
```bash
vercel dev  # 使用 Vercel CLI 模擬 Edge Middleware
```

---

## 使用者文件建議

### 管理員操作手冊（節錄）

#### 初次登入設定

**方案 1 - 環境變數密碼（推薦）**

1. **系統管理員**在部署前設定密碼:
   ```bash
   # 1. 生成密碼雜湊值
   node scripts/generate-password-hash.js YourSecurePassword

   # 2. 將輸出的雜湊值加入 .env.local
   NEXT_PUBLIC_ADMIN_PASSWORD_HASH=generated_hash_here

   # 3. 建置專案
   npm run build
   ```

2. **管理員**使用系統:
   - 開啟瀏覽器，進入 `http://localhost:3000/admin`
   - 輸入設定的密碼
   - 開始管理作業

**方案 1 - 首次設定密碼（替代方案）**

1. **首次開啟系統**時，系統偵測到無密碼設定
2. 顯示「初次設定精靈」，要求管理員設定密碼
3. 密碼儲存於 localStorage（雜湊後）
4. 後續登入時使用此密碼

#### 安全使用指南

**✅ 建議的使用環境**:
- 個人電腦（僅管理員使用）
- 活動現場專用平板/筆電（活動期間受物理保護）
- 公司內部網路（有防火牆保護）

**❌ 不建議的使用環境**:
- 公共電腦（如網咖、圖書館）
- 與他人共用的電腦
- 不受信賴的網路環境（如公共 Wi-Fi）

**🔒 安全最佳實踐**:
1. **定期變更密碼**: 每次活動結束後建議變更密碼
2. **定期匯出資料**: 每次抽獎完成後立即匯出結果（備份）
3. **活動結束後清除資料**: 使用「清除所有資料」功能（設定 > 資料管理）
4. **勿在不安全環境開啟**: 確保周圍無他人偷看螢幕
5. **使用私密瀏覽模式**: 建議使用無痕模式（活動結束後自動清除 sessionStorage）

**⚠️ 安全性限制說明**:
本系統採用**純前端架構**，所有資料儲存於瀏覽器本地。此設計有以下限制:
- 技術使用者可透過瀏覽器開發者工具檢視或修改資料
- 密碼保護可被繞過（但需要技術知識）
- 無法防範惡意軟體或鍵盤側錄

**因此，本系統適用於「信賴使用環境」（如個人裝置、受物理保護的現場設備），不適用於處理高敏感資料或需符合嚴格合規要求的場景。**

若您的使用場景需要更高的安全性，請考慮使用具備後端伺服器的完整認證系統。

---

## 安全性評估總結

### 純前端架構的根本限制

無論採用何種方案，純前端架構均有以下**無法克服的安全限制**:

| 限制 | 說明 | 影響 |
|------|------|------|
| **前端程式碼可讀** | 所有 JavaScript 程式碼可透過開發者工具檢視與反編譯 | 密碼驗證邏輯、雜湊值、金鑰均可被逆向工程 |
| **localStorage 明文儲存** | 瀏覽器儲存機制無原生加密支援 | 所有資料可透過開發者工具直接讀取 |
| **無伺服器端驗證** | 認證邏輯在客戶端執行 | 技術使用者可繞過認證（直接修改 sessionStorage）|
| **靜態檔案可存取** | 完全靜態匯出後，所有 HTML/CSS/JS 檔案均可直接存取 | 無法真正「隱藏」管理端頁面 |

### 威脅模型分析

**此方案可防範**:
- ✅ 非技術使用者直接存取管理功能
- ✅ 自動化工具的基本掃描（若不使用 `/admin` 等常見路徑）
- ✅ 搜尋引擎索引管理頁面（透過 `robots.txt` 與 `meta` 標籤）

**此方案無法防範**:
- ❌ 具備開發者工具使用知識的技術使用者
- ❌ 惡意軟體或鍵盤側錄程式
- ❌ 網路封包攔截（若未使用 HTTPS）
- ❌ 複雜的自動化攻擊（如暴力破解 + JavaScript 執行）

### 適用場景與風險等級

| 使用場景 | 風險等級 | 推薦方案 | 說明 |
|---------|---------|---------|------|
| 管理員個人電腦（離線） | ⭐ 低 | 方案 1 或 方案 2 | 完全信賴的環境 |
| 活動現場專用裝置 | ⭐⭐ 低-中 | 方案 1 | 受物理保護，活動期間受監控 |
| 公司內網（有防火牆） | ⭐⭐⭐ 中 | 方案 3 | 需真正認證，但仍是低風險環境 |
| 公開網路（如展場 Wi-Fi） | ⭐⭐⭐⭐ 中-高 | 方案 3 (必要) | 需伺服器端認證 |
| 處理敏感個資/金融資料 | ⭐⭐⭐⭐⭐ 高 | **不適用純前端** | 需完整後端認證系統 |

---

## 憲章合規性聲明

### VIII. 高安全性標準 - 例外處理申請

**例外理由**:
本專案採用**純前端架構 (完全靜態匯出)**，此設計選擇源自業務需求（離線運作、活動現場使用、無伺服器維護成本）。此架構決定導致以下憲章要求無法完全滿足:

1. **敏感資料加密儲存**: 瀏覽器 localStorage/IndexedDB 無原生加密支援，引入前端加密會增加複雜度且無法防止開發者工具存取
2. **身份驗證機制**: 純前端認證可被技術使用者繞過，無法達到「真正的身份驗證」

**業務需求正當性**:
- 規格明確要求「單機版網頁抽獎系統」、「離線環境」、「活動現場」使用
- 規格說明「不適用於需跨裝置同步數據或高併發的大型網路活動」
- 目標使用者為「活動管理員」（信賴使用者）
- 資料性質為「參與者名單與抽獎結果」（非金融交易或醫療資訊）

**緩解措施**:
1. **技術措施**:
   - 實作 sessionStorage 密碼保護（防範非技術使用者）
   - 員工編號/身分證號在 UI 部分遮罩
   - 定期匯出提醒（防止資料損失）
   - 登入嘗試次數限制（防範基本暴力破解）

2. **文件措施**:
   - 明確記錄「安全使用環境」要求（操作手冊）
   - 清楚說明安全性限制（使用者文件）
   - 提供安全最佳實踐指南

3. **替代方案提供**:
   - 若部署場景有公開網路存取，提供方案 3 (Edge Functions)
   - 文件說明何時應重新評估架構選擇

**例外期限**:
此例外適用於專案全生命週期，除非業務需求變更為需要「跨裝置同步」或「高安全性合規」場景。

**檢討機制**:
每次專案 Sprint 結束時，檢討:
1. 是否有使用者回報安全性疑慮
2. 是否有資料外洩或未授權存取事件
3. 業務需求是否已變更（如需處理敏感資料）

---

## 技術決策記錄 (ADR)

### ADR-001: 選擇方案 1 (簡易密碼保護) 作為預設實作

**日期**: 2025-10-24
**狀態**: ✅ 已批准
**決策者**: 研究團隊

**背景**:
專案需要在「完全靜態匯出」、「憲章高安全性要求」、「簡潔設計原則」之間取得平衡。

**決策**:
採用**方案 1 (URL 路徑區隔 + sessionStorage 密碼保護)** 作為預設實作，並提供**方案 3 (Edge Functions)** 作為替代方案。

**理由**:
1. **符合核心需求**: 完全靜態匯出相容，支援離線運作
2. **實作簡單**: 遵循 YAGNI 原則，約 100-150 行程式碼
3. **適用場景契合**: 專案目標為「活動現場」、「管理員個人裝置」等信賴環境
4. **風險可控**: 透過文件說明使用環境要求，明確溝通安全限制
5. **提供升級路徑**: 若需求變更，可升級至方案 3

**後果**:
- ✅ 開發成本低，維護負擔小
- ✅ 使用體驗良好（自訂 UI）
- ⚠️ 需向使用者清楚溝通安全限制
- ⚠️ 不適用於高風險場景（需在文件說明）

**替代方案**:
若專案部署至 Vercel/Netlify 且有公開網路存取需求,應使用方案 3 (Edge Functions)。

---

## 附錄: 程式碼檢查清單

### 實作完成後的檢查項目

**✅ 功能檢查**:
- [ ] 未登入時存取 `/admin` 自動導向 `/admin/login`
- [ ] 正確密碼登入成功並導向 `/admin`
- [ ] 錯誤密碼顯示錯誤訊息
- [ ] 登入後可正常存取所有管理端頁面
- [ ] 登出功能清除 sessionStorage 並導向登入頁
- [ ] 分頁關閉後重新開啟需重新登入

**✅ 安全性檢查**:
- [ ] 密碼雜湊值使用 SHA-256（非明文）
- [ ] `.env.local` 已加入 `.gitignore`
- [ ] 管理端頁面包含 `<meta name="robots" content="noindex, nofollow">`
- [ ] 登入嘗試次數限制已實作（選用）
- [ ] Console 無警告或錯誤訊息洩漏敏感資訊

**✅ 程式碼品質檢查**:
- [ ] 所有函式與元件有繁體中文註解
- [ ] TypeScript strict mode 無錯誤
- [ ] ESLint 檢查通過
- [ ] Prettier 格式化完成

**✅ 測試檢查**:
- [ ] 單元測試涵蓋 AuthContext 核心邏輯
- [ ] Chrome DevTools 手動測試完成（Performance、Console、Application）
- [ ] 不同瀏覽器測試（Chrome、Firefox、Safari、Edge）

**✅ 文件檢查**:
- [ ] README.md 包含管理端存取說明
- [ ] 操作手冊包含安全使用指南
- [ ] 技術文件說明安全性限制與適用場景
- [ ] 提供密碼變更步驟文件

---

## 結論

本研究針對 Lottery-V1 純前端抽獎系統的管理端存取保護需求,提供完整的方案比較與實作指引。

**核心建議**:
1. **預設採用方案 1** (簡易密碼保護): 符合專案「完全靜態」需求與「簡潔設計」原則
2. **明確溝通安全限制**: 透過文件說明適用場景與風險
3. **提供升級路徑**: 若需求變更,可升級至方案 3 (Edge Functions)

**關鍵認知**:
> **純前端架構無法提供「真正的安全性」,僅能提供「適當的存取控制」。**
> 此方案適用於**信賴使用環境**與**低風險場景**,不適用於高敏感資料或嚴格合規要求。

專案應在**符合業務需求**（離線、活動現場）與**憲章要求**（高安全性）之間取得務實的平衡,並透過文件與使用者教育確保系統在適當的環境下使用。

---

**研究完成日期**: 2025-10-24
**下一步行動**: 將本研究結果納入 `plan.md` Phase 0 研究成果,並在 Phase 1 設計階段詳細規劃實作細節。
