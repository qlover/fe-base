import * as commonTablesKeys from '../i18n-identifier/common/admin.table';
import * as commonKeys from '../i18n-identifier/common/common';
import * as homeKeys from '../i18n-identifier/pages/page.admin.home';
import * as localesKeys from '../i18n-identifier/pages/page.admin.locales';
import * as requestLogsKeys from '../i18n-identifier/pages/page.admin.request-logs';
import * as rolesKeys from '../i18n-identifier/pages/page.admin.roles';
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

export type AdminUsersI18nInterface = typeof adminUsers18n;

export type AdminRolesI18nInterface = typeof adminRoles18n;

export type AdminLocalesI18nInterface = typeof adminLocales18n;

export type AdminRequestLogsI18nInterface = typeof adminRequestLogs18n;

export const adminRoles18n = Object.freeze({
  title: rolesKeys.ADMIN_ROLES_TITLE,
  description: rolesKeys.ADMIN_ROLES_DESCRIPTION,
  content: rolesKeys.ADMIN_ROLES_DESCRIPTION,
  keywords: rolesKeys.ADMIN_ROLES_KEYWORDS,
  sectionSystem: rolesKeys.ADMIN_ROLES_SECTION_SYSTEM,
  permissionLabel: rolesKeys.ADMIN_ROLES_PERMISSION_LABEL,
  selectedCount: rolesKeys.ADMIN_ROLES_SELECTED_COUNT,
  sectionGranted: rolesKeys.ADMIN_ROLES_SECTION_GRANTED,
  sectionAvailable: rolesKeys.ADMIN_ROLES_SECTION_AVAILABLE,
  hintPlatform: rolesKeys.ADMIN_ROLES_HINT_PLATFORM,
  save: rolesKeys.ADMIN_ROLES_SAVE,
  saving: rolesKeys.ADMIN_ROLES_SAVING,
  loading: rolesKeys.ADMIN_ROLES_LOADING,
  loadFailed: rolesKeys.ADMIN_ROLES_LOAD_FAILED,
  saveFailed: rolesKeys.ADMIN_ROLES_SAVE_FAILED,
  saveSuccess: rolesKeys.ADMIN_ROLES_SAVE_SUCCESS,
  empty: rolesKeys.ADMIN_ROLES_EMPTY,
  systemUser: rolesKeys.ADMIN_ROLES_SYSTEM_USER,
  systemOperator: rolesKeys.ADMIN_ROLES_SYSTEM_OPERATOR,
  systemAdmin: rolesKeys.ADMIN_ROLES_SYSTEM_ADMIN,
  saveButton: commonKeys.COMMON_SAVE
});

export const adminRequestLogs18n = Object.freeze({
  title: requestLogsKeys.ADMIN_REQUEST_LOGS_TITLE,
  description: requestLogsKeys.ADMIN_REQUEST_LOGS_DESCRIPTION,
  content: requestLogsKeys.ADMIN_REQUEST_LOGS_DESCRIPTION,
  keywords: requestLogsKeys.ADMIN_REQUEST_LOGS_KEYWORDS,
  colTime: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_TIME,
  colRequestId: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_REQUEST_ID,
  colCategory: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_CATEGORY,
  colType: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_TYPE,
  colSuccess: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_SUCCESS,
  colHttp: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_HTTP,
  colStatus: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_STATUS,
  colDuration: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_DURATION,
  colIp: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_IP,
  colLoginMethod: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_LOGIN_METHOD,
  colError: requestLogsKeys.ADMIN_REQUEST_LOGS_COL_ERROR,
  empty: requestLogsKeys.ADMIN_REQUEST_LOGS_EMPTY,
  clear: requestLogsKeys.ADMIN_REQUEST_LOGS_CLEAR,
  clearConfirmTitle: requestLogsKeys.ADMIN_REQUEST_LOGS_CLEAR_CONFIRM_TITLE,
  clearConfirmContent: requestLogsKeys.ADMIN_REQUEST_LOGS_CLEAR_CONFIRM_CONTENT,
  clearSuccess: requestLogsKeys.ADMIN_REQUEST_LOGS_CLEAR_SUCCESS,
  cancelButton: commonKeys.COMMON_CANCEL
});

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
  createButton: commonKeys.COMMON_CREATE,
  systemRoleLabel: userKeys.ADMIN_USERS_SYSTEM_ROLE_LABEL,
  systemRoleUser: userKeys.ADMIN_USERS_SYSTEM_ROLE_USER,
  systemRoleOperator: userKeys.ADMIN_USERS_SYSTEM_ROLE_OPERATOR,
  systemRoleAdmin: userKeys.ADMIN_USERS_SYSTEM_ROLE_ADMIN,
  searchPlaceholder: userKeys.ADMIN_USERS_SEARCH_PLACEHOLDER,
  empty: userKeys.ADMIN_USERS_EMPTY,
  loading: userKeys.ADMIN_USERS_LOADING,
  emailLabel: userKeys.ADMIN_USERS_EMAIL_LABEL,
  searchButton: commonTablesKeys.COMMON_ADMIN_TABLE_SEARCH,
  cannotChangeSelf: userKeys.ADMIN_USERS_CANNOT_CHANGE_SELF,
  you: userKeys.ADMIN_USERS_YOU,
  roleChangeForbidden: userKeys.ADMIN_USERS_ROLE_CHANGE_FORBIDDEN
});

export const adminLocales18n = Object.freeze({
  title: localesKeys.ADMIN_LOCALES_TITLE,
  description: localesKeys.ADMIN_LOCALES_DESCRIPTION,
  content: localesKeys.ADMIN_LOCALES_DESCRIPTION,
  keywords: localesKeys.ADMIN_LOCALES_KEYWORDS,
  searchPlaceholder: localesKeys.ADMIN_LOCALES_SEARCH_PLACEHOLDER,
  namespaceFilter: localesKeys.ADMIN_LOCALES_NAMESPACE_FILTER,
  namespaceAll: localesKeys.ADMIN_LOCALES_NAMESPACE_ALL,
  localeLabel: localesKeys.ADMIN_LOCALES_LOCALE_LABEL,
  refresh: localesKeys.ADMIN_LOCALES_REFRESH,
  create: localesKeys.ADMIN_LOCALES_CREATE,
  import: localesKeys.ADMIN_LOCALES_IMPORT,
  importing: localesKeys.ADMIN_LOCALES_IMPORTING,
  importSuccess: localesKeys.ADMIN_LOCALES_IMPORT_SUCCESS,
  colValue: localesKeys.ADMIN_LOCALES_COL_VALUE,
  colNamespace: localesKeys.ADMIN_LOCALES_COL_NAMESPACE,
  colText: localesKeys.ADMIN_LOCALES_COL_TEXT,
  colDescription: localesKeys.ADMIN_LOCALES_COL_DESCRIPTION,
  colActions: localesKeys.ADMIN_LOCALES_COL_ACTIONS,
  edit: localesKeys.ADMIN_LOCALES_EDIT,
  save: localesKeys.ADMIN_LOCALES_SAVE,
  saving: localesKeys.ADMIN_LOCALES_SAVING,
  cancel: localesKeys.ADMIN_LOCALES_CANCEL,
  empty: localesKeys.ADMIN_LOCALES_EMPTY,
  loading: localesKeys.ADMIN_LOCALES_LOADING,
  loadFailed: localesKeys.ADMIN_LOCALES_LOAD_FAILED,
  saveFailed: localesKeys.ADMIN_LOCALES_SAVE_FAILED,
  saveSuccess: localesKeys.ADMIN_LOCALES_SAVE_SUCCESS,
  importFailed: localesKeys.ADMIN_LOCALES_IMPORT_FAILED,
  forbidden: localesKeys.ADMIN_LOCALES_FORBIDDEN,
  editorCreate: localesKeys.ADMIN_LOCALES_EDITOR_CREATE,
  editorEdit: localesKeys.ADMIN_LOCALES_EDITOR_EDIT,
  keyHint: localesKeys.ADMIN_LOCALES_KEY_HINT,
  keyInvalid: localesKeys.ADMIN_LOCALES_KEY_INVALID
});
