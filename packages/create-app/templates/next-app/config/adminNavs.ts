import type { NavItemInterface } from '@/base/port/AdminLayoutInterface';

export const defaultNavItems: NavItemInterface[] = [
  {
    key: 'dashboard',
    i18nKey: 'Dashboard',
    pathname: '/admin'
  },
  {
    key: 'users',
    i18nKey: 'User Management',
    pathname: '/admin/users'
  },
  {
    key: 'locales',
    i18nKey: 'Locales',
    pathname: '/admin/locales'
  }
];
