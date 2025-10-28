# Research Report: Browser-Based Lottery System

**Feature**: 001-browser-lottery-system
**Date**: 2025-10-24
**Status**: Phase 0 Complete

本文件記錄在技術設計前需要解決的所有技術不確定性與研究結果。

---

## 研究目標

Phase 0 需要解決 Technical Context 中標記為 "NEEDS CLARIFICATION" 的項目：

1. **動畫函式庫選擇**：GSAP vs Anime.js vs Framer Motion
2. **測試框架選擇**：Jest vs Vitest（單元/整合測試）
3. **管理端存取保護機制**：如何在純前端環境中保護管理端路由

---

## 研究主題 1: 動畫函式庫選擇

### 決策：✅ 選擇 **Framer Motion**

### 理由

1. **React 原生整合最佳**
   - 專為 React 設計，API 符合 React 開發習慣
   - 聲明式寫法與 React 哲學一致，易於維護
   - Next.js 社群最廣泛使用（1000 萬+ 週下載量）

2. **符合專案需求**
   - GPU 硬體加速，處理 500-1000 筆資料流暢
   - useAnimate hook 可實現序列動畫控制
   - 豐富的 easing functions 支援 ease-out 效果
   - 支援暫停/繼續/重置動畫

3. **效能與體積平衡**
   - 使用 LazyMotion 可優化至 5.5 kB
   - motionValue 優化只重渲染變化元素
   - GPU 加速確保 60fps 流暢度

4. **開發體驗優秀**
   - TypeScript 官方完整支援
   - 文檔豐富，React 生態系範例多
   - 學習曲線低（熟悉 React 即可）

5. **符合「簡潔設計」原則**
   - 按需載入功能，不引入過多不需要的代碼
   - API 設計簡潔，不過度抽象
   - 維護負擔低，更新頻繁且穩定

### 替代方案評估

| 選項 | 優勢 | 劣勢 | 適用情境 |
|-----|------|------|---------|
| **Anime.js** | • 最小 bundle size (27.6 KB)<br>• API 極簡易學<br>• 符合 YAGNI 原則 | • React 整合需手動處理<br>• 社群支援較少<br>• 複雜序列動畫控制較弱 | 極度重視 bundle size，動畫需求簡單 |
| **GSAP** | • 業界標準，效能最可靠<br>• Timeline 系統最強大<br>• 2025 年起完全免費<br>• 文檔與社群資源豐富 | • Bundle size 最大 (75 KB)<br>• 非 React 原生<br>• 功能過於豐富（可能違反 YAGNI） | 需要極度複雜的動畫編排 |

### 技術規格比較

| 項目 | GSAP | Anime.js | Framer Motion |
|------|------|----------|---------------|
| **最新版本** | 3.13.0 | 4.x | 12.23.24 |
| **Bundle Size** | ~75KB | 27.6 KB | 60.4 KB (可優化至 4.6-5.5 KB) |
| **npm 週下載量** | 1,096,705 | 324,220 | 10,239,219 |
| **授權條款** | 100% 免費（2025 年起） | MIT License | MIT License |
| **React 原生支援** | 官方 @gsap/react 套件 | 第三方包裝器 | ✅ 原生為 React 設計 |
| **TypeScript 支援** | ✅ 完整 | ✅ V4 原生支援 | ✅ 完整 |
| **GPU 加速** | ✅ | ✅ | ✅ 2.5x faster（特定場景） |

### 實作建議

**安裝指令**
```bash
npm install framer-motion
```

**基本使用範例（吃角子老虎機組件）**
```typescript
'use client';

import { useAnimate } from 'framer-motion';
import { useState } from 'react';

export default function SlotMachine({ participants, onComplete }) {
  const [scope, animate] = useAnimate();
  const [isSpinning, setIsSpinning] = useState(false);

  const spin = async () => {
    setIsSpinning(true);

    // 快速滾動 5 秒，逐漸減速
    await animate(
      scope.current,
      { y: -5000 },
      {
        duration: 5,
        ease: [0.25, 0.1, 0.25, 1], // cubic-bezier ease-out
      }
    );

    // 停在中獎者並高亮
    const winnerIndex = Math.floor(Math.random() * participants.length);
    await animate(
      `.participant-${winnerIndex}`,
      {
        scale: 1.2,
        backgroundColor: '#ffd700',
      },
      { duration: 0.3 }
    );

    setIsSpinning(false);
    onComplete(participants[winnerIndex]);
  };

  return (
    <div className="slot-machine">
      <div ref={scope} className="slot-reel">
        {participants.map((participant, index) => (
          <div
            key={participant.id}
            className={`participant participant-${index}`}
          >
            {participant.name}
          </div>
        ))}
      </div>
      <button onClick={spin} disabled={isSpinning}>
        {isSpinning ? '抽獎中...' : '開始抽獎'}
      </button>
    </div>
  );
}
```

**效能優化（LazyMotion）**
```typescript
'use client';

import { LazyMotion, domAnimation, m, useAnimate } from 'framer-motion';

export default function SlotMachine() {
  return (
    <LazyMotion features={domAnimation} strict>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* 組件內容 */}
      </m.div>
    </LazyMotion>
  );
}
```

---

## 研究主題 2: 測試框架選擇

### 決策：✅ 選擇 **Vitest + React Testing Library + Playwright**

### 測試框架組合

```
├── 單元測試：Vitest + React Testing Library
├── 整合測試：Vitest + React Testing Library
└── E2E 測試：Playwright
```

### 理由

1. **符合專案憲章的「簡潔設計」原則**
   - Vitest 設定簡潔，無需複雜的 Babel/轉換設定
   - 原生支援 TypeScript 和 ESM，開箱即用
   - 與現有 Vite 生態系統無縫整合

2. **滿足「Chrome DevTools 測試」憲章要求**
   - Playwright 完整支援 Chrome DevTools Protocol (CDP)
   - 可進行效能分析、網路攔截、瀏覽器內部檢查
   - Cypress 目前不支援 CDP（未來才會加入）

3. **最佳效能與開發體驗**
   - Vitest 測試速度快 3-5 倍（特別是 watch mode）
   - Playwright 原生平行執行，E2E 測試速度優異
   - 記憶體使用減少 30%

4. **Next.js 官方推薦的現代方案**
   - Next.js 14 官方文件同時提供 Vitest 和 Playwright 指南
   - 社群趨勢明顯轉向 Vitest（2021-2023 快速崛起）
   - 與 Next.js App Router 整合良好

5. **完整的瀏覽器支援（包含 Safari）**
   - Playwright 完整支援 Chrome, Firefox, Safari/WebKit
   - Cypress 的 Safari 支援僅為實驗性質
   - 對於需要跨瀏覽器測試的專案，這是關鍵優勢

### 替代方案評估

#### 選項：Jest + React Testing Library + Cypress

**適用情境**
- 團隊已有豐富的 Jest 經驗
- 現有專案已使用 Jest（遷移成本考量）
- 重視偵錯體驗，願意犧牲 Safari 支援

**優勢**
- Jest 生態系統成熟，社群資源豐富
- Cypress 的時間旅行偵錯體驗優於 Playwright
- 不需要 Safari/WebKit 測試

**劣勢**
- ❌ 不符合 CDP 憲章要求
- ❌ 效能較差
- ❌ 設定較複雜

### 框架比較

#### 單元/整合測試框架

| 項目 | Jest | Vitest |
|------|------|--------|
| **最新穩定版本** | v30.2.0 | v4.0.2 / v3.2.4 |
| **npm 週下載量** | 13,174 個專案使用 | 12,701,162 週下載量 |
| **Next.js 官方推薦** | ✅ 提供設定指南 | ✅ 提供設定指南（較新選擇） |
| **TypeScript 支援** | 透過 ts-jest | ✅ 內建原生支援 |
| **設定複雜度** | 🟡 中等（需 jest.config.js） | 🟢 低（vitest.config.ts） |
| **測試執行速度** | 🟡 中等（100 測試 ~15.5 秒） | 🟢 快速（100 測試 ~3.8 秒） |
| **Watch Mode 效能** | 🟡 較慢 | 🟢 類似 HMR，快 10-20x |
| **記憶體使用** | ~1.2 GB（50K 行專案） | ~800 MB（減少 30%） |

#### E2E 測試框架

| 項目 | Playwright | Cypress |
|------|-----------|---------|
| **瀏覽器支援** | Chrome, Firefox, **Safari 完整支援** | Chrome, Firefox, Safari 實驗性 |
| **CDP 支援** | ✅ **完整支援** | ❌ 目前不支援（開發中） |
| **偵錯體驗** | ✅ Inspector + Trace Viewer | 🟢 **優秀的時間旅行偵錯** |
| **平行執行** | ✅ 原生支援 | 需額外設定 |
| **多 Tab 支援** | ✅ 支援 | ❌ 不支援 |
| **跨域測試** | ✅ 支援 | ⚠️ 受限於同源政策 |

### 實作建議

**安裝指令**
```bash
# Vitest + React Testing Library
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/user-event vite-tsconfig-paths

# Playwright
npm install -D @playwright/test
npx playwright install

# 測試工具與模擬套件
npm install -D fake-indexeddb vitest-localstorage-mock @vitest/coverage-v8
```

**設定檔範例**

`vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
})
```

`tests/setup.ts`
```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// IndexedDB 模擬
import { indexedDB, IDBKeyRange } from 'fake-indexeddb'
global.indexedDB = indexedDB
global.IDBKeyRange = IDBKeyRange

afterEach(() => {
  cleanup()
})
```

`playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

**package.json 腳本設定**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test:run && npm run test:e2e"
  }
}
```

### Chrome DevTools 測試整合（憲章要求）

**方法 1: 使用 Playwright CDP 進行自動化效能測試**
```typescript
// e2e/performance.spec.ts
import { test, expect } from '@playwright/test'

test('效能測試：首頁載入時間', async ({ page }) => {
  const client = await page.context().newCDPSession(page)
  await client.send('Performance.enable')

  const startTime = Date.now()
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const performanceMetrics = await client.send('Performance.getMetrics')
  const loadTime = Date.now() - startTime

  // 驗證載入時間 < 2 秒（憲章要求）
  expect(loadTime).toBeLessThan(2000)
})
```

**方法 2: 手動 Chrome DevTools 檢查清單**

建立 `docs/testing-checklist.md` 包含：
- Performance: 首屏渲染時間 < 2 秒
- Network: 檢查所有資源載入狀態
- Console: 無錯誤與警告
- Device Mode: 響應式設計測試
- Lighthouse: Performance Score ≥ 90
- Application: localStorage/IndexedDB 資料檢查

### SQLite WASM 測試策略

由於 WASM 在測試環境中載入複雜，採用**分層測試策略**：

**策略 A: 抽象層模式（推薦）**
```typescript
// 定義介面
export interface DatabaseAdapter {
  execute(sql: string): Promise<any>
  close(): Promise<void>
}

// 生產環境：使用 sql.js
export class SqlJsAdapter implements DatabaseAdapter { }

// 測試環境：使用 better-sqlite3
export class BetterSqlite3Adapter implements DatabaseAdapter { }
```

**策略 B: E2E 測試驗證 WASM 功能**
```typescript
test('SQLite WASM 完整功能測試', async ({ page }) => {
  await page.goto('/database-test')
  await page.waitForSelector('.wasm-loaded')
  // 測試資料庫操作...
})
```

---

## 研究主題 3: 管理端存取保護機制

### 決策：✅ 選擇 **簡易密碼保護 + sessionStorage + 文件說明**

### 理由

1. **符合純前端架構限制**
   - 完全靜態匯出（static export）無法實現真正的伺服器端驗證
   - Next.js Middleware 需要伺服器支援，會禁用靜態最佳化
   - 純前端方案的保護本質上是有限的

2. **符合「簡潔設計」原則**
   - 實作簡單，無需複雜的認證系統
   - 符合 YAGNI 原則（不實現當前不需要的功能）
   - 維護負擔低

3. **符合業務需求**
   - 規格定位為「單機版」、「活動現場使用」
   - 單一裝置、單一管理員使用情境
   - 不需要多裝置同步或遠端存取

4. **平衡安全性與可用性**
   - 提供基本的存取控制（防止一般使用者誤入）
   - 透過文件說明使用環境建議（安全環境、專用裝置）
   - 明確說明安全性限制

### 技術方案詳細設計

#### 方案架構

```
公開前台 (/)           管理端 (/admin)
     │                       │
     │                   [檢查 sessionStorage]
     │                       │
     │                 有 token？
     │                  /      \
     │                否        是
     │                │         │
     │          [顯示密碼頁]  [顯示管理介面]
     │                │
     │          [輸入密碼]
     │                │
     │          [驗證密碼]
     │             /    \
     │           錯誤    正確
     │            │      │
     │        [錯誤訊息] [設定 sessionStorage token]
     │                   │
     └───────────────────┴─ [導向管理儀表板]
```

#### 實作細節

**1. 密碼設定方式**

採用「首次設定」模式：
- 系統初次啟動時，管理員設定密碼
- 密碼儲存於 localStorage（經過簡單 hash）
- 提供「重置密碼」功能（需清除所有資料）

**2. 驗證流程**

```typescript
// src/lib/auth/admin-auth.ts

/**
 * 管理員驗證工具
 * 注意：這是前端驗證，僅提供基本存取控制，無法防止技術性繞過
 */

const ADMIN_PASSWORD_KEY = 'lottery_admin_password';
const SESSION_TOKEN_KEY = 'lottery_admin_session';

// 簡單 hash 函式（SHA-256）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 設定管理員密碼（首次使用）
export async function setAdminPassword(password: string): Promise<void> {
  const hashed = await hashPassword(password);
  localStorage.setItem(ADMIN_PASSWORD_KEY, hashed);
}

// 驗證管理員密碼
export async function verifyAdminPassword(password: string): Promise<boolean> {
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
  if (!stored) return false;

  const hashed = await hashPassword(password);
  return hashed === stored;
}

// 建立 session token
export function createSessionToken(): string {
  const token = crypto.randomUUID();
  sessionStorage.setItem(SESSION_TOKEN_KEY, token);
  return token;
}

// 檢查是否已登入
export function isAdminLoggedIn(): boolean {
  return !!sessionStorage.getItem(SESSION_TOKEN_KEY);
}

// 登出
export function logout(): void {
  sessionStorage.removeItem(SESSION_TOKEN_KEY);
}

// 檢查是否已設定密碼
export function isPasswordSet(): boolean {
  return !!localStorage.getItem(ADMIN_PASSWORD_KEY);
}
```

**3. 路由保護元件**

```typescript
// src/components/auth/ProtectedRoute.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminLoggedIn } from '@/lib/auth/admin-auth';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) {
      router.push('/admin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) {
    return <div>驗證中...</div>;
  }

  return <>{children}</>;
}
```

**4. 登入頁面**

```typescript
// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { verifyAdminPassword, createSessionToken } from '@/lib/auth/admin-auth';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await verifyAdminPassword(password);
    if (isValid) {
      createSessionToken();
      router.push('/admin');
    } else {
      setError('密碼錯誤，請重試');
      setPassword('');
    }
  };

  return (
    <div className="login-container">
      <h1>管理員登入</h1>
      <form onSubmit={handleLogin}>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="請輸入管理員密碼"
          required
        />
        <button type="submit">登入</button>
        {error && <p className="error">{error}</p>}
      </form>

      <div className="security-notice">
        ⚠️ 安全提示：
        <ul>
          <li>請在安全的環境下使用本系統（個人電腦、專用裝置）</li>
          <li>使用完畢後請關閉瀏覽器視窗</li>
          <li>請勿在公共電腦上登入管理端</li>
        </ul>
      </div>
    </div>
  );
}
```

**5. 管理端 Layout 保護**

```typescript
// src/app/admin/layout.tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="admin-layout">
        <header>
          <h1>管理端</h1>
          <LogoutButton />
        </header>
        <main>{children}</main>
      </div>
    </ProtectedRoute>
  );
}
```

### 安全性限制與緩解措施

#### 已知限制

| 限制 | 說明 | 風險等級 |
|-----|------|---------|
| **localStorage 明文可見** | 雖然密碼經過 hash，但可透過開發者工具查看 | 🟡 中等 |
| **前端驗證可繞過** | 技術熟練者可透過瀏覽器開發者工具繞過 | 🟡 中等 |
| **無 XSS 防護** | 若網站存在 XSS 漏洞，攻擊者可竊取資料 | 🟡 中等 |
| **無法防止直接存取** | 靜態檔案已下載，無法阻止直接存取 HTML/JS | 🟡 中等 |

#### 緩解措施

1. **使用環境建議**
   - 在文件中明確說明應在「安全環境」下使用（個人電腦、活動專用裝置）
   - 建議使用完畢後關閉瀏覽器
   - 不建議在公共電腦或不受信任的環境下使用

2. **密碼複雜度要求**
   - 強制密碼長度至少 8 字元
   - 建議包含數字、字母、特殊符號

3. **Session 逾時機制**
   - sessionStorage 在分頁關閉後自動清除
   - 可額外實作 idle timeout（30 分鐘無操作自動登出）

4. **XSS 防護**
   - React 預設會 escape 使用者輸入
   - 額外驗證所有使用者輸入（參與者名稱、活動名稱等）
   - 使用 Content Security Policy (CSP) headers（若部署平台支援）

5. **資料匯出加密（可選）**
   - 匯出 CSV/JSON 時可選擇性加密
   - 管理員需輸入密碼才能解密檔案

### 替代方案評估

| 方案 | 可行性 | 安全性 | 簡潔性 | 推薦度 |
|-----|-------|--------|-------|--------|
| **簡易密碼 + sessionStorage**（選擇） | ✅ 高 | 🟡 中等 | ✅ 高 | ⭐⭐⭐⭐⭐ |
| **URL 路徑隱藏 + 文件說明** | ✅ 高 | 🔴 低 | ✅ 極高 | ⭐⭐ |
| **Middleware + Edge Functions** | ❌ 低（違反靜態匯出要求） | ✅ 高 | 🔴 低 | ⭐ |
| **HTTP Basic Auth**（託管平台） | 🟡 中（依賴平台支援） | ✅ 高 | 🟡 中 | ⭐⭐⭐ |

**說明**：
- **方案 1**（選擇）：平衡安全性、可用性與簡潔性
- **方案 2**：過於簡陋，幾乎無保護
- **方案 3**：違反「完全靜態匯出」要求，增加部署複雜度
- **方案 4**：可行但依賴特定託管平台（Vercel, Netlify），降低可攜性

### 文件與使用者教育

**使用者文件建議**（將在 user-manual.md 中詳細說明）

1. **首次設定指引**
   - 如何設定管理員密碼
   - 密碼強度建議
   - 密碼遺失處理（需清除所有資料重新開始）

2. **安全使用指引**
   - 建議使用環境（專用裝置、個人電腦）
   - 不建議使用環境（公共電腦、網咖）
   - 使用完畢後的清理步驟

3. **資料備份建議**
   - 定期匯出活動資料
   - 備份檔案儲存建議
   - 匯出資料加密選項

4. **風險告知**
   - 明確說明純前端架構的安全性限制
   - 告知 localStorage 可被開發者工具查看
   - 建議在私密環境下操作

### 憲章合規性評估

**VIII. 高安全性標準 - 重新評估**

經過研究，本方案對憲章「高安全性標準」的遵循情況：

| 要求 | 合規狀態 | 說明 |
|-----|---------|------|
| 防範 XSS | ✅ | React 預設 escape + 輸入驗證 |
| 防範 injection | ✅ | SQLite WASM 參數化查詢 |
| 敏感資料加密 | ⚠️ | localStorage 明文儲存（技術限制），UI 遮罩 + 文件警告 |
| 身份驗證 | ✅ | 簡易密碼 + sessionStorage |
| 操作日誌 | 🟡 | 建議記錄關鍵操作至 localStorage |
| 依賴掃描 | ✅ | npm audit + 定期更新 |

**結論**：在純前端架構限制下，本方案已盡可能遵循高安全性標準。透過使用環境建議、文件警告與風險告知，可接受此例外處理。

---

## 決策摘要表

| 不確定項目 | 最終決策 | 替代方案 |
|----------|---------|---------|
| **動畫函式庫** | **Framer Motion** | Anime.js（最小 bundle）<br>GSAP（複雜動畫） |
| **測試框架** | **Vitest + React Testing Library** | Jest + React Testing Library |
| **E2E 測試** | **Playwright** | Cypress（偵錯體驗佳） |
| **管理端保護** | **簡易密碼 + sessionStorage** | HTTP Basic Auth（平台依賴）<br>URL 隱藏（過於簡陋） |

---

## Phase 1 準備事項

基於以上研究結果，Phase 1 設計階段需要：

1. **資料模型設計**（data-model.md）
   - 定義 Event, Participant, Prize, Result 實體
   - 定義 localStorage 儲存結構
   - 定義 SQLite WASM 資料表結構
   - 定義管理員認證資料結構

2. **API 合約設計**（contracts/）
   - 雖為純前端，但需定義：
     - TypeScript 介面（Event, Participant, Prize, Result）
     - 資料驗證規則（Zod schema）
     - 匯入檔案格式規範（CSV, Excel）
     - 匯出檔案格式規範（CSV, JSON）

3. **快速開始指南**（quickstart.md）
   - 安裝步驟（Node.js, npm install）
   - 開發環境啟動（npm run dev）
   - 測試執行（npm test, npm run test:e2e）
   - 建置與部署（npm run build, npm run export）

4. **技術堆疊確認**

最終技術堆疊：
```
├── 前端框架：Next.js 14+ (App Router)
├── 開發語言：TypeScript 5.x
├── UI 函式庫：React 18+
├── 動畫函式庫：Framer Motion
├── 資料庫：SQLite (sql.js WASM)
├── 儲存策略：localStorage (primary) + IndexedDB (fallback)
├── 測試框架：
│   ├── 單元/整合：Vitest + React Testing Library
│   └── E2E：Playwright
├── 程式碼品質：ESLint + Prettier
└── 管理端保護：簡易密碼 + sessionStorage
```

---

## 風險與注意事項

1. **Framer Motion Bundle Size**
   - 風險：完整版 60.4 KB 可能影響首次載入
   - 緩解：使用 LazyMotion 優化至 5.5 KB

2. **SQLite WASM 測試複雜度**
   - 風險：WASM 在測試環境載入困難
   - 緩解：使用抽象層模式，測試環境用 better-sqlite3

3. **管理端保護安全性限制**
   - 風險：純前端無法實現真正的安全驗證
   - 緩解：文件明確說明限制、使用環境建議、風險告知

4. **localStorage 儲存空間限制**
   - 風險：典型限制 5-10 MB，大量參與者可能超出
   - 緩解：
     - 實作儲存空間監控
     - 超過閾值時警告並建議匯出
     - 提供資料清理功能

5. **瀏覽器相容性**
   - 風險：舊版瀏覽器可能不支援 SQLite WASM
   - 緩解：
     - 文件明確說明瀏覽器要求（最近 2 年版本）
     - 實作瀏覽器檢測與警告

---

## 參考資源

### 動畫函式庫
- [Framer Motion 官方文件](https://www.framer.com/motion/)
- [GSAP 官方文件](https://gsap.com/)
- [Anime.js 官方文件](https://animejs.com/)

### 測試框架
- [Vitest 官方文件](https://vitest.dev/)
- [Playwright 官方文件](https://playwright.dev/)
- [Next.js Testing 文件](https://nextjs.org/docs/app/guides/testing)
- [React Testing Library](https://testing-library.com/react)

### 安全性
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Web Storage Security](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#security)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

### Next.js & React
- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [React 18 文件](https://react.dev/)
- [TypeScript 5 文件](https://www.typescriptlang.org/)

---

**研究完成日期**: 2025-10-24
**下一階段**: Phase 1 - Design & Contracts
**狀態**: ✅ 所有不確定性已解決，可進入設計階段
