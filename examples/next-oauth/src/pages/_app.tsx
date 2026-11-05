import { ClientThemeProvider } from '@wrksz/themes/client';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/pages.css';
import { ClientRootProvider } from '@/uikit/components/ClientRootProvider';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { AdminPanelLoading } from '@/uikit/components-pages/AdminPanelLoading';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import type { PagesRouterProps } from '@interfaces/PagesRouter';

const AdminPagesAppShell = dynamic(
  () =>
    import('@/uikit/components-pages/AdminPagesAppShell').then(
      (mod) => mod.AdminPagesAppShell
    ),
  {
    ssr: false,
    loading: () => (
      <AdminPanelLoading
        testId="AdminPagesAppShellBoot"
        className="min-h-screen bg-primary"
      />
    )
  }
);

function isAdminPagesRoute(pathname: string): boolean {
  return pathname.includes('/admin');
}

/**
 * Pages Router app shell for logged-in CSR consoles (admin/*, developer/*).
 *
 * Entry auth is middleware (LOGINED_PAGES); this shell only provides IOC,
 * i18n, theme, and client bootstrap.
 *
 * Admin routes keep a persistent {@link AdminPagesAppShell} so the sidebar
 * stays mounted while only the page body waits on Next data.
 *
 * Use `ClientThemeProvider` (no React-tree theme script). Anti-FOUC is
 * handled by `_document` via getPagesThemeInitScript.
 */
export default function App({
  Component,
  pageProps,
  router
}: PagesRouterProps) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;
  const adminRoute = isAdminPagesRoute(router.pathname);

  const page = <Component {...pageProps} />;

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
            {adminRoute ? (
              <AdminPagesAppShell>{page}</AdminPagesAppShell>
            ) : (
              page
            )}
          </ClientRootProvider>
        </ClientThemeProvider>
      </NextIntlClientProvider>
    </IOCProvider>
  );
}
