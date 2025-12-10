import { NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { PageLayoutProps } from '@/base/types/PageProps';
import { PageParams } from '@/server/PageParams';
import { ComboProvider } from '@/uikit/components/ComboProvider';
import { LanguageSwitcher } from '@/uikit/components/LanguageSwitcher';
import { i18nConfig } from '@config/i18n';
import { themeConfig } from '@config/theme';
import '@/styles/css/index.css';

export function generateStaticParams() {
  return i18nConfig.supportedLngs.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params
}: PageLayoutProps) {
  const pageParams = new PageParams(await params!);
  const locale = pageParams.getLocale();

  // Enable static rendering
  setRequestLocale(locale);

  return (
    <html data-testid="RootLayout" lang={locale} data-theme={'dark'}>
      <body>
        <NextIntlClientProvider>
          {/* <ComboProvider themeConfig={themeConfig}> */}
          <main className="flex flex-1 h-screen flex-col bg-primary">
            <LanguageSwitcher />
            <span className="text-text">text{locale}</span>
          </main>
          {/* </ComboProvider> */}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
