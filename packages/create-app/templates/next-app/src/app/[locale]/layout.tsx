import { NextIntlClientProvider } from 'next-intl';
import { themeConfig } from '@config/theme';
import { PageParams } from '@/base/cases/PageParams';
import type { PageLayoutProps } from '@/base/types/PageProps';
import { BaseHeader } from '@/uikit/components/BaseHeader';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import '@/styles/css/index.css';

export default async function RootLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new PageParams(await params!);
  const locale = pageParams.getLocale();
  const messages = await pageParams.getI18nMessages();

  // TODO: suppressHydrationWarning 暂时解决 hydration 问题
  return (
    <html data-testid="RootLayout" lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ComboProvider themeConfig={themeConfig}>
            <div className="flex flex-col min-h-screen">
              <BaseHeader showLogoutButton />
              <div className="flex flex-col">{children}</div>
            </div>
          </ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
