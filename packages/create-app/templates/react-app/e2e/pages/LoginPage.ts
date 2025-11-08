import { BasePage } from './BasePage';
import type { Locator } from '@playwright/test';

/**
 * LoginPage Page Object Model
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly registerLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: any) {
    super(page);
    // Adjust selectors based on your actual login form
    this.usernameInput = page
      .locator('input[name="username"], input[type="text"]')
      .first();
    this.passwordInput = page
      .locator('input[name="password"], input[type="password"]')
      .first();
    this.loginButton = page.locator('button[type="submit"]').first();
    this.registerLink = page.getByRole('link', { name: /注册|register/i });
    this.errorMessage = page.locator('[class*="error"], [role="alert"]');
  }

  /**
   * Navigate to Login page
   */
  async navigate(locale: string = 'zh'): Promise<void> {
    await this.goto('/login', locale);
    await this.waitForReady();
  }

  /**
   * Perform login
   */
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click register link
   */
  async goToRegister(): Promise<void> {
    await this.registerLink.click();
    await this.waitForReady();
  }

  /**
   * Get error message
   */
  async getErrorMessage(): Promise<string> {
    if (await this.errorMessage.isVisible()) {
      return (await this.errorMessage.textContent()) || '';
    }
    return '';
  }

  /**
   * Check if login form is displayed
   */
  async isDisplayed(): Promise<boolean> {
    return (
      (await this.usernameInput.isVisible()) &&
      (await this.passwordInput.isVisible()) &&
      (await this.loginButton.isVisible())
    );
  }
}
