/**
 * Site share card (Open Graph / Twitter) configuration.
 */
export const SITE_SHARE = {
  siteName: 'Next OAuth',
  /** Common social card size */
  imageSize: { width: 1200, height: 630 },
  imageContentType: 'image/png',
  /** `og:locale`: app locale → Open Graph locale */
  ogLocale: { zh: 'zh_CN', en: 'en_US' },
  /** Relative to `/{locale}` — matches `app/[locale]/opengraph-image` */
  imagePath: 'opengraph-image',
  colors: {
    brand: '#2563eb',
    brandDeep: '#1d4ed8',
    paper: '#f8fafc',
    ink: '#0f172a',
    inkSoft: '#64748b'
  }
} as const;

export type SiteShareLocaleType = keyof typeof SITE_SHARE.ogLocale;
