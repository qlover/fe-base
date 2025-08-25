export const i18nConfig = {
  localeNames: {
    en: 'English',
    zh: '中文'
  },
  fallbackLng: 'en',
  debug: false,
  supportedLngs: ['en', 'zh'] as const,
  localeDetection: true
} as const;

export type LocaleType = (typeof i18nConfig.supportedLngs)[number];
