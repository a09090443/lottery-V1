/**
 * Test Helper Functions
 * 測試輔助函式
 */

import { Page, expect } from '@playwright/test';
import { TEST_ADMIN_PASSWORD } from './test-data-generator';

/**
 * 清除瀏覽器儲存資料
 */
export async function clearBrowserStorage(page: Page) {
  // 先導航到應用程式頁面，這樣才能訪問 localStorage
  await page.goto('/');

  // 清除所有儲存資料
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  // 清除 cookies
  await page.context().clearCookies();
}

/**
 * 設定管理員密碼
 */
export async function setupAdminPassword(page: Page, password: string = TEST_ADMIN_PASSWORD) {
  await page.goto('/admin/login');

  // 檢查是否為首次設定密碼
  const isFirstTime = await page.locator('text=設定管理員密碼').isVisible();

  if (isFirstTime) {
    await page.fill('input[type="password"]#password', password);
    await page.fill('input[type="password"]#confirmPassword', password);
    await page.click('button[type="submit"]');

    // 等待設定成功
    await page.waitForURL('/admin/login');
  }
}

/**
 * 管理員登入
 */
export async function adminLogin(page: Page, password: string = TEST_ADMIN_PASSWORD) {
  await page.goto('/admin/login');

  // 如果已登入，直接返回
  const currentUrl = page.url();
  if (currentUrl.includes('/admin') && !currentUrl.includes('/login')) {
    return;
  }

  await page.fill('input[type="password"]#password', password);
  await page.click('button[type="submit"]:has-text("登入")');

  // 等待跳轉到管理儀表板
  await page.waitForURL('/admin', { timeout: 5000 });
  await expect(page.locator('text=管理儀表板')).toBeVisible();
}

/**
 * 管理員登出
 */
export async function adminLogout(page: Page) {
  await page.goto('/admin');
  await page.click('button:has-text("登出")');
  await page.waitForURL('/admin/login');
}

/**
 * 建立測試活動
 */
export async function createTestEvent(
  page: Page,
  eventData: {
    name: string;
    description?: string;
    scheduledAt?: string;
    allowDuplicateWinners?: boolean;
  }
) {
  await page.goto('/admin/events');
  await page.click('text=建立新活動');

  // 填寫活動資料
  await page.fill('input[name="name"]', eventData.name);

  if (eventData.description) {
    await page.fill('textarea[name="description"]', eventData.description);
  }

  if (eventData.scheduledAt) {
    const date = new Date(eventData.scheduledAt);
    const dateStr = date.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);
  }

  if (eventData.allowDuplicateWinners) {
    await page.check('input[name="allowDuplicateWinners"]');
  }

  // 提交表單
  await page.click('button[type="submit"]:has-text("建立")');

  // 等待建立成功
  await page.waitForURL(/\/admin\/events\/[a-f0-9-]+/);
}

/**
 * 新增獎項
 */
export async function addPrize(
  page: Page,
  prizeData: {
    name: string;
    description?: string;
    totalQuantity: number;
  }
) {
  await page.click('text=新增獎項');

  await page.fill('input[name="name"]', prizeData.name);

  if (prizeData.description) {
    await page.fill('textarea[name="description"]', prizeData.description);
  }

  await page.fill('input[name="totalQuantity"]', prizeData.totalQuantity.toString());

  await page.click('button[type="submit"]:has-text("新增")');

  // 等待新增成功
  await expect(page.locator(`text=${prizeData.name}`)).toBeVisible();
}

/**
 * 匯入參與者（CSV）
 */
export async function importParticipantsCSV(page: Page, csvBlob: Blob) {
  // 點擊匯入按鈕
  await page.click('text=匯入參與者');

  // 建立 File 物件
  const buffer = await csvBlob.arrayBuffer();
  const file = new File([buffer], 'participants.csv', { type: 'text/csv' });

  // 上傳檔案
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles({
    name: 'participants.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(buffer),
  });

  // 等待預覽畫面
  await expect(page.locator('text=預覽匯入資料')).toBeVisible();

  // 點擊開始匯入
  await page.click('button:has-text("開始匯入")');

  // 等待匯入完成
  await expect(page.locator('text=匯入完成')).toBeVisible({ timeout: 30000 });

  // 關閉匯入對話框
  await page.click('button:has-text("完成")');
}

/**
 * 手動新增參與者
 */
export async function addParticipant(
  page: Page,
  participantData: {
    name: string;
    employeeId?: string;
    nationalId?: string;
    email?: string;
    phone?: string;
  }
) {
  await page.click('text=新增參與者');

  await page.fill('input[name="name"]', participantData.name);

  if (participantData.employeeId) {
    await page.fill('input[name="employeeId"]', participantData.employeeId);
  }

  if (participantData.nationalId) {
    await page.fill('input[name="nationalId"]', participantData.nationalId);
  }

  if (participantData.email) {
    await page.fill('input[name="email"]', participantData.email);
  }

  if (participantData.phone) {
    await page.fill('input[name="phone"]', participantData.phone);
  }

  await page.click('button[type="submit"]:has-text("新增")');

  // 等待新增成功
  await expect(page.locator(`text=${participantData.name}`)).toBeVisible();
}

/**
 * 執行抽獎
 */
export async function executeDraw(page: Page, prizeName: string) {
  // 選擇獎項
  await page.click(`text=${prizeName}`);

  // 點擊開始抽獎
  await page.click('button:has-text("開始抽獎")');

  // 等待動畫完成（最多 10 秒）
  await page.waitForTimeout(6000);

  // 等待中獎者顯示
  await expect(page.locator('text=確認中獎')).toBeVisible({ timeout: 10000 });
}

/**
 * 確認中獎者
 */
export async function confirmWinner(page: Page) {
  await page.click('button:has-text("確認中獎")');

  // 等待確認成功
  await page.waitForTimeout(1000);
}

/**
 * 取消中獎並重抽
 */
export async function cancelAndRedraw(page: Page) {
  await page.click('button:has-text("取消並重抽")');

  // 等待重新抽獎
  await page.waitForTimeout(6000);
}

/**
 * 匯出結果
 */
export async function exportResults(page: Page, format: 'CSV' | 'JSON' = 'CSV') {
  // 點擊匯出按鈕
  await page.click('button:has-text("匯出")');

  // 等待下拉選單顯示
  await page.waitForTimeout(500);

  // 點擊對應格式
  if (format === 'CSV') {
    await page.click('text=匯出中獎名單 (CSV)');
  } else {
    await page.click('text=匯出中獎名單 (JSON)');
  }

  // 等待下載完成
  await page.waitForTimeout(1000);
}

/**
 * 檢查儲存空間使用率
 */
export async function checkStorageUsage(page: Page): Promise<number> {
  const usageText = await page.locator('text=儲存空間使用率').first().textContent();
  const match = usageText?.match(/(\d+)%/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * 等待並檢查 Toast 通知
 */
export async function expectToast(page: Page, message: string) {
  await expect(page.locator(`.toast:has-text("${message}")`)).toBeVisible({ timeout: 5000 });
}

/**
 * 等待確認對話框並確認
 */
export async function confirmDialog(page: Page, expectedTitle?: string) {
  if (expectedTitle) {
    await expect(page.locator(`.dialog:has-text("${expectedTitle}")`)).toBeVisible();
  }

  await page.click('button:has-text("確認")');
}

/**
 * 等待確認對話框並取消
 */
export async function cancelDialog(page: Page) {
  await page.click('button:has-text("取消")');
}

/**
 * 檢查元素是否存在
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  const element = await page.locator(selector).count();
  return element > 0;
}

/**
 * 等待網路請求完成
 */
export async function waitForNetwork(page: Page, timeout: number = 3000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * 截圖（用於除錯）
 */
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `tests/screenshots/${name}.png`, fullPage: true });
}

/**
 * 生成唯一的測試 ID
 */
export function generateTestId(): string {
  return `test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}
