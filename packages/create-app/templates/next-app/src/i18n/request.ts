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
      messages: data,
      // 将 MISSING_MESSAGE 错误转换为警告
      onError: (error) => {
        if (error.message.includes('MISSING_MESSAGE')) {
          console.warn(`[i18n] Missing translation: ${error.message}`);
          return error.message; // 返回 key 作为 fallback 文本
        }
        throw error; // 其他错误仍然抛出
      }
    };
  }

  // Dynamically import the translation messages for the selected locale
  return {
    locale,
    messages: (await import(`../../public/locales/${locale}.json`)).default,
    // 将 MISSING_MESSAGE 错误转换为警告
    onError: (error) => {
      if (error.message.includes('MISSING_MESSAGE')) {
        console.warn(`[i18n] Missing translation: ${error.message}`);
        return error.message; // 返回 key 作为 fallback 文本
      }
      throw error; // 其他错误仍然抛出
    }
  };
});
