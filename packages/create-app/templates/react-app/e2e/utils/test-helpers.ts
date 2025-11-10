import { useLocaleRoutes } from '@config/common';
import { i18nConfig } from '@config/i18n/i18nConfig';

export const createStartWithUrlRegex = (fullURL: string, locale: string) => {
  const url = locale ? `${fullURL}/${locale}` : fullURL;
  return new RegExp(`^${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
};

export async function localeRoutesEach(
  callback: (localePrefix: string) => Promise<void>
) {
  if (!useLocaleRoutes) {
    return await callback('');
  }

  for (const locale of i18nConfig.supportedLngs) {
    await callback(`/${locale}`);
  }
}
