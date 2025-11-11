import * as i18nKeys from '../Identifier/common/common';
/**
 * Not found page i18n interface
 *
 * @description
 * - title: not found title
 * - description: not found description
 * - content: not found content
 * - keywords: not found keywords
 */
export type NotFound18nInterface = typeof notFound18n;

export const notFound18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_404_TITLE,
  description: i18nKeys.PAGE_404_DESCRIPTION,
  content: i18nKeys.PAGE_404_DESCRIPTION,
  keywords: i18nKeys.PAGE_404_DESCRIPTION
});

/**
 * Server error page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type ServerError18nInterface = typeof serverError18n;

export const serverError18n = Object.freeze({
  title: i18nKeys.PAGE_500_TITLE,
  description: i18nKeys.PAGE_500_DESCRIPTION,
  content: i18nKeys.PAGE_500_DESCRIPTION,
  keywords: i18nKeys.PAGE_500_DESCRIPTION
});
