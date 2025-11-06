import * as i18nKeys from '../Identifier/pages/page.jsonStorage';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type JsonStorage18nInterface = typeof jsonStorage18n;

export const jsonStorage18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_JSONSTORAGE_TITLE,
  description: i18nKeys.PAGE_JSONSTORAGE_DESCRIPTION,
  content: i18nKeys.PAGE_JSONSTORAGE_DESCRIPTION,
  keywords: i18nKeys.PAGE_JSONSTORAGE_KEYWORDS,

  mainTitle: i18nKeys.PAGE_JSONSTORAGE_MAIN_TITLE,
  permanentTitle: i18nKeys.PAGE_JSONSTORAGE_PERMANENT_TITLE,
  expireTitle: i18nKeys.PAGE_JSONSTORAGE_EXPIRE_TITLE,
  timeoutTitle: i18nKeys.PAGE_JSONSTORAGE_TIMEOUT_TITLE,
  formatTitle: i18nKeys.PAGE_JSONSTORAGE_FORMAT_TITLE,
  setRandom: i18nKeys.PAGE_JSONSTORAGE_SET_RANDOM,
  currentValue: i18nKeys.PAGE_JSONSTORAGE_CURRENT_VALUE,
  setExpire: i18nKeys.PAGE_JSONSTORAGE_SET_EXPIRE,
  ms: i18nKeys.PAGE_JSONSTORAGE_MS
});
