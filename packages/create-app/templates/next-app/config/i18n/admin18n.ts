import * as i18nKeys from '../Identifier/page.admin';

/**
 * Register page i18n interface
 *
 * @description
 * - welcome: welcome message
 */
export type AdminI18nInterface = typeof admin18n;

export const admin18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_ADMIN_TITLE,
  description: i18nKeys.PAGE_ADMIN_DESCRIPTION,
  content: i18nKeys.PAGE_ADMIN_DESCRIPTION,
  keywords: i18nKeys.PAGE_ADMIN_KEYWORDS,

  // admin page
  welcome: i18nKeys.ADMIN_WELCOME
});

export type AdminUsersI18nInterface = typeof adminUsers18n;

export const adminUsers18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_ADMIN_USERS_TITLE,
  description: i18nKeys.PAGE_ADMIN_USERS_DESCRIPTION,
  content: i18nKeys.PAGE_ADMIN_USERS_DESCRIPTION,
  keywords: i18nKeys.PAGE_ADMIN_USERS_KEYWORDS,

  // admin page
  welcome: i18nKeys.ADMIN_WELCOME
});

export type AdminLocalesI18nInterface = typeof adminLocales18n;

export const adminLocales18n = Object.freeze({
  // basic meta properties
  title: i18nKeys.PAGE_ADMIN_LOCALES_TITLE,
  description: i18nKeys.PAGE_ADMIN_LOCALES_DESCRIPTION,
  content: i18nKeys.PAGE_ADMIN_LOCALES_DESCRIPTION,
  keywords: i18nKeys.PAGE_ADMIN_LOCALES_KEYWORDS
});
