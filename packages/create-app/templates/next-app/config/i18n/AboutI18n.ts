import * as i18nKeys from '../Identifier/pages/page.about';

/**
 * About page i18n interface
 */
export type AboutI18nInterface = typeof aboutI18n;

export const aboutI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_ABOUT_TITLE,
  description: i18nKeys.PAGE_ABOUT_DESCRIPTION,
  content: i18nKeys.PAGE_ABOUT_DESCRIPTION,
  keywords: i18nKeys.PAGE_ABOUT_KEYWORDS
});
