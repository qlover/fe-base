import { test, expect } from '../fixtures/base.fixture';
import { HomePage } from '../pages/HomePage';

test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigate('zh');
  });

  test('should load and display home page', async () => {
    // Check if the main content is visible
    await expect(homePage.mainContent).toBeVisible();

    // Check if the page title contains expected text
    const title = await homePage.getTitle();
    expect(title).toBeTruthy();
  });

  test('should have navigation menu', async () => {
    // Check if navigation links exist
    const links = await homePage.getNavigationLinks();
    expect(links.length).toBeGreaterThan(0);
  });

  test('should navigate to different pages', async ({ page }) => {
    // Try to navigate to About page if link exists
    const aboutLink = page.getByRole('link', { name: /about|关于/i });
    if (await aboutLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');
      expect(page.url()).toContain('about');
    }
  });

  test('should display in Chinese by default', async ({ page }) => {
    // Check if page URL contains 'zh' locale
    expect(page.url()).toContain('/zh');
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(homePage.mainContent).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(homePage.mainContent).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(homePage.mainContent).toBeVisible();
  });
});
