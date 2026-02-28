import * as commonTablesKeys from '../i18n-identifier/common/admint.table';
import * as commonKeys from '../i18n-identifier/common/common';
import * as homeKeys from '../i18n-identifier/pages/page.admin.home';
import * as userKeys from '../i18n-identifier/pages/page.admin.user';

export const adminTableHeaderI18n = {
  create: commonTablesKeys.COMMON_ADMIN_TABLE_CREATE,
  refresh: commonTablesKeys.COMMON_ADMIN_TABLE_REFRESH,
  search: commonTablesKeys.COMMON_ADMIN_TABLE_SEARCH,
  reset: commonTablesKeys.COMMON_ADMIN_TABLE_RESET,
  export: commonTablesKeys.COMMON_ADMIN_TABLE_EXPORT,
  settings: commonTablesKeys.COMMON_ADMIN_TABLE_SETTINGS
} as const;

export const adminTableI18n = {
  ...adminTableHeaderI18n,
  action: commonTablesKeys.COMMON_ADMIN_TABLE_ACTION,
  editText: commonTablesKeys.COMMON_ADMIN_TABLE_EDIT,
  deleteText: commonTablesKeys.COMMON_ADMIN_TABLE_DELETE,
  detailText: commonTablesKeys.COMMON_ADMIN_TABLE_DETAIL
} as const;

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
