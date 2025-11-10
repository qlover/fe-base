import { baseNoLocaleRoutes } from '@config/app.router';
import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n/i18nConfig';
import { themeConfig } from '@config/theme';
import { test, expect } from './fixtures/base.fixture';
import {
  createStartWithUrlRegex,
  localeRoutesEach
} from './utils/test-helpers';
import type { Page } from '@playwright/test';

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
      await page.goto(`/ena`);

      // 应该跳转到默认语言
      if (i18nConfig.noValidRedirectFallbackLng) {
        await expect(page).toHaveURL(
          createStartWithUrlRegex(fullURL, i18nConfig.fallbackLng)
        );
      } else {
        await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, '404'));
      }
    });

    test('should handle locale routes correctly(useLocaleRoutes: false)', async ({
      page,
      fullURL
    }) => {
      test.skip(useLocaleRoutes, 'Locale routes are enabled');

      await page.goto('/');
      await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, ''));

      // 访问不存在的语言, 或路由
      await page.goto('/en'); //=> /router-prefix/en/login -> 404
      await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, '404'));
      await expect(page.getByTestId('NotFound')).toBeVisible();
    });

    test('should render the client routes correctly(LanguageSwitcher.tsx)', async ({
      page,
      fullURL
    }) => {
      const testLocale = async (locale: string, targetLocale: string) => {
        await page.goto(`/${locale}`);
        const languageSwitcher = page.getByTestId('LanguageSwitcher');
        await expect(languageSwitcher).toBeVisible();
        await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, locale));
        await expect(languageSwitcher).toHaveAttribute(
          'data-testvalue',
          locale
        );

        // switch to targetLocale
        await page.getByTestId('LanguageSwitcher').click();
        const languageSwitcherSelect = page.getByTestId(
          'LanguageSwitcherSelect'
        );
        await expect(languageSwitcherSelect).toBeVisible();

        const targetOption = page.getByTestId(
          `LanguageSwitcherOption-${targetLocale}`
        );
        await expect(targetOption).toBeVisible();
        await targetOption.click();

        await expect(page).toHaveURL(
          createStartWithUrlRegex(fullURL, targetLocale)
        );
      };

      const options = [
        { locale: 'zh', targetLocale: 'en' },
        { locale: 'en', targetLocale: 'zh' }
      ];

      for (const option of options) {
        await testLocale(option.locale, option.targetLocale);
      }
    });
  });

  test.describe('theme tests', () => {
    test('should handle theme routes correctly(default theme)', async ({
      page
    }) => {
      await page.goto('/');

      const systemTheme = 'light';
      await expect(
        page.locator(`html[data-theme="${systemTheme}"]`)
      ).toBeVisible();

      const switchTheme = async (theme: string, targetTheme: string) => {
        const themeSwitcher = page.getByTestId('ThemeSwitcher');
        await expect(themeSwitcher).toBeVisible();
        await expect(themeSwitcher).toHaveAttribute('data-testvalue', theme);
        await themeSwitcher.click();

        const themeSwitcherSelect = page.getByTestId('ThemeSwitcherSelect');
        await expect(themeSwitcherSelect).toBeVisible();
        const themeOption = page
          .getByTestId(`ThemeSwitcherOption-${targetTheme}`)
          .first();

        await expect(themeOption).toBeVisible();
        await themeOption.click();

        await expect(
          page.locator(`html[data-theme="${targetTheme}"]`)
        ).toBeVisible();
      };

      for (let i = 0; i < themeConfig.supportedThemes.length; i++) {
        const theme = themeConfig.supportedThemes[i];
        const targetTheme =
          themeConfig.supportedThemes[i + 1] || themeConfig.supportedThemes[0];
        await switchTheme(theme, targetTheme);
      }
    });

    test('should use the real browser default theme(dark mode)', async ({
      page
    }) => {
      // 验证系统检测到暗色模式
      const systemTheme = 'dark';
      // 在测试开始前设置浏览器为暗色模式
      await page.emulateMedia({ colorScheme: systemTheme });

      await page.goto('/');

      await expect(
        page.locator(`html[data-theme="${systemTheme}"]`)
      ).toBeVisible();
    });

    test('should correctly cache the last theme', async ({ page }) => {
      const systemTheme = 'dark';
      await page.emulateMedia({ colorScheme: systemTheme });

      await page.goto('/');
      await expect(
        page.locator(`html[data-theme="${systemTheme}"]`)
      ).toBeVisible();

      const switchTheme = async (theme: string, targetTheme: string) => {
        const themeSwitcher = page.getByTestId('ThemeSwitcher');
        await expect(themeSwitcher).toBeVisible();
        await expect(themeSwitcher).toHaveAttribute('data-testvalue', theme);
        await themeSwitcher.click();

        const themeSwitcherSelect = page.getByTestId('ThemeSwitcherSelect');
        await expect(themeSwitcherSelect).toBeVisible();
        const themeOption = page
          .getByTestId(`ThemeSwitcherOption-${targetTheme}`)
          .first();

        await expect(themeOption).toBeVisible();
        await themeOption.click();

        await expect(
          page.locator(`html[data-theme="${targetTheme}"]`)
        ).toBeVisible();
      };

      const testCachedTheme = async (cachedTheme: string) => {
        await switchTheme(systemTheme, cachedTheme);
        await page.reload();
        await expect(
          page.locator(`html[data-theme="${cachedTheme}"]`)
        ).toBeVisible();
      };

      await testCachedTheme('pink');
    });
  });

  test.describe('App bootstrap flow', () => {
    async function testLogin(page: Page, fullURL: string, locale: string) {
      await expect(page.getByTestId('LoginPage')).toBeVisible();

      // 重定向到登录页
      expect(page.url()).toContain('/login');

      // 等待登录成功
      const loginButton = page.getByTestId('LoginButton');
      await expect(loginButton).toBeVisible();
      await loginButton.click();

      // 等待登录 loading 出现
      await loginButton
        .locator('span.ant-btn-loading-icon')
        .waitFor({ state: 'visible' });

      // 关键：等待登录 loading 消失（表示登录完成）
      await loginButton
        .locator('span.ant-btn-loading-icon')
        .waitFor({ state: 'hidden' });

      // 等待 LoginPage 消失
      await expect(page.getByTestId('LoginPage')).toBeHidden();

      // 等待重定向到首页
      await expect(page).toHaveURL(createStartWithUrlRegex(fullURL, locale));

      // 等待首页显示
      await expect(page.getByTestId('HomePage')).toBeVisible();
    }

    test('should correctly handle the case of not logged in', async ({
      page
    }) => {
      await page.goto('/');
      await expect(page.locator('#root')).toBeVisible();
      await expect(page.getByTestId('LoginPage')).toBeVisible();

      // 访问首页和其他登录后才能访问的页面
      await page.goto('/about');
      await expect(page.getByTestId('AboutPage')).toBeHidden();
      await expect(page.getByTestId('LoginPage')).toBeVisible();

      // 重定向到登录页
      expect(page.url()).toContain('/login');
    });

    test('should correctly handle the login flow', async ({
      page,
      fullURL
    }) => {
      const testLoginFlow = async (locale: string) => {
        await page.goto(`/${locale}`);
        await expect(page.locator('#root')).toBeVisible();

        await testLogin(page, fullURL, locale);

        // 退出
        const logoutButton = page.getByTestId('LogoutButton');
        await expect(logoutButton).toBeVisible();
        await logoutButton.click();

        const logoutOkButton = page.getByTestId('LogoutButton-OkButton');
        await expect(logoutOkButton).toBeVisible();
        await logoutOkButton.click();

        await expect(page.getByTestId('LoginPage')).toBeVisible();
      };

      for (const locale of i18nConfig.supportedLngs) {
        await testLoginFlow(locale);
      }
    });

    test('should correctly visit all pages after login', async ({
      page,
      fullURL
    }) => {
      await page.goto('/');

      await testLogin(page, fullURL, i18nConfig.fallbackLng);

      // 1. 先提取 base/Layout 下的所有子路由
      const baseLayoutRoute = baseNoLocaleRoutes.find(
        (route) => route.element === 'base/Layout'
      );

      if (!baseLayoutRoute || !baseLayoutRoute.children) {
        throw new Error('base/Layout route or its children not found');
      }

      // 2. 过滤并构建所有需要访问的页面信息
      const pagesToVisit = baseLayoutRoute.children
        .filter(
          (child) => child.path !== '*' && child.element && child.index !== true
        )
        .map((child) => {
          return {
            visitPath: child.index ? '/' : `/${child.path}`,
            pageName: child.element.split('/').pop()
          };
        });

      await localeRoutesEach(async (route) => {
        // 3. 访问所有页面
        for (const pageInfo of pagesToVisit) {
          const path = route + pageInfo.visitPath;
          await page.goto(path);

          // 验证页面可见
          await expect(page.getByTestId(pageInfo.pageName)).toBeVisible();
        }
      });
    });
  });
});
