export const i18nConfig = {
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
  /**
   * Whether to redirect to the fallback language when the language is not valid
   *
   * if `true`, redirect to the fallback language
   * if `false`, redirect to the 404 page
   * @example
   *
   * true: /ena/login -> /en/login
   * false: /ena/login -> /404
   *
   * @default `true`
   */
  noValidRedirectFallbackLng: true
} as const;

export type LocaleType = (typeof i18nConfig.supportedLngs)[number];
