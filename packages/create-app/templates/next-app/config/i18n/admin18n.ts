import * as commonKeys from '../Identifier/common/common';
import * as homeKeys from '../Identifier/pages/page.admin.home';
import * as localesKeys from '../Identifier/pages/page.admin.locales';
import * as userKeys from '../Identifier/pages/page.admin.user';

export const admin18n = Object.freeze({
  // basic meta properties
  title: homeKeys.ADMIN_HOME_TITLE,
  description: homeKeys.ADMIN_HOME_DESCRIPTION,
  content: homeKeys.ADMIN_HOME_DESCRIPTION,
  keywords: homeKeys.ADMIN_HOME_KEYWORDS,

  // admin page
  welcome: homeKeys.ADMIN_HOME_WELCOME
});

export type AdminUsersI18nInterface = typeof adminUsers18n;

export const adminUsers18n = Object.freeze({
  // basic meta properties
  title: userKeys.ADMIN_USERS_TITLE,
  description: userKeys.ADMIN_USERS_DESCRIPTION,
  content: userKeys.ADMIN_USERS_DESCRIPTION,
  keywords: userKeys.ADMIN_USERS_KEYWORDS,

  createTitle: userKeys.ADMIN_USERS_CREATE_TITLE,
  editTitle: userKeys.ADMIN_USERS_EDIT_TITLE,
  detailTitle: userKeys.ADMIN_USERS_DETAIL_TITLE,
  deleteTitle: userKeys.ADMIN_USERS_DELETE_TITLE,
  deleteContent: userKeys.ADMIN_USERS_DELETE_CONTENT,
  saveButton: commonKeys.COMMON_SAVE,
  detailButton: commonKeys.COMMON_DETAIL,
  cancelButton: commonKeys.COMMON_CANCEL,
  createButton: commonKeys.COMMON_CREATE
});

export type AdminLocalesI18nInterface = typeof adminLocales18n;

export const adminLocales18n = Object.freeze({
  // basic meta properties
  title: localesKeys.ADMIN_LOCALES_TITLE,
  description: localesKeys.ADMIN_LOCALES_DESCRIPTION,
  content: localesKeys.ADMIN_LOCALES_DESCRIPTION,
  keywords: localesKeys.ADMIN_LOCALES_KEYWORDS,

  createTitle: localesKeys.ADMIN_LOCALES_CREATE_TITLE,
  editTitle: localesKeys.ADMIN_LOCALES_EDIT_TITLE,
  detailTitle: localesKeys.ADMIN_LOCALES_DETAIL_TITLE,
  deleteTitle: localesKeys.ADMIN_LOCALES_DELETE_TITLE,
  deleteContent: localesKeys.ADMIN_LOCALES_DELETE_CONTENT,
  saveButton: commonKeys.COMMON_SAVE,
  detailButton: commonKeys.COMMON_DETAIL,
  cancelButton: commonKeys.COMMON_CANCEL,
  createButton: commonKeys.COMMON_CREATE,
  importTitle: localesKeys.ADMIN_LOCALES_IMPORT_TITLE,
  importZhTitle: localesKeys.ADMIN_LOCALES_IMPORT_ZH_TITLE,
  importEnTitle: localesKeys.ADMIN_LOCALES_IMPORT_EN_TITLE
});
