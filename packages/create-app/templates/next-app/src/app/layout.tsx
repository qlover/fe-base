import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { i18nConfig } from '@config/i18n';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import { themeConfig } from '@config/theme';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const locale = i18nConfig.fallbackLng;
  const messages = await getMessages({ locale });
console.log('jj messages', messages)
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ComboProvider themeConfig={themeConfig}>{children}</ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
