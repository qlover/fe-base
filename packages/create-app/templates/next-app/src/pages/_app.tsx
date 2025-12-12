import dynamic from 'next/dynamic';
import { withRouter } from 'next/router';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/css/index.css';
import type { PagesRouterProps } from '@/base/types/PagesRouter';
import { BootstrapsProvider } from '@/uikit/components/BootstrapsProvider';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';

/**
 * 动态导入 ClientRootProvider，禁用 SSR，确保只在客户端渲染
 *
 * 为什么需要禁用 SSR？
 * 1. ClientRootProvider 内部使用了 AntdRegistry（来自 @ant-design/nextjs-registry），
 *    该组件主要针对 App Router 设计，在 Pages Router 的 SSR 环境中可能存在兼容性问题
 * 2. ClientRootProvider 使用了 useIOC() hook，该 hook 在服务端渲染时可能无法正常工作
 * 3. ThemeProvider 和 AntdThemeProvider 可能依赖浏览器 API（如 localStorage、window 等），
 *    在服务端渲染时会导致错误或页面一直处于加载状态
 *
 * 通过在 Pages Router 中使用 dynamic import 并设置 ssr: false，
 * 可以确保 ClientRootProvider 只在客户端渲染，避免 SSR 相关的问题
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

function App({ Component, pageProps, router }: PagesRouterProps) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;

  return (
    <IOCProvider>
      <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
        <BootstrapsProvider>
          <ClientRootProvider themeConfig={themeConfig}>
            <Component {...pageProps} />
          </ClientRootProvider>
        </BootstrapsProvider>
      </NextIntlClientProvider>
    </IOCProvider>
  );
}

export default withRouter(App);
