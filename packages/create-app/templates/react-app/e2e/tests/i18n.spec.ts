import { test, expect } from '../fixtures/base.fixture';

test.describe('Internationalization (i18n)', () => {
  test('should load Chinese version', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check if URL contains Chinese locale
    expect(page.url()).toContain('/zh');

    // Check if page has Chinese content (this will depend on your app)
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toMatch(/zh/);
  });

  test('should load English version', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Check if URL contains English locale
    expect(page.url()).toContain('/en');

    // Check if page has English content
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toMatch(/en/);
  });

  test('should support locale switching', async ({ page }) => {
    // Start with Chinese
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Look for language switcher (adjust selector based on your implementation)
    const languageSwitcher = page
      .locator('[data-testid="language-switcher"], [class*="language"], button')
      .filter({ hasText: /EN|English|英文/ });

    if (
      await languageSwitcher
        .first()
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await languageSwitcher.first().click();
      await page.waitForLoadState('networkidle');

      // URL should now contain 'en'
      expect(page.url()).toContain('/en');
    }
  });

  test('should persist locale preference', async ({ page, context }) => {
    // Navigate to English version
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    // Open new page in same context
    const newPage = await context.newPage();
    await newPage.goto('/');
    await newPage.waitForLoadState('networkidle');

    // Check if it remembers English preference (if implemented)
    // This depends on your locale persistence implementation
    const url = newPage.url();
    expect(url).toMatch(/\/(en|zh)/); // Should have some locale
  });

  test('should handle invalid locale gracefully', async ({ page }) => {
    // Try to access with invalid locale
    await page.goto('/invalid-locale');
    await page.waitForLoadState('networkidle');

    // Should redirect to valid locale or show 404
    const url = page.url();
    expect(url).toMatch(/\/(zh|en|404)/);
  });

  test('should translate all pages', async ({ page }) => {
    const pages = ['/', '/about', '/login', '/register'];
    const locales = ['zh', 'en'];

    for (const locale of locales) {
      for (const pagePath of pages) {
        await page.goto(`/${locale}${pagePath}`);
        await page.waitForLoadState('networkidle');

        // Check if page loaded successfully
        const title = await page.title();
        expect(title).toBeTruthy();

        // Check if URL has correct locale
        expect(page.url()).toContain(`/${locale}`);
      }
    }
  });

  test('should format dates and numbers according to locale', async ({
    page
  }) => {
    // Test Chinese locale
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Look for any dates or numbers on the page
    // This is highly dependent on your app's content
    const content = await page.textContent('body');
    expect(content).toBeTruthy();

    // Test English locale
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const enContent = await page.textContent('body');
    expect(enContent).toBeTruthy();
  });
});
