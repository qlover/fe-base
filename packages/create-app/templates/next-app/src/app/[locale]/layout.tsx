import { NextIntlClientProvider } from 'next-intl';
import { themeConfig } from '@config/theme';
import type { PageLayoutProps } from '@/base/types/PageProps';
import { BootstrapServer } from '@/core/bootstraps/BootstrapServer';
import { BaseHeader } from '@/uikit/components/BaseHeader';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import '@/styles/css/index.css';

export default async function RootLayout({
  children,
  params
}: PageLayoutProps) {
  const { locale, messages } = await new BootstrapServer(await params!).main();

  // TODO: suppressHydrationWarning 暂时解决 hydration 问题
  return (
    <html data-testid="RootLayout" lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ComboProvider themeConfig={themeConfig}>
            <div className="flex flex-col min-h-screen">
              <BaseHeader />
              <div className="flex flex-col">{children}</div>
            </div>
          </ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
