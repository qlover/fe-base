import { routerPrefix } from '../common';

export const i18nConfig = {
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: routerPrefix + '/locales/{{lng}}/{{ns}}.json'
  },
  supportedLngs: ['en', 'zh']
} as const;

export type LocaleType = (typeof i18nConfig.supportedLngs)[number];
