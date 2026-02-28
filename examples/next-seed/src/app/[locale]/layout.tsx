import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { ClientRootProvider } from '@/uikit/components/ClientRootProvider';
import { IOCProvider } from '@/uikit/components/IOCProvider';
import { i18nConfig } from '@config/i18n';
import '@/styles/index.css';
import { themeConfig } from '@config/theme';
import type { PageLayoutProps } from '@interfaces/AppPageRouter';
import { getI18nMessages, getLocale } from '@server/pageRouteParams';

export function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

/**
 * RootLayout is the root layout for the app
 *
 * 注意事项:
 *
 * 1. Layout 组件建议不要使用类似客户端渲染, 比如 useMountedClient 等这样会导致重渲染时dom节点发生变化,
 * 页面闪烁特别是切换语言时
 *
 * 2. Layout 组件内 IOCProvider 置于顶层, 因为整个项目依赖容器化
 * 在 spa 中项目中，也就是前端渲染时是不需要要区分渲染环境(server 和 client)
 *
 * 3. 除了已有的 provider 外, 尽量使用 ClientRootProvider 包裹所有客户端组件
 *
 * @param children - The children components
 * @param params - The page parameters
 * @returns
 */
export default async function RootLayout({
  children,
  params
}: PageLayoutProps) {
  const resolvedParams = await params!;
  const locale = getLocale(resolvedParams);

  // Enable static rendering
  setRequestLocale(locale);

  // Get messages for the current locale to prevent flickering during language switch
  // Load default namespaces (common, api) - admin namespaces are loaded in admin layout
  const messages = await getI18nMessages(locale);

  return (
    <html
      data-testid="AppRoute-RootLayout"
      lang={locale}
      // 暂时解决主题 hydration 问题
      suppressHydrationWarning
    >
      <body>
        <IOCProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientRootProvider themeConfig={themeConfig}>
              {children}
            </ClientRootProvider>
          </NextIntlClientProvider>
        </IOCProvider>
      </body>
    </html>
  );
}
