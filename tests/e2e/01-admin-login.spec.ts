/**
 * E2E Test: Admin Login
 * 管理員登入功能測試
 */

import { test, expect } from '@playwright/test';
import { clearBrowserStorage, setupAdminPassword, adminLogin, adminLogout } from '../helpers/test-helpers';
import { TEST_ADMIN_PASSWORD } from '../helpers/test-data-generator';

test.describe('管理員登入功能', () => {
  test.beforeEach(async ({ page }) => {
    // 每個測試前清除儲存
    await clearBrowserStorage(page);
  });

  test('01-01: 首次訪問應顯示密碼設定頁面', async ({ page }) => {
    await page.goto('/admin/login');

    // 應顯示設定密碼標題
    await expect(page.locator('text=首次設定密碼')).toBeVisible();

    // 應有兩個密碼輸入框
    await expect(page.locator('input[type="password"]#password')).toBeVisible();
    await expect(page.locator('input[type="password"]#confirmPassword')).toBeVisible();

    // 應有安全提示
    await expect(page.locator('text=⚠️ 安全提示：')).toBeVisible();
  });

  test('01-02: 設定管理員密碼（密碼太短應失敗）', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[type="password"]#password', '1234');
    await page.fill('input[type="password"]#confirmPassword', '1234');
    await page.click('button[type="submit"]');

    // 應顯示錯誤訊息
    await expect(page.locator('text=密碼長度至少需要 8 字元')).toBeVisible();
  });

  test('01-03: 設定管理員密碼（密碼不一致應失敗）', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[type="password"]#password', TEST_ADMIN_PASSWORD);
    await page.fill('input[type="password"]#confirmPassword', 'DifferentPass123');
    await page.click('button[type="submit"]');

    // 應顯示錯誤訊息
    await expect(page.locator('text=兩次輸入的密碼不一致')).toBeVisible();
  });

  test('01-04: 成功設定管理員密碼', async ({ page }) => {
    await page.goto('/admin/login');

    await page.fill('input[type="password"]#password', TEST_ADMIN_PASSWORD);
    await page.fill('input[type="password"]#confirmPassword', TEST_ADMIN_PASSWORD);
    await page.click('button[type="submit"]');

    // 應跳轉回登入頁面
    await expect(page.locator('text=管理員登入')).toBeVisible();
    await expect(page.locator('input[type="password"]#password')).toBeVisible();
  });

  test('01-05: 使用正確密碼登入', async ({ page }) => {
    // 先設定密碼
    await setupAdminPassword(page);

    // 登入
    await adminLogin(page);

    // 應跳轉到管理儀表板
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('text=管理儀表板')).toBeVisible();
  });

  test('01-06: 使用錯誤密碼登入應失敗', async ({ page }) => {
    // 先設定密碼
    await setupAdminPassword(page);

    // 使用錯誤密碼
    await page.goto('/admin/login');
    await page.fill('input[type="password"]#password', 'WrongPassword123');
    await page.click('button[type="submit"]:has-text("登入")');

    // 應顯示錯誤訊息
    await expect(page.locator('text=密碼錯誤')).toBeVisible();

    // 應仍在登入頁面
    await expect(page).toHaveURL('/admin/login');
  });

  test('01-07: 登入速率限制（5次失敗後鎖定）', async ({ page }) => {
    // 先設定密碼
    await setupAdminPassword(page);

    await page.goto('/admin/login');

    // 嘗試 5 次錯誤登入
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="password"]#password', 'WrongPassword123');
      await page.click('button[type="submit"]:has-text("登入")');
      await page.waitForTimeout(500);
    }

    // 應顯示鎖定訊息
    await expect(page.locator('text=帳號已被鎖定')).toBeVisible();
    await expect(page.locator('text=5 分鐘')).toBeVisible();

    // 登入按鈕應被禁用
    const loginButton = page.locator('button[type="submit"]:has-text("帳號已鎖定")');
    await expect(loginButton).toBeDisabled();
  });

  test('01-08: 登入後可以登出', async ({ page }) => {
    // 先設定密碼並登入
    await setupAdminPassword(page);
    await adminLogin(page);

    // 登出
    await adminLogout(page);

    // 應跳轉回登入頁面
    await expect(page).toHaveURL('/admin/login');
    await expect(page.locator('text=管理員登入')).toBeVisible();
  });

  test('01-09: 未登入時訪問管理頁面應重定向到登入頁', async ({ page }) => {
    await setupAdminPassword(page);

    // 嘗試直接訪問管理頁面
    await page.goto('/admin/events');

    // 應被重定向到登入頁面
    await expect(page).toHaveURL('/admin/login');
  });

  test('01-10: Session 逾時測試（模擬）', async ({ page }) => {
    await setupAdminPassword(page);
    await adminLogin(page);

    // 模擬 session 過期（修改 localStorage）
    await page.evaluate(() => {
      const sessionStr = sessionStorage.getItem('lottery_admin_session');
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        // 將最後活動時間設為 31 分鐘前
        const oldTime = new Date(Date.now() - 31 * 60 * 1000).toISOString();
        session.lastActivityAt = oldTime;
        sessionStorage.setItem('lottery_admin_session', JSON.stringify(session));
      }
    });

    // 重新載入頁面
    await page.reload();

    // 應被重定向到登入頁面
    await expect(page).toHaveURL('/admin/login');
  });

  test('01-11: 登入頁面顯示安全提示', async ({ page }) => {
    await setupAdminPassword(page);
    await page.goto('/admin/login');

    // 應顯示安全提示
    await expect(page.locator('text=🔒 安全提示：')).toBeVisible();
    await expect(page.locator('text=密碼錯誤 5 次後將鎖定帳號 5 分鐘')).toBeVisible();
    await expect(page.locator('text=使用完畢後請關閉瀏覽器視窗')).toBeVisible();
  });

  test('01-12: Loading 狀態顯示', async ({ page }) => {
    await setupAdminPassword(page);
    await page.goto('/admin/login');

    // 填寫正確密碼
    await page.fill('input[type="password"]#password', TEST_ADMIN_PASSWORD);

    // 點擊登入並立即檢查 loading 狀態
    const loginButton = page.locator('button[type="submit"]:has-text("登入")');
    await loginButton.click();

    // 應顯示 loading 狀態（可能很快消失）
    // 這裡我們檢查按鈕是否變為禁用狀態
    await expect(loginButton).toBeDisabled();
  });
});
