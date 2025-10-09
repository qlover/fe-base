import * as i18nKeys from '../Identifier/page.home';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type HomeI18nInterface = typeof homeI18n;

export const homeI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS,

  welcome: i18nKeys.HOME_WELCOME,
  getStartedTitle: i18nKeys.HOME_GET_STARTED_TITLE,
  getStartedDescription: i18nKeys.HOME_GET_STARTED_DESCRIPTION,
  getStartedButton: i18nKeys.HOME_GET_STARTED_BUTTON
});
