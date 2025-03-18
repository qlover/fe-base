export default {
  fallbackLng: 'en',
  debug: true,
  interpolation: {
    escapeValue: false
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json'
  },
  supportedLngs: ['en', 'zh']
} as const;
