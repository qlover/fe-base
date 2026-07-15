import { ClientThemeProvider } from '@wrksz/themes/client';
import dynamic from 'next/dynamic';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/index.css';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import type { PagesRouterProps } from '@interfaces/PagesRouter';

/**
 * 动态导入 ClientRootProvider，禁用 SSR，确保只在客户端渲染
 *
 * 为什么需要禁用 SSR？
 * 1. ClientRootProvider / DialogUIHost use browser-only IOC hooks
 * 2. Theme providers may touch localStorage / window during init
 *
 * Pages Router uses dynamic import with ssr: false so the shell stays client-only.
 */
const ClientRootProvider = dynamic(
  () =>
    import('@/uikit/components/ClientRootProvider').then(
      (mod) => mod.ClientRootProvider
    ),
  {
    ssr: false
  }
);

export default function App({
  Component,
  pageProps,
  router
}: PagesRouterProps) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;

  return (
    <IOCProvider>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <ClientThemeProvider
          themes={themeConfig.supportedThemes as unknown as string[]}
          attribute={themeConfig.domAttribute}
          defaultTheme={themeConfig.defaultTheme}
          enableSystem={themeConfig.enableSystem}
          enableColorScheme={false}
          storageKey={themeConfig.storageKey}
        >
          <ClientRootProvider>
            <Component {...pageProps} />
          </ClientRootProvider>
        </ClientThemeProvider>
      </NextIntlClientProvider>
    </IOCProvider>
  );
}
