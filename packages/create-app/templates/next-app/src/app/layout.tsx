import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { i18nConfig } from '@config/i18n';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import { themeConfig } from '@config/theme';
import '@/styles/css/index.css';
import BaseHeader from '@/uikit/components/BaseHeader';

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: 'en' });

  // TODO: suppressHydrationWarning 暂时解决 hydration 问题
  return (
    <html lang={'en'} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ComboProvider themeConfig={themeConfig}>
            <div className="flex flex-col min-h-screen ">
              <BaseHeader />
              <div className="flex flex-col">{children}</div>
            </div>
          </ComboProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
