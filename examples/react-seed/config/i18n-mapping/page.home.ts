import * as i18nKeys from '../i18n-identifier/page.home';

export const pageHomeI18n = {
  // basic meta properties
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS,

  welcome: i18nKeys.PAGE_HOME_WELCOME,
  description2: i18nKeys.PAGE_HOME_DESCRIPTION2,
  explore: i18nKeys.PAGE_HOME_EXPLORE,
  getStartedTitle: i18nKeys.PAGE_HOME_GET_STARTED,
  getStartedDescription: i18nKeys.PAGE_HOME_GET_STARTED_DESCRIPTION,
  getStartedButton: i18nKeys.PAGE_HOME_GET_STARTED_BUTTON,

  // Home page UI
  welcomeTitle: i18nKeys.PAGE_HOME_WELCOME_TITLE,
  introDescription: i18nKeys.PAGE_HOME_INTRO_DESCRIPTION,
  linkHome: i18nKeys.PAGE_HOME_LINK_HOME,
  link404: i18nKeys.PAGE_HOME_LINK_404,
  link500: i18nKeys.PAGE_HOME_LINK_500,
  linkEn: i18nKeys.PAGE_HOME_LINK_EN,
  linkZh: i18nKeys.PAGE_HOME_LINK_ZH
} as const;

export type HomeI18nMapping = typeof pageHomeI18n;
