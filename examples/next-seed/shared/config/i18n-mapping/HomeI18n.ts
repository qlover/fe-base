import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.home';

/**
 * Home page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type HomeI18nInterface = typeof homeI18n;

export const homeI18nNamespace = 'page_home';

export const homeI18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS,

  welcome: i18nKeys.PAGE_HOME_WELCOME,
  getStartedTitle: i18nKeys.PAGE_HOME_GET_STARTED,
  getStartedDescription: i18nKeys.PAGE_HOME_GET_STARTED_DESCRIPTION,
  getStartedButton: i18nKeys.PAGE_HOME_GET_STARTED_BUTTON,

  adminTitle: COMMON_ADMIN_TITLE
});
