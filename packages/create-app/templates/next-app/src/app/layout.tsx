import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { i18nConfig } from '@config/i18n';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import { themeConfig } from '@config/theme';

async function getMessages(locale: string) {
  try {
    return (await import(`../../public/locales/${locale}/common.json`)).default;
  } catch (error) {
    notFound();
  }
}

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get('x-next-intl-locale') || i18nConfig.fallbackLng;
  const messages = await getMessages(locale);

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ComboProvider themeConfig={themeConfig}>
            {children}
          </ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}