import { NextIntlClientProvider } from 'next-intl';
import { PageParams } from '@/base/cases/PageParams';
import type { PageLayoutProps } from '@/base/types/PageProps';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import { themeConfig } from '@config/theme';
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
          <ComboProvider themeConfig={themeConfig}>{children}</ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
