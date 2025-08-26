import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import { BaseHeader } from '@/uikit/components/BaseHeader';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import type { LocaleType } from '@config/i18n';
import '@/styles/css/index.css';

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Extract the locale from the route params (async for Next.js App Router)
  const { locale } = await params;

  // Validate that the requested locale is supported
  if (!i18nConfig.supportedLngs.includes(locale as LocaleType)) {
    notFound();
  }

  // Load the translation messages for the selected locale
  const messages = await getMessages({ locale });

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
