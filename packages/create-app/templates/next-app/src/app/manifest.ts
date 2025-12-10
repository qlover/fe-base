import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import type { MetadataRoute } from 'next';
import { COMMON_MANIFEST_NAME } from '@config/Identifier';

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
