import { test, expect } from './fixtures/base.fixture';

test.describe('Main', () => {
  test('should render the main component', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should render the main component with bootstrap loading', async ({
    page
  }) => {
    await page.goto('/');

    await page.waitForSelector('[data-testid="Loading"]', { state: 'visible' });
    await expect(page.locator('#root')).toBeVisible();
    await page.waitForSelector('[data-testid="Loading"]', { state: 'hidden' });

    await expect(page.locator('#root')).toBeVisible();
  });
});
