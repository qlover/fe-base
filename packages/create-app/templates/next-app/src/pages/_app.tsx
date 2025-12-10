import { AppProps } from 'next/app';
import { NextRouter, withRouter } from 'next/router';
import { NextIntlClientProvider } from 'next-intl';
import '@/styles/css/index.css';
import { i18nConfig } from '@config/i18n';

type Props = AppProps & {
  router: NextRouter;
};

function App({ Component, pageProps, router }: Props) {
  const locale = (router.query.locale as string) || i18nConfig.fallbackLng;

  return (
    <html data-testid="PagesRootLayout" lang={locale} data-theme={'dark'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={pageProps.messages}>
          <Component {...pageProps} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

export default withRouter(App);
