import { ThemeProvider } from '@wrksz/themes';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/pages.css';
import { ClientRootProvider } from '@/uikit/components/ClientRootProvider';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import type { PagesRouterProps } from '@interfaces/PagesRouter';

/**
 * Pages Router app shell for logged-in CSR consoles (admin/*, developer/*).
 *
 * Entry auth is middleware (LOGINED_PAGES); this shell only provides IOC,
 * i18n, theme, and client bootstrap.
 *
 * Use `ThemeProvider` from `@wrksz/themes` (not `/client`) so the anti-FOUC
 * inline script runs before paint — App→Pages navigations otherwise flash
 * default theme then restore `fe_theme` from storage.
 */
export default function App({
  Component,
  pageProps,
  router
}: PagesRouterProps) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;

  return (
    <IOCProvider>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ThemeProvider
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
        </ThemeProvider>
      </NextIntlClientProvider>
    </IOCProvider>
  );
}
