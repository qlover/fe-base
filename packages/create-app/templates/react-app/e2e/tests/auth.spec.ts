import { test, expect } from '../fixtures/base.fixture';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigate('zh');
  });

  test('should display login form', async () => {
    const isDisplayed = await loginPage.isDisplayed();
    expect(isDisplayed).toBeTruthy();
  });

  test('should have username and password fields', async () => {
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    // Check if register link exists
    if (
      await loginPage.registerLink
        .isVisible({ timeout: 5000 })
        .catch(() => false)
    ) {
      await loginPage.goToRegister();
      expect(page.url()).toContain('register');
    }
  });

  test('should show validation for empty fields', async ({ page }) => {
    // Try to submit empty form
    await loginPage.loginButton.click();

    // Wait a bit for validation
    await page.waitForTimeout(1000);

    // Check for validation messages (browser native or custom)
    // This will depend on your form validation implementation
    const usernameValidation = await loginPage.usernameInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    );
    expect(usernameValidation).toBeTruthy();
  });

  test('should handle login form submission', async ({ page }) => {
    // Fill in test credentials
    await loginPage.login('testuser', 'testpassword');

    // Wait for response
    await page.waitForTimeout(1000);

    // Either error message or navigation should occur
    const errorMsg = await loginPage.getErrorMessage();
    const currentUrl = page.url();

    // If error exists, we stayed on login page
    // If no error, we might have navigated away
    expect(errorMsg || !currentUrl.includes('login')).toBeTruthy();
  });

  test('should support keyboard navigation', async ({ page }) => {
    // Focus username field
    await loginPage.usernameInput.focus();
    await page.keyboard.type('testuser');

    // Tab to password field
    await page.keyboard.press('Tab');
    await page.keyboard.type('testpassword');

    // Tab to submit button and press Enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    await page.waitForTimeout(1000);

    // Form should have been submitted
    const errorMsg = await loginPage.getErrorMessage();
    const currentUrl = page.url();
    expect(errorMsg || !currentUrl.includes('login')).toBeTruthy();
  });

  test('should mask password input', async () => {
    const passwordType = await loginPage.passwordInput.getAttribute('type');
    expect(passwordType).toBe('password');
  });

  test('should work in different languages', async () => {
    // Test in English
    await loginPage.navigate('en');
    await expect(loginPage.loginButton).toBeVisible();

    // Test in Chinese
    await loginPage.navigate('zh');
    await expect(loginPage.loginButton).toBeVisible();
  });
});
