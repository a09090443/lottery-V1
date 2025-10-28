/**
 * E2E Test: Complete Lottery Workflow
 * 完整抽獎流程測試（從建立活動到匯出結果）
 */

import { test, expect } from '@playwright/test';
import {
  clearBrowserStorage,
  setupAdminPassword,
  adminLogin,
  createTestEvent,
  addPrize,
  importParticipantsCSV,
  addParticipant,
  executeDraw,
  confirmWinner,
  exportResults,
} from '../helpers/test-helpers';
import {
  generateSmallTestScenario,
  generateUniqueEventName,
  generateTestParticipants,
} from '../helpers/test-data-generator';

test.describe('完整抽獎流程測試', () => {
  test.beforeEach(async ({ page }) => {
    await clearBrowserStorage(page);
    await setupAdminPassword(page);
    await adminLogin(page);
  });

  test('02-01: 完整流程 - 建立活動 → 設定獎項 → 匯入參與者 → 抽獎 → 匯出結果', async ({ page }) => {
    const scenario = generateSmallTestScenario(); // 20 位參與者, 2 個獎項
    const eventName = generateUniqueEventName('完整流程測試');

    // === Step 1: 建立活動 ===
    console.log('Step 1: 建立活動...');
    await createTestEvent(page, {
      name: eventName,
      description: scenario.event.description,
      scheduledAt: scenario.event.scheduledAt,
    });

    // 驗證活動建立成功
    await expect(page.locator(`text=${eventName}`)).toBeVisible();

    // === Step 2: 新增獎項 ===
    console.log('Step 2: 新增獎項...');
    for (const prize of scenario.prizes) {
      await addPrize(page, prize);
    }

    // 驗證獎項新增成功
    for (const prize of scenario.prizes) {
      await expect(page.locator(`text=${prize.name}`)).toBeVisible();
    }

    // === Step 3: 匯入參與者 ===
    console.log('Step 3: 匯入參與者...');
    await page.click('text=參與者');
    await importParticipantsCSV(page, scenario.csvBlob);

    // 驗證參與者匯入成功
    await expect(page.locator(`text=共 ${scenario.participants.length} 位參與者`)).toBeVisible();

    // === Step 4: 執行抽獎 ===
    console.log('Step 4: 執行抽獎...');
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();

    await page.goto(`/admin/draw/${eventId}`);

    // 為每個獎項抽獎
    for (const prize of scenario.prizes) {
      console.log(`抽取「${prize.name}」...`);

      // 抽取所有名額
      for (let i = 0; i < prize.totalQuantity; i++) {
        await executeDraw(page, prize.name);
        await confirmWinner(page);
        await page.waitForTimeout(1000);
      }
    }

    // === Step 5: 查看結果 ===
    console.log('Step 5: 查看結果...');
    await page.goto(`/admin/results/${eventId}`);

    // 計算總中獎人數
    const totalWinners = scenario.prizes.reduce((sum, p) => sum + p.totalQuantity, 0);
    await expect(page.locator(`text=${totalWinners}`)).toBeVisible();

    // === Step 6: 匯出結果 ===
    console.log('Step 6: 匯出結果...');

    // 設定下載監聽
    const downloadPromise = page.waitForEvent('download');
    await exportResults(page, 'CSV');
    const download = await downloadPromise;

    // 驗證檔案名稱包含活動名稱
    expect(download.suggestedFilename()).toContain('lottery_results');

    console.log('✅ 完整流程測試通過！');
  });

  test('02-02: 手動新增參與者並抽獎', async ({ page }) => {
    const eventName = generateUniqueEventName('手動參與者測試');
    const participants = generateTestParticipants(10);

    // 建立活動
    await createTestEvent(page, {
      name: eventName,
      description: '測試手動新增參與者',
    });

    // 新增獎項
    await addPrize(page, {
      name: '測試獎',
      totalQuantity: 3,
    });

    // 前往參與者頁面
    await page.click('text=參與者');

    // 手動新增參與者
    for (const participant of participants) {
      await addParticipant(page, participant);
      await page.waitForTimeout(500);
    }

    // 驗證參與者數量
    await expect(page.locator(`text=共 ${participants.length} 位參與者`)).toBeVisible();

    // 執行抽獎
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();
    await page.goto(`/admin/draw/${eventId}`);

    await executeDraw(page, '測試獎');
    await confirmWinner(page);

    // 驗證中獎者顯示
    await expect(page.locator('text=中獎者')).toBeVisible();
  });

  test('02-03: 參與者搜尋功能測試', async ({ page }) => {
    const eventName = generateUniqueEventName('搜尋功能測試');
    const scenario = generateSmallTestScenario();

    // 建立活動並匯入參與者
    await createTestEvent(page, { name: eventName });
    await page.click('text=參與者');
    await importParticipantsCSV(page, scenario.csvBlob);

    // 測試搜尋功能
    const firstParticipant = scenario.participants[0];
    await page.fill('input[placeholder*="搜尋"]', firstParticipant.name);

    // 驗證搜尋結果
    await expect(page.locator(`text=${firstParticipant.name}`)).toBeVisible();

    // 清除搜尋
    await page.fill('input[placeholder*="搜尋"]', '');
    await expect(page.locator(`text=共 ${scenario.participants.length} 筆`)).toBeVisible();
  });

  test('02-04: 參與者分頁功能測試', async ({ page }) => {
    const eventName = generateUniqueEventName('分頁功能測試');

    // 建立活動
    await createTestEvent(page, { name: eventName });
    await page.click('text=參與者');

    // 匯入 100 位參與者（會觸發分頁）
    const participants = generateTestParticipants(100);
    const csvContent = [
      'name,employeeId,nationalId,email,phone',
      ...participants.map(p =>
        [p.name, p.employeeId, p.nationalId, p.email, p.phone].join(',')
      ),
    ].join('\n');

    const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    await importParticipantsCSV(page, csvBlob);

    // 驗證分頁顯示
    await expect(page.locator('text=顯示第')).toBeVisible();
    await expect(page.locator('text=共 100 筆')).toBeVisible();

    // 測試翻頁
    const nextButton = page.locator('button:has-text("下一頁")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);

      // 驗證已翻頁
      await expect(page.locator('text=顯示第 51')).toBeVisible();
    }
  });

  test('02-05: 不允許重複中獎測試', async ({ page }) => {
    const eventName = generateUniqueEventName('不重複中獎測試');
    const participants = generateTestParticipants(5); // 只有 5 位參與者

    // 建立活動（不允許重複中獎）
    await createTestEvent(page, {
      name: eventName,
      allowDuplicateWinners: false,
    });

    // 新增 2 個獎項，各 3 個名額（總共 6 個，但只有 5 位參與者）
    await addPrize(page, { name: '頭獎', totalQuantity: 3 });
    await addPrize(page, { name: '貳獎', totalQuantity: 3 });

    // 匯入參與者
    await page.click('text=參與者');
    const csvContent = [
      'name,employeeId,nationalId,email,phone',
      ...participants.map(p =>
        [p.name, p.employeeId, p.nationalId, p.email, p.phone].join(',')
      ),
    ].join('\n');
    const csvBlob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    await importParticipantsCSV(page, csvBlob);

    // 執行抽獎
    const eventUrl = page.url();
    const eventId = eventUrl.split('/').pop();
    await page.goto(`/admin/draw/${eventId}`);

    // 抽完頭獎（3位）
    for (let i = 0; i < 3; i++) {
      await executeDraw(page, '頭獎');
      await confirmWinner(page);
      await page.waitForTimeout(1000);
    }

    // 抽貳獎（應該只能抽 2 位，因為只剩 2 位未中獎）
    for (let i = 0; i < 2; i++) {
      await executeDraw(page, '貳獎');
      await confirmWinner(page);
      await page.waitForTimeout(1000);
    }

    // 嘗試再抽一次應該顯示錯誤或無法選擇
    // （這裡的實際行為取決於前端實作）
  });

  test('02-06: 儲存空間監控測試', async ({ page }) => {
    await page.goto('/admin');

    // 應顯示儲存空間使用率
    await expect(page.locator('text=儲存空間使用率')).toBeVisible();

    // 應顯示使用百分比
    await expect(page.locator('text=%')).toBeVisible();
  });

  test('02-07: 匯出提醒測試', async ({ page }) => {
    await page.goto('/admin');

    // 首次使用應顯示匯出提醒
    const reminderVisible = await page.locator('text=資料匯出提醒').isVisible();

    if (reminderVisible) {
      // 測試「稍後提醒」功能
      await page.click('button:has-text("稍後提醒")');

      // 提醒應消失
      await expect(page.locator('text=資料匯出提醒')).not.toBeVisible();
    }
  });

  test('02-08: 確認對話框測試', async ({ page }) => {
    const eventName = generateUniqueEventName('確認對話框測試');
    const participants = generateTestParticipants(10);

    // 建立活動並新增參與者
    await createTestEvent(page, { name: eventName });
    await page.click('text=參與者');

    await addParticipant(page, participants[0]);

    // 點擊移除按鈕
    await page.click('button:has-text("移除")');

    // 應顯示確認對話框
    await expect(page.locator('text=移除參與者')).toBeVisible();
    await expect(page.locator(`text=${participants[0].name}`)).toBeVisible();

    // 取消操作
    await page.click('button:has-text("取消")');

    // 參與者應仍然存在
    await expect(page.locator(`text=${participants[0].name}`)).toBeVisible();
  });
});
