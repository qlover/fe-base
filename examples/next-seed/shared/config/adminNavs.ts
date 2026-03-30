import {
  COMMON_ADMIN_NAV_DASHBOARD,
  COMMON_ADMIN_NAV_REQUEST_LOGS,
  COMMON_ADMIN_NAV_USER_MANAGEMENT
} from '@config/i18n-identifier/common/common';

export type NavItemPaths = 'admin' | 'admin/users' | 'admin/request-logs';

export interface NavItemInterface {
  key: string;
  i18nKey: string;
  pathname: `/${NavItemPaths}`;
}

export const defaultNavItems: NavItemInterface[] = [
  {
    key: 'dashboard',
    i18nKey: COMMON_ADMIN_NAV_DASHBOARD,
    pathname: '/admin'
  },
  {
    key: 'users',
    i18nKey: COMMON_ADMIN_NAV_USER_MANAGEMENT,
    pathname: '/admin/users'
  },
  {
    key: 'request-logs',
    i18nKey: COMMON_ADMIN_NAV_REQUEST_LOGS,
    pathname: '/admin/request-logs'
  }
];
