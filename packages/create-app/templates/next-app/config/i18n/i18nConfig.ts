export const i18nConfig = {
  // 语言包缓存时间（秒）
  localeCacheTime: 60,
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
