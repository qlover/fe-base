import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { test, expect } from '../fixtures/base.fixture';

const createStartWithUrlRegex = (fullURL: string, locale: string) => {
  const url = locale ? `${fullURL}/${locale}` : fullURL;
  return new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
};

test.describe('App', () => {
  test('should render the app component', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test.describe('locale routes', () => {
    test('should handle locale routes correctly(useLocaleRoutes: true)', async ({
      page,
      fullURL
    }) => {
      test.skip(!useLocaleRoutes, 'Locale routes are disabled');

      // use default locale: i18nConfig.fallbackLng
      await page.goto('/');
      await expect(page).toHaveURL(
        createStartWithUrlRegex(fullURL, i18nConfig.fallbackLng)
      );

      // 访问所有支持的语言
      for (const locale of i18nConfig.supportedLngs) {
        await page.goto(`/${locale}`);
        await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, locale));
      }

      // 访问不存在的语言
      await page.goto(`/invalid`);
      // 应该跳转到默认语言
      await expect(page).toHaveURL(
        createStartWithUrlRegex(fullURL, i18nConfig.fallbackLng)
      );
    });

    test('should handle locale routes correctly(useLocaleRoutes: false)', async ({
      page,
      fullURL
    }) => {
      test.skip(useLocaleRoutes, 'Locale routes are enabled');

      await page.goto('/');
      await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, ''));

      // 访问不存在的语言, 或路由
      await page.goto('/en');
    });
  });
});
