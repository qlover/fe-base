import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { COMMON_MANIFEST_NAME } from '@config/Identifier';
import type { MetadataRoute } from 'next';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: routing.defaultLocale
  });

  return {
    name: t(COMMON_MANIFEST_NAME),
    start_url: '/',
    theme_color: '#101E33'
  };
}
