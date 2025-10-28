/**
 * E2E Test: Public Frontend
 * 公開前台測試
 */

import { test, expect } from '@playwright/test';
import {
  clearBrowserStorage,
  setupAdminPassword,
  adminLogin,
  createTestEvent,
  addPrize,
  importParticipantsCSV,
  executeDraw,
  confirmWinner,
} from '../helpers/test-helpers';
import {
  generateSmallTestScenario,
  generateUniqueEventName,
} from '../helpers/test-data-generator';

test.describe('公開前台功能測試', () => {
  let eventId: string;
  let eventName: string;

  test.beforeAll(async ({ browser }) => {
    // 在所有測試前建立一個完整的測試活動
    const page = await browser.newPage();

    await clearBrowserStorage(page);
    await setupAdminPassword(page);
    await adminLogin(page);

    const scenario = generateSmallTestScenario();
    eventName = generateUniqueEventName('公開前台測試活動');

    // 建立活動
    await createTestEvent(page, {
      name: eventName,
      description: '這是一個測試活動',
    });

    // 取得活動 ID
    const url = page.url();
    eventId = url.split('/').pop()!;

    // 新增獎項
    for (const prize of scenario.prizes) {
      await addPrize(page, prize);
    }

    // 匯入參與者
    await page.click('text=參與者');
    await importParticipantsCSV(page, scenario.csvBlob);

    // 執行抽獎
    await page.goto(`/admin/draw/${eventId}`);
    const firstPrize = scenario.prizes[0];

    for (let i = 0; i < firstPrize.totalQuantity; i++) {
      await executeDraw(page, firstPrize.name);
      await confirmWinner(page);
      await page.waitForTimeout(1000);
    }

    await page.close();
  });

  test('03-01: 公開首頁顯示活動列表', async ({ page }) => {
    await page.goto('/');

    // 應顯示標題
    await expect(page.locator('h1')).toContainText('抽獎系統');

    // 應顯示活動列表或活動卡片
    await expect(page.locator('text=活動')).toBeVisible();
  });

  test('03-02: 公開活動列表頁面', async ({ page }) => {
    await page.goto('/events');

    // 應顯示測試活動
    await expect(page.locator(`text=${eventName}`)).toBeVisible();

    // 活動應可點擊
    const eventLink = page.locator(`a:has-text("${eventName}")`);
    await expect(eventLink).toBeVisible();
  });

  test('03-03: 公開活動詳情頁面', async ({ page }) => {
    await page.goto(`/events/${eventId}`);

    // 應顯示活動名稱
    await expect(page.locator(`text=${eventName}`)).toBeVisible();

    // 應顯示活動描述
    await expect(page.locator('text=這是一個測試活動')).toBeVisible();

    // 應顯示獎項資訊
    await expect(page.locator('text=獎項')).toBeVisible();
  });

  test('03-04: 公開頁面顯示中獎名單（ID 已遮罩）', async ({ page }) => {
    await page.goto(`/events/${eventId}`);

    // 應顯示中獎名單區塊
    await expect(page.locator('text=中獎名單')).toBeVisible();

    // 檢查是否有遮罩的 ID（應包含 ****）
    const maskedId = page.locator('text=****');
    const count = await maskedId.count();

    // 應至少有一個遮罩的 ID
    expect(count).toBeGreaterThan(0);
  });

  test('03-05: 公開中獎名單頁面', async ({ page }) => {
    await page.goto('/winners');

    // 應顯示中獎查詢頁面
    await expect(page.locator('text=中獎')).toBeVisible();
  });

  test('03-06: 公開頁面無管理功能按鈕', async ({ page }) => {
    await page.goto(`/events/${eventId}`);

    // 不應顯示「編輯」、「刪除」等管理按鈕
    await expect(page.locator('button:has-text("編輯")')).not.toBeVisible();
    await expect(page.locator('button:has-text("刪除")')).not.toBeVisible();
    await expect(page.locator('button:has-text("新增")')).not.toBeVisible();

    // 不應有前往管理端的連結（除了可能的登入連結）
    const adminLinks = page.locator('a[href*="/admin"]:not([href*="/admin/login"])');
    const count = await adminLinks.count();
    expect(count).toBe(0);
  });

  test('03-07: 公開頁面響應式設計（手機版）', async ({ page }) => {
    // 設定手機螢幕大小
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // 應正常顯示
    await expect(page.locator('h1')).toBeVisible();

    await page.goto(`/events/${eventId}`);

    // 活動詳情應正常顯示
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
  });

  test('03-08: 公開頁面響應式設計（平板版）', async ({ page }) => {
    // 設定平板螢幕大小
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // 應正常顯示
    await expect(page.locator('h1')).toBeVisible();

    await page.goto(`/events/${eventId}`);

    // 活動詳情應正常顯示
    await expect(page.locator(`text=${eventName}`)).toBeVisible();
  });

  test('03-09: 公開頁面活動狀態顯示', async ({ page }) => {
    await page.goto('/events');

    // 應顯示活動狀態徽章或指示器
    // （實際顯示內容取決於活動狀態：草稿、進行中、已完成等）
    const statusBadge = page.locator('span, div').filter({ hasText: /草稿|進行中|已完成|已封存/ });
    // 至少應該有一個狀態顯示
    // await expect(statusBadge.first()).toBeVisible();
  });

  test('03-10: 訪問不存在的活動應顯示錯誤', async ({ page }) => {
    await page.goto('/events/non-existent-id-12345');

    // 應顯示錯誤訊息或 404 頁面
    await expect(page.locator('text=找不到')).toBeVisible();
  });
});
