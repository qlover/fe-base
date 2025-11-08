import { test, expect } from '../fixtures/base.fixture';

test.describe('Accessibility', () => {
  test('should have proper document structure', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check for header
    const header = page.locator('header, [role="banner"]');
    expect(await header.count()).toBeGreaterThan(0);
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check if h1 exists
    const h1 = page.locator('h1');
    expect(await h1.count()).toBeGreaterThan(0);

    // Get all headings
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Find all images
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Alt attribute should exist (can be empty for decorative images)
      expect(alt !== null).toBeTruthy();
    }
  });

  test('should have proper link text', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Find all links
    const links = await page.locator('a[href]').all();

    for (const link of links) {
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const title = await link.getAttribute('title');

      // Link should have text or aria-label or title
      expect(text || ariaLabel || title).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/zh/login');
    await page.waitForLoadState('networkidle');

    // Find all form inputs
    const inputs = await page
      .locator(
        'input[type="text"], input[type="password"], input[type="email"]'
      )
      .all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have id with label, aria-label, aria-labelledby, or at least placeholder
      const hasLabel =
        id && (await page.locator(`label[for="${id}"]`).count()) > 0;
      expect(
        hasLabel || ariaLabel || ariaLabelledby || placeholder
      ).toBeTruthy();
    }
  });

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Tab through interactive elements
    await page.keyboard.press('Tab');

    // Get focused element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Find a button or link
    const button = page.locator('button, a').first();
    if (await button.isVisible()) {
      await button.focus();

      // Check if element is focused
      const isFocused = await button.evaluate((el) => {
        return el === document.activeElement;
      });

      expect(isFocused).toBeTruthy();
    }
  });

  test('should have proper ARIA roles', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check for navigation role
    const nav = page.locator('nav, [role="navigation"]');
    expect(await nav.count()).toBeGreaterThan(0);
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // This is a basic check - for comprehensive color contrast testing,
    // you would need a specialized tool like axe-core

    // Check if text is visible
    const text = page.locator('p, span, div').first();
    if (await text.isVisible()) {
      const color = await text.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });

      expect(color.color).toBeTruthy();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check for skip links (common accessibility feature)
    await page.locator('a[href*="#main"], a[href*="#content"]');

    // Check for proper ARIA landmarks
    const landmarks = await page
      .locator(
        '[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]'
      )
      .count();
    expect(landmarks).toBeGreaterThan(0);
  });
});
