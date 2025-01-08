/** @type {import('i18next').InitOptions} */
export const i18nConfig = {
  /**
   * default language
   */
  fallbackLng: 'en',
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false // React already does escaping
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
  supportedLngs: ['en', 'zh']
} as const;

export type I18nServiceLocale = (typeof i18nConfig.supportedLngs)[number];
