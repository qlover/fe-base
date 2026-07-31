import { ClientThemeProvider } from '@wrksz/themes/client';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/tailwind-pages.css';
import '@/styles/pages.css';
import { ClientRootProvider } from '@/uikit/components/ClientRootProvider';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import type { PagesRouterProps } from '@interfaces/PagesRouter';

/**
 * Pages Router app shell for logged-in CSR consoles (admin/*).
 *
 * Entry auth is middleware (LOGINED_PAGES); this shell only provides IOC,
 * i18n, theme, and client bootstrap.
 *
 * Use `ClientThemeProvider` (no React-tree theme script). `@wrksz/themes`
 * `ThemeProvider` embeds `themeScript.toString()`, which often mismatches
 * between SSR and client bundles. Anti-FOUC is handled by `_document` via
 * {@link getPagesThemeInitScript}.
 */
export default function App({
  Component,
  pageProps,
  router
}: PagesRouterProps) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;

  return (
    <IOCProvider>
      <NextIntlClientProvider
        locale={locale}
        messages={pageProps.messages}
        timeZone={i18nConfig.timeZone}
      >
        <ClientThemeProvider
          themes={themeConfig.supportedThemes as unknown as string[]}
          attribute={themeConfig.domAttribute}
          defaultTheme={themeConfig.defaultTheme}
          enableSystem={themeConfig.enableSystem}
          enableColorScheme={false}
          storageKey={themeConfig.storageKey}
          disableTransitionOnChange
        >
          <ClientRootProvider>
            <Component {...pageProps} />
          </ClientRootProvider>
        </ClientThemeProvider>
      </NextIntlClientProvider>
    </IOCProvider>
  );
}
