// src/i18n/request.ts

import { getRequestConfig } from 'next-intl/server';
import { useApiLocales } from '@config/common';
import { routing, type Locale } from './routing';

// Export a function to configure next-intl on each request (server-side)
export default getRequestConfig(async ({ requestLocale }) => {
  // The incoming requestLocale typically matches the `[locale]` URL segment
  let locale = await requestLocale;

  // Ensure a valid, supported locale is always used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  // use api locales
  if (useApiLocales) {
    const app_host = process.env.APP_HOST;
    const localeUrl = `${app_host}/api/locales/json?locale=${locale}`;
    const response = await fetch(localeUrl);
    const data = await response.json();
    return {
      locale,
      messages: data
    };
  }

  // Dynamically import the translation messages for the selected locale
  return {
    locale,
    messages: (await import(`../../public/locales/${locale}.json`)).default
  };
});
