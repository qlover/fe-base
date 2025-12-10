// src/i18n/request.ts

import { getRequestConfig } from 'next-intl/server';
import { routing, type Locale } from './routing';
import { loadMessages } from './loadMessages';

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
