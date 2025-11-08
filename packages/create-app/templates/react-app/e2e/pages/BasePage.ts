import type { Page, Locator } from '@playwright/test';

/**
 * Base Page Object Model
 * Contains common elements and methods shared across all pages
 */
export class BasePage {
  readonly page: Page;
  readonly header: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.footer = page.locator('footer');
  }

  /**
   * Navigate to a specific path with locale
   */
  async goto(path: string, locale: string = 'zh'): Promise<void> {
    const fullPath = path.startsWith('/') ? path : `/${path}`;
    await this.page.goto(`/${locale}${fullPath}`);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Wait for page to be ready
   */
  async waitForReady(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForSelector('[data-testid="App"]', {
      state: 'visible'
    });
  }

  /**
   * Take screenshot
   */
  async screenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}.png`,
      fullPage: true
    });
  }

  /**
   * Check if on expected path
   */
  isOnPath(expectedPath: string): boolean {
    const currentPath = new URL(this.page.url()).pathname;
    return currentPath.includes(expectedPath);
  }
}
