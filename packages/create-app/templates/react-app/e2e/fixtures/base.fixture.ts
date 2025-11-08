import { test as base } from '@playwright/test';

/**
 * Custom test fixture that can be extended with additional functionality
 * For example: authentication, mock data, custom page objects, etc.
 */
export const test = base.extend({
  // You can add custom fixtures here
  // Example:
  // authenticatedPage: async ({ page }, use) => {
  //   await page.goto('/login');
  //   await page.fill('input[name="username"]', 'testuser');
  //   await page.fill('input[name="password"]', 'password123');
  //   await page.click('button[type="submit"]');
  //   await use(page);
  // },
});

export { expect } from '@playwright/test';
