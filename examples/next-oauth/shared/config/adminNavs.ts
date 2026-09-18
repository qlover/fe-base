import {
  PermissionKey,
  type AppPermissionKey
} from '@shared/auth/permissionKeys';
import {
  COMMON_ADMIN_NAV_DASHBOARD,
  COMMON_ADMIN_NAV_REQUEST_LOGS,
  COMMON_ADMIN_NAV_ROLES,
  COMMON_ADMIN_NAV_USER_MANAGEMENT
} from '@config/i18n-identifier/common/common';
import { ROUTE_ADMIN_ROLES, ROUTE_REQUEST_LOGS } from './route';

export type NavItemPaths =
  | 'admin'
  | 'admin/users'
  | 'admin/roles'
  | 'admin/request-logs';

export interface NavItemInterface {
  key: string;
  i18nKey: string;
  pathname: `/${NavItemPaths}`;
  /** When set, sidebar hides the item unless the session has this permission. */
  permissionKey?: AppPermissionKey;
}

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
    key: 'request-logs',
    i18nKey: COMMON_ADMIN_NAV_REQUEST_LOGS,
    pathname: ROUTE_REQUEST_LOGS,
    permissionKey: PermissionKey.admin_request_logs_read
  }
];
