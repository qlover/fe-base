import { COMMON_ADMIN_NAV_DASHBOARD } from '@config/i18n-identifier/common/common';

export type NavItemPaths = 'admin';

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
  }
];
