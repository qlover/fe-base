import { test, expect } from '../fixtures/base.fixture';

test.describe('Performance', () => {
  test('should load home page within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have acceptable First Contentful Paint', async ({ page }) => {
    await page.goto('/zh');

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        fcp: perfData.responseEnd - perfData.fetchStart,
        domContentLoaded:
          perfData.domContentLoadedEventEnd - perfData.fetchStart,
        loadComplete: perfData.loadEventEnd - perfData.fetchStart
      };
    });

    // FCP should be less than 3 seconds
    expect(metrics.fcp).toBeLessThan(3000);
  });

  test('should not have excessive bundle size', async ({ page }) => {
    const resources: { url: string; size: number }[] = [];

    // Listen to response events
    page.on('response', async (response) => {
      if (response.url().endsWith('.js') || response.url().endsWith('.css')) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          resources.push({
            url: response.url(),
            size: buffer.length
          });
        }
      }
    });

    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Calculate total bundle size
    const totalSize = resources.reduce(
      (sum, resource) => sum + resource.size,
      0
    );

    // Total initial bundle should be less than 1MB (adjust as needed)
    expect(totalSize).toBeLessThan(1024 * 1024);
  });

  test('should lazy load routes', async ({ page }) => {
    const loadedScripts = new Set<string>();

    page.on('response', async (response) => {
      if (response.url().endsWith('.js')) {
        loadedScripts.add(response.url());
      }
    });

    // Load home page
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');
    const homeScripts = new Set(loadedScripts);

    // Navigate to another page
    const aboutLink = page.getByRole('link', { name: /about|关于/i });
    if (await aboutLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await aboutLink.click();
      await page.waitForLoadState('networkidle');

      // Check if new scripts were loaded (indicating code splitting)
      const newScripts = Array.from(loadedScripts).filter(
        (script) => !homeScripts.has(script)
      );

      // Some new scripts should be loaded for the new route
      expect(newScripts.length).toBeGreaterThan(0);
    }
  });

  test('should not have memory leaks on navigation', async ({ page }) => {
    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Get initial memory
    const initialMetrics = await page.metrics();
    const initialHeap = initialMetrics.JSHeapUsedSize;

    // Navigate between pages multiple times
    for (let i = 0; i < 5; i++) {
      const links = page.locator('nav a');
      const count = await links.count();
      if (count > 0) {
        await links.nth(i % count).click();
        await page.waitForLoadState('networkidle');
      }
    }

    // Force garbage collection if possible
    await page.evaluate(() => {
      if (global.gc) {
        global.gc();
      }
    });

    // Get final memory
    const finalMetrics = await page.metrics();
    const finalHeap = finalMetrics.JSHeapUsedSize;

    // Memory shouldn't grow more than 50MB after multiple navigations
    const memoryGrowth = finalHeap - initialHeap;
    expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
  });

  test('should optimize images', async ({ page }) => {
    const images: { url: string; size: number }[] = [];

    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i) &&
        !url.includes('data:')
      ) {
        const buffer = await response.body().catch(() => null);
        if (buffer) {
          images.push({
            url,
            size: buffer.length
          });
        }
      }
    });

    await page.goto('/zh');
    await page.waitForLoadState('networkidle');

    // Check if images are reasonably sized
    for (const image of images) {
      // Individual images shouldn't exceed 500KB
      expect(image.size).toBeLessThan(500 * 1024);
    }
  });

  test('should have acceptable Time to Interactive', async ({ page }) => {
    await page.goto('/zh');

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle');

    // Get performance timing
    const timing = await page.evaluate(() => {
      const perfData = window.performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;
      return {
        tti: perfData.domInteractive - perfData.fetchStart
      };
    });

    // Time to Interactive should be less than 4 seconds
    expect(timing.tti).toBeLessThan(4000);
  });

  test('should prefetch/preload critical resources', async ({ page }) => {
    await page.goto('/zh');

    // Check for preload/prefetch links
    const preloadLinks = await page
      .locator('link[rel="preload"], link[rel="prefetch"]')
      .count();

    // At least some resources should be preloaded
    expect(preloadLinks).toBeGreaterThan(0);
  });
});
