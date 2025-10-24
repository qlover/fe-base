import * as i18nKeys from '@config/Identifier/page.admin';

export const adminTableHeaderI18n = {
  create: i18nKeys.ADMIN_TABLE_HEADER_CREATE,
  refresh: i18nKeys.ADMIN_TABLE_HEADER_REFRESH,
  search: i18nKeys.ADMIN_TABLE_HEADER_SEARCH,
  reset: i18nKeys.ADMIN_TABLE_HEADER_RESET,
  export: i18nKeys.ADMIN_TABLE_HEADER_EXPORT,
  settings: i18nKeys.ADMIN_TABLE_HEADER_SETTINGS
} as const;

export const adminTableI18n = {
  ...adminTableHeaderI18n
} as const;

export type AdminTableHeaderI18n = typeof adminTableHeaderI18n;
export type AdminTableI18n = typeof adminTableI18n;
