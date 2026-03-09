import * as i18nKeys from '../i18n-identifier/pages.home';

export const pageHomeI18n = {
  // basic meta properties
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS,

  welcome: i18nKeys.PAGE_HOME_WELCOME
} as const;

export type HomeI18nMapping = typeof pageHomeI18n;
