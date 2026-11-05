import {
  PermissionKey,
  type AppPermissionKey
} from '@shared/auth/permissionKeys';
import {
  COMMON_ADMIN_NAV_DASHBOARD,
  COMMON_ADMIN_NAV_LOCALES,
  COMMON_ADMIN_NAV_FEEDBACK,
  COMMON_ADMIN_NAV_MAIL_LOGS,
  COMMON_ADMIN_NAV_MEMORY_KV,
  COMMON_ADMIN_NAV_OTP_MONITOR,
  COMMON_ADMIN_NAV_PERMISSIONS,
  COMMON_ADMIN_NAV_REQUEST_LOGS,
  COMMON_ADMIN_NAV_ROLES,
  COMMON_ADMIN_NAV_SETTINGS,
  COMMON_ADMIN_NAV_USER_MANAGEMENT
} from '@config/i18n-identifier/common/common';
import {
  ROUTE_ADMIN_FEEDBACK,
  ROUTE_ADMIN_LOCALES,
  ROUTE_ADMIN_MAIL_LOGS,
  ROUTE_ADMIN_MEMORY_KV,
  ROUTE_ADMIN_OTP_MONITOR,
  ROUTE_ADMIN_PERMISSIONS,
  ROUTE_ADMIN_ROLES,
  ROUTE_ADMIN_SETTINGS,
  ROUTE_REQUEST_LOGS
} from './route';

export type NavItemPaths =
  | 'admin'
  | 'admin/users'
  | 'admin/roles'
  | 'admin/permissions'
  | 'admin/otp-monitor'
  | 'admin/memory-kv'
  | 'admin/locales'
  | 'admin/settings'
  | 'admin/mail-logs'
  | 'admin/feedback'
  | 'admin/request-logs';

export interface NavItemInterface {
  key: string;
  i18nKey: string;
  pathname: `/${NavItemPaths}`;
  /** When set, sidebar hides the item unless the session has this permission. */
  permissionKey?: AppPermissionKey;
}

/** Admin 首页快捷入口顺序（按 key 过滤当前用户有权限的项）。 */
export const ADMIN_HOME_SHORTCUT_KEYS = [
  'users',
  'roles',
  'permissions',
  'settings',
  'request-logs',
  'mail-logs',
  'feedback'
] as const;

export const defaultNavItems: NavItemInterface[] = [
  {
    key: 'dashboard',
    i18nKey: COMMON_ADMIN_NAV_DASHBOARD,
    pathname: '/admin',
    permissionKey: PermissionKey.admin_site_settings_read
  },
  {
    key: 'users',
    i18nKey: COMMON_ADMIN_NAV_USER_MANAGEMENT,
    pathname: '/admin/users',
    permissionKey: PermissionKey.admin_users_read
  },
  {
    key: 'roles',
    i18nKey: COMMON_ADMIN_NAV_ROLES,
    pathname: ROUTE_ADMIN_ROLES,
    permissionKey: PermissionKey.admin_roles_read
  },
  {
    key: 'permissions',
    i18nKey: COMMON_ADMIN_NAV_PERMISSIONS,
    pathname: ROUTE_ADMIN_PERMISSIONS,
    permissionKey: PermissionKey.admin_permissions_read
  },
  {
    key: 'otp-monitor',
    i18nKey: COMMON_ADMIN_NAV_OTP_MONITOR,
    pathname: ROUTE_ADMIN_OTP_MONITOR,
    permissionKey: PermissionKey.admin_otp_monitor_read
  },
  {
    key: 'memory-kv',
    i18nKey: COMMON_ADMIN_NAV_MEMORY_KV,
    pathname: ROUTE_ADMIN_MEMORY_KV,
    permissionKey: PermissionKey.admin_memory_kv_read
  },
  {
    key: 'locales',
    i18nKey: COMMON_ADMIN_NAV_LOCALES,
    pathname: ROUTE_ADMIN_LOCALES,
    permissionKey: PermissionKey.admin_locales_read
  },
  {
    key: 'settings',
    i18nKey: COMMON_ADMIN_NAV_SETTINGS,
    pathname: ROUTE_ADMIN_SETTINGS,
    permissionKey: PermissionKey.admin_site_settings_read
  },
  {
    key: 'mail-logs',
    i18nKey: COMMON_ADMIN_NAV_MAIL_LOGS,
    pathname: ROUTE_ADMIN_MAIL_LOGS,
    permissionKey: PermissionKey.admin_mail_logs_read
  },
  {
    key: 'feedback',
    i18nKey: COMMON_ADMIN_NAV_FEEDBACK,
    pathname: ROUTE_ADMIN_FEEDBACK,
    permissionKey: PermissionKey.admin_feedback_read
  },
  {
    key: 'request-logs',
    i18nKey: COMMON_ADMIN_NAV_REQUEST_LOGS,
    pathname: ROUTE_REQUEST_LOGS,
    permissionKey: PermissionKey.admin_request_logs_read
  }
];
