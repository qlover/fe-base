export const i18nConfig = {
  localeNames: {
    en: 'English',
    zh: '中文'
  },
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
  supportedLngs: ['en', 'zh'],
  localeDetection: false,
} as const;
