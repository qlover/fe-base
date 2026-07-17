import { COMMON_ADMIN_TITLE } from '../i18n-identifier/common/common';
import * as i18nKeys from '../i18n-identifier/pages/page.home';

/**
 * Home page i18n interface
 */
export type HomeI18nInterface = typeof homeI18n;

export const homeI18nNamespace = 'page_home';

export const homeI18n = Object.freeze({
  title: i18nKeys.PAGE_HOME_TITLE,
  description: i18nKeys.PAGE_HOME_DESCRIPTION,
  content: i18nKeys.PAGE_HOME_DESCRIPTION,
  keywords: i18nKeys.PAGE_HOME_KEYWORDS,

  heroBadge: i18nKeys.PAGE_HOME_HERO_BADGE,
  heroTitle1: i18nKeys.PAGE_HOME_HERO_TITLE1,
  heroTitle2: i18nKeys.PAGE_HOME_HERO_TITLE2,
  heroDesc: i18nKeys.PAGE_HOME_HERO_DESC,
  heroStart: i18nKeys.PAGE_HOME_HERO_START,
  heroDocs: i18nKeys.PAGE_HOME_HERO_DOCS,

  featureThemeTitle: i18nKeys.PAGE_HOME_FEATURE1_TITLE,
  featureThemeDesc: i18nKeys.PAGE_HOME_FEATURE1_DESC,
  featureI18nTitle: i18nKeys.PAGE_HOME_FEATURE2_TITLE,
  featureI18nDesc: i18nKeys.PAGE_HOME_FEATURE2_DESC,
  featureAuthTitle: i18nKeys.PAGE_HOME_FEATURE3_TITLE,
  featureAuthDesc: i18nKeys.PAGE_HOME_FEATURE3_DESC,

  adminTitle: COMMON_ADMIN_TITLE
});
