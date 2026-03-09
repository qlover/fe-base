import { routerPrefix, usePathLocaleRoute } from './seed.config';
// import type { overrideQuerystringDetector } from '@/utils/overrideQuerystringDetector';
// import type { DetectorOptions } from 'i18next-browser-languagedetector';

export const i18nLoadBasePath = '/locales/{{lng}}.json';
export const i18nLoadPath = routerPrefix + '/locales/{{lng}}.json';
// export loadI18nPath = '/locales/{{lng}}/{{ns}}.json'

export const I18nLocaleMap = {
  en: 'en',
  zh: 'zh'
} as const;

export const i18nConfig = {
  defaultLocale: 'en',
  storageKey: 'i18nextLng',
  debug: false,
  interpolation: {
    escapeValue: false
  },
  ns: ['common'],
  defaultNS: 'common',
  backend: {
    loadPath: i18nLoadPath
  },
  supportedLngs: Object.values(I18nLocaleMap),
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

/**
 * 默认语言匹配顺序
 *
 * - 'multiQuerystring': 扩展默认的 querysring，从查询参数中匹配语言(支持多 key: lang, lng, language, locale, hl)
 *   参见 {@link overrideQuerystringDetector}
 *
 * - 'cookie': 从 cookie 中匹配语言
 * - 'localStorage': 从本地存储中匹配语言
 * - 'navigator': 从浏览器语言中匹配语言
 *
 * @see {@link DetectorOptions}
 * @type {DetectorOptions['order']}
 */
export const defaultOrder = ['multiQuerystring', 'localStorage', 'navigator'];

/**
 * 语言匹配顺序
 *
 * - 'path': 从路径中匹配语言(仅当 `usePathLocaleRoute` 为 `true` 时生效)
 * - 'querystring': 从查询参数中匹配语言
 * - 'multiQuerystring': 从查询参数中匹配语言(支持多 key: lang, lng, language, locale, hl)
 * - 'localStorage': 从本地存储中匹配语言
 * - 'navigator': 从浏览器语言中匹配语言
 */
export const DetectionOrder = usePathLocaleRoute
  ? ['path', ...defaultOrder]
  : defaultOrder;

export type LocaleType = (typeof I18nLocaleMap)[keyof typeof I18nLocaleMap];
