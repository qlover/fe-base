import * as commonTablesKeys from '../i18n-identifier/common/admin.table';
import * as homeKeys from '../i18n-identifier/pages/page.admin.home';

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
  detailText: commonTablesKeys.COMMON_ADMIN_TABLE_DETAIL,
  prev: commonTablesKeys.COMMON_ADMIN_TABLE_PREV,
  next: commonTablesKeys.COMMON_ADMIN_TABLE_NEXT,
  pageSize: commonTablesKeys.COMMON_ADMIN_TABLE_PAGE_SIZE
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
