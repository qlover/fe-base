import * as commonTablesKeys from '../i18n-identifier/common/admin.table';
import * as commonKeys from '../i18n-identifier/common/common';
import * as homeKeys from '../i18n-identifier/pages/page.admin.home';
import * as localesKeys from '../i18n-identifier/pages/page.admin.locales';
import * as memoryKvKeys from '../i18n-identifier/pages/page.admin.memory-kv';
import * as otpMonitorKeys from '../i18n-identifier/pages/page.admin.otp-monitor';
import * as permissionsKeys from '../i18n-identifier/pages/page.admin.permissions';
import * as requestLogsKeys from '../i18n-identifier/pages/page.admin.request-logs';
import * as rolesKeys from '../i18n-identifier/pages/page.admin.roles';
import * as settingsKeys from '../i18n-identifier/pages/page.admin.settings';
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

export type AdminPermissionsI18nInterface = typeof adminPermissions18n;

export type AdminOtpMonitorI18nInterface = typeof adminOtpMonitor18n;

export type AdminMemoryKvI18nInterface = typeof adminMemoryKv18n;

export type AdminLocalesI18nInterface = typeof adminLocales18n;

export type AdminRequestLogsI18nInterface = typeof adminRequestLogs18n;

export type AdminSettingsI18nInterface = typeof adminSettings18n;

export const adminPermissions18n = Object.freeze({
  title: permissionsKeys.ADMIN_PERMISSIONS_TITLE,
  description: permissionsKeys.ADMIN_PERMISSIONS_DESCRIPTION,
  content: permissionsKeys.ADMIN_PERMISSIONS_DESCRIPTION,
  keywords: permissionsKeys.ADMIN_PERMISSIONS_KEYWORDS,
  create: permissionsKeys.ADMIN_PERMISSIONS_CREATE,
  save: permissionsKeys.ADMIN_PERMISSIONS_SAVE,
  saving: permissionsKeys.ADMIN_PERMISSIONS_SAVING,
  cancel: permissionsKeys.ADMIN_PERMISSIONS_CANCEL,
  edit: permissionsKeys.ADMIN_PERMISSIONS_EDIT,
  fieldKey: permissionsKeys.ADMIN_PERMISSIONS_FIELD_KEY,
  fieldType: permissionsKeys.ADMIN_PERMISSIONS_FIELD_TYPE,
  fieldMethod: permissionsKeys.ADMIN_PERMISSIONS_FIELD_METHOD,
  fieldPath: permissionsKeys.ADMIN_PERMISSIONS_FIELD_PATH,
  fieldDescription: permissionsKeys.ADMIN_PERMISSIONS_FIELD_DESCRIPTION,
  keyHint: permissionsKeys.ADMIN_PERMISSIONS_KEY_HINT,
  loadFailed: permissionsKeys.ADMIN_PERMISSIONS_LOAD_FAILED,
  saveFailed: permissionsKeys.ADMIN_PERMISSIONS_SAVE_FAILED,
  createSuccess: permissionsKeys.ADMIN_PERMISSIONS_CREATE_SUCCESS,
  updateSuccess: permissionsKeys.ADMIN_PERMISSIONS_UPDATE_SUCCESS,
  empty: permissionsKeys.ADMIN_PERMISSIONS_EMPTY,
  forbidden: permissionsKeys.ADMIN_PERMISSIONS_FORBIDDEN,
  search: permissionsKeys.ADMIN_PERMISSIONS_SEARCH,
  loading: permissionsKeys.ADMIN_PERMISSIONS_LOADING
});

export const adminOtpMonitor18n = Object.freeze({
  title: otpMonitorKeys.ADMIN_OTP_MONITOR_TITLE,
  description: otpMonitorKeys.ADMIN_OTP_MONITOR_DESCRIPTION,
  content: otpMonitorKeys.ADMIN_OTP_MONITOR_DESCRIPTION,
  keywords: otpMonitorKeys.ADMIN_OTP_MONITOR_KEYWORDS,
  hint: otpMonitorKeys.ADMIN_OTP_MONITOR_HINT,
  searchPlaceholder: otpMonitorKeys.ADMIN_OTP_MONITOR_SEARCH_PLACEHOLDER,
  refresh: otpMonitorKeys.ADMIN_OTP_MONITOR_REFRESH,
  autoRefresh: otpMonitorKeys.ADMIN_OTP_MONITOR_AUTO_REFRESH,
  count: otpMonitorKeys.ADMIN_OTP_MONITOR_COUNT,
  colCreated: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_CREATED,
  colPhone: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_PHONE,
  colCode: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_CODE,
  colProvider: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_PROVIDER,
  colStatus: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_STATUS,
  colAttempts: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_ATTEMPTS,
  colExpires: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_EXPIRES,
  colIp: otpMonitorKeys.ADMIN_OTP_MONITOR_COL_IP,
  codeHidden: otpMonitorKeys.ADMIN_OTP_MONITOR_CODE_HIDDEN,
  empty: otpMonitorKeys.ADMIN_OTP_MONITOR_EMPTY,
  forbidden: otpMonitorKeys.ADMIN_OTP_MONITOR_FORBIDDEN,
  loadFailed: otpMonitorKeys.ADMIN_OTP_MONITOR_LOAD_FAILED,
  loading: otpMonitorKeys.ADMIN_OTP_MONITOR_LOADING,
  ttlNone: otpMonitorKeys.ADMIN_OTP_MONITOR_TTL_NONE
});

export const adminMemoryKv18n = Object.freeze({
  title: memoryKvKeys.ADMIN_MEMORY_KV_TITLE,
  description: memoryKvKeys.ADMIN_MEMORY_KV_DESCRIPTION,
  content: memoryKvKeys.ADMIN_MEMORY_KV_DESCRIPTION,
  keywords: memoryKvKeys.ADMIN_MEMORY_KV_KEYWORDS,
  hint: memoryKvKeys.ADMIN_MEMORY_KV_HINT,
  prefixPlaceholder: memoryKvKeys.ADMIN_MEMORY_KV_PREFIX_PLACEHOLDER,
  refresh: memoryKvKeys.ADMIN_MEMORY_KV_REFRESH,
  deletePrefix: memoryKvKeys.ADMIN_MEMORY_KV_DELETE_PREFIX,
  clearAll: memoryKvKeys.ADMIN_MEMORY_KV_CLEAR_ALL,
  count: memoryKvKeys.ADMIN_MEMORY_KV_COUNT,
  colKey: memoryKvKeys.ADMIN_MEMORY_KV_COL_KEY,
  colTtl: memoryKvKeys.ADMIN_MEMORY_KV_COL_TTL,
  colBytes: memoryKvKeys.ADMIN_MEMORY_KV_COL_BYTES,
  colValue: memoryKvKeys.ADMIN_MEMORY_KV_COL_VALUE,
  colActions: memoryKvKeys.ADMIN_MEMORY_KV_COL_ACTIONS,
  ttlNever: memoryKvKeys.ADMIN_MEMORY_KV_TTL_NEVER,
  delete: memoryKvKeys.ADMIN_MEMORY_KV_DELETE,
  expand: memoryKvKeys.ADMIN_MEMORY_KV_EXPAND,
  collapse: memoryKvKeys.ADMIN_MEMORY_KV_COLLAPSE,
  empty: memoryKvKeys.ADMIN_MEMORY_KV_EMPTY,
  forbidden: memoryKvKeys.ADMIN_MEMORY_KV_FORBIDDEN,
  loadFailed: memoryKvKeys.ADMIN_MEMORY_KV_LOAD_FAILED,
  deleteFailed: memoryKvKeys.ADMIN_MEMORY_KV_DELETE_FAILED,
  confirmDelete: memoryKvKeys.ADMIN_MEMORY_KV_CONFIRM_DELETE,
  confirmPrefix: memoryKvKeys.ADMIN_MEMORY_KV_CONFIRM_PREFIX,
  confirmClear: memoryKvKeys.ADMIN_MEMORY_KV_CONFIRM_CLEAR,
  prefixRequired: memoryKvKeys.ADMIN_MEMORY_KV_PREFIX_REQUIRED,
  loading: memoryKvKeys.ADMIN_MEMORY_KV_LOADING
});

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

export const adminSettings18n = Object.freeze({
  title: settingsKeys.ADMIN_SETTINGS_TITLE,
  description: settingsKeys.ADMIN_SETTINGS_DESCRIPTION,
  content: settingsKeys.ADMIN_SETTINGS_DESCRIPTION,
  keywords: settingsKeys.ADMIN_SETTINGS_KEYWORDS,
  sectionAuth: settingsKeys.ADMIN_SETTINGS_SECTION_AUTH,
  sectionAuthDesc: settingsKeys.ADMIN_SETTINGS_SECTION_AUTH_DESC,
  sectionOpenai: settingsKeys.ADMIN_SETTINGS_SECTION_OPENAI,
  sectionOpenaiDesc: settingsKeys.ADMIN_SETTINGS_SECTION_OPENAI_DESC,
  sectionApi: settingsKeys.ADMIN_SETTINGS_SECTION_API,
  sectionApiDesc: settingsKeys.ADMIN_SETTINGS_SECTION_API_DESC,
  loading: settingsKeys.ADMIN_SETTINGS_LOADING,
  save: settingsKeys.ADMIN_SETTINGS_SAVE,
  saving: settingsKeys.ADMIN_SETTINGS_SAVING,
  secretHint: settingsKeys.ADMIN_SETTINGS_SECRET_HINT,
  loadFailed: settingsKeys.ADMIN_SETTINGS_LOAD_FAILED,
  saveFailed: settingsKeys.ADMIN_SETTINGS_SAVE_FAILED,
  saveSuccess: settingsKeys.ADMIN_SETTINGS_SAVE_SUCCESS,
  sourceDb: settingsKeys.ADMIN_SETTINGS_SOURCE_DB,
  sourceDefault: settingsKeys.ADMIN_SETTINGS_SOURCE_DEFAULT,
  corsOrigin: settingsKeys.ADMIN_SETTINGS_CORS_ORIGIN,
  corsPath: settingsKeys.ADMIN_SETTINGS_CORS_PATH,
  corsMethods: settingsKeys.ADMIN_SETTINGS_CORS_METHODS,
  corsAdd: settingsKeys.ADMIN_SETTINGS_CORS_ADD,
  corsRemove: settingsKeys.ADMIN_SETTINGS_CORS_REMOVE,
  corsEmpty: settingsKeys.ADMIN_SETTINGS_CORS_EMPTY,
  corsOriginInvalid: settingsKeys.ADMIN_SETTINGS_CORS_ORIGIN_INVALID,
  corsDuplicate: settingsKeys.ADMIN_SETTINGS_CORS_DUPLICATE
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
