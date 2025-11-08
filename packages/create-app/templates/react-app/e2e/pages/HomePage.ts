import { BasePage } from './BasePage';
import type { Locator } from '@playwright/test';

/**
 * HomePage Page Object Model
 */
export class HomePage extends BasePage {
  readonly mainContent: Locator;
  readonly navigationLinks: Locator;

  constructor(page: any) {
    super(page);
    this.mainContent = page.locator('main');
    this.navigationLinks = page.locator('nav a');
  }

  /**
   * Navigate to Home page
   */
  async navigate(locale: string = 'zh'): Promise<void> {
    await this.goto('/', locale);
    await this.waitForReady();
  }

  /**
   * Get all navigation links
   */
  async getNavigationLinks(): Promise<string[]> {
    return await this.navigationLinks.allTextContents();
  }

  /**
   * Click on a navigation link by text
   */
  async clickNavigationLink(linkText: string): Promise<void> {
    await this.navigationLinks.filter({ hasText: linkText }).click();
    await this.waitForReady();
  }

  /**
   * Check if home page is displayed
   */
  async isDisplayed(): Promise<boolean> {
    return await this.mainContent.isVisible();
  }
}
