import { test, expect } from '../fixtures/base.fixture';
import { waitForAppReady } from '../utils/test-helpers';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh');
    await waitForAppReady(page);
  });

  test('should navigate between pages', async ({ page }) => {
    // Navigate to About page
    const aboutLink = page.getByRole('link', { name: /about|关于/i });
    if (await aboutLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('about');
    }
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/zh/non-existent-page');
    await page.waitForLoadState('networkidle');

    // Check if 404 page is displayed
    const heading = page.locator('h1, h2').first();
    const text = await heading.textContent();
    expect(text).toMatch(/404|not found|未找到|页面不存在/i);
  });

  test('should redirect root to locale path', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Should redirect to a locale path (zh or en)
    expect(page.url()).toMatch(/\/(zh|en)/);
  });

  test('should maintain state during navigation', async ({ page }) => {
    // Get initial page title
    const initialTitle = await page.title();

    // Navigate to another page
    const links = page.locator('nav a');
    const linkCount = await links.count();

    if (linkCount > 0) {
      await links.first().click();
      await page.waitForLoadState('networkidle');

      // Navigate back
      await page.goBack();
      await page.waitForLoadState('networkidle');

      // Check if we're back to the initial page
      const currentTitle = await page.title();
      expect(currentTitle).toBe(initialTitle);
    }
  });

  test('should support browser forward/back navigation', async ({ page }) => {
    const initialUrl = page.url();

    // Navigate to multiple pages if possible
    const links = page.locator('nav a');
    const linkCount = await links.count();

    if (linkCount > 1) {
      // Click first link
      await links.first().click();
      await page.waitForLoadState('networkidle');
      const secondUrl = page.url();

      // Click second link
      await links.nth(1).click();
      await page.waitForLoadState('networkidle');
      page.url();

      // Go back
      await page.goBack();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(secondUrl);

      // Go back again
      await page.goBack();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(initialUrl);

      // Go forward
      await page.goForward();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toBe(secondUrl);
    }
  });
});
