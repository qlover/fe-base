// src/i18n/request.ts

import { IntlErrorCode } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { i18nConfig } from '@config/i18n';
import { loadMessages } from './loadMessages';
import { routing, type Locale } from './routing';

// Export a function to configure next-intl on each request (server-side)
export default getRequestConfig(async ({ requestLocale }) => {
  // The incoming requestLocale typically matches the `[locale]` URL segment
  let locale = await requestLocale;

  // Ensure a valid, supported locale is always used
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const messages = await loadMessages(locale);

  return {
    locale,
    messages,
    timeZone: i18nConfig.timeZone,
    onError: (error) => {
      if (
        error.code === IntlErrorCode.MISSING_MESSAGE ||
        error.code === IntlErrorCode.ENVIRONMENT_FALLBACK
      ) {
        console.warn(`[i18n] ${error.code}: ${error.message}`);
        return;
      }
      throw error;
    }
  };
});
