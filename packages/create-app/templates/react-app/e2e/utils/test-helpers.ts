import type { Page } from '@playwright/test';

/**
 * Wait for application to be fully loaded
 */
export async function waitForAppReady(page: Page) {
  // Wait for the main app component to be visible
  await page.waitForSelector('[data-testid="App"]', { state: 'visible' });
  // Wait for any loading indicators to disappear
  await page.waitForLoadState('networkidle');
}

/**
 * Navigate to a specific locale path
 */
export async function navigateToLocalePath(
  page: Page,
  path: string,
  locale: string = 'zh'
) {
  const fullPath = path.startsWith('/') ? path : `/${path}`;
  await page.goto(`/${locale}${fullPath}`);
  await waitForAppReady(page);
}

/**
 * Switch language
 */
export async function switchLanguage(page: Page, locale: 'zh' | 'en') {
  // This depends on your language switcher implementation
  // Adjust the selector based on your actual implementation
  const languageSwitcher = page.locator('[data-testid="language-switcher"]');
  if (await languageSwitcher.isVisible()) {
    await languageSwitcher.click();
    await page.click(`[data-locale="${locale}"]`);
    await waitForAppReady(page);
  }
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(
  page: Page,
  name: string,
  fullPage: boolean = false
) {
  await page.screenshot({
    path: `e2e/screenshots/${name}.png`,
    fullPage
  });
}

/**
 * Check if element exists
 */
export async function elementExists(page: Page, selector: string) {
  try {
    await page.waitForSelector(selector, { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current route path
 */
export function getCurrentPath(page: Page): string {
  return new URL(page.url()).pathname;
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page, expectedPath?: string) {
  await page.waitForLoadState('networkidle');
  if (expectedPath) {
    await page.waitForURL((url) => url.pathname.includes(expectedPath));
  }
}
