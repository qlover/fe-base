import type { ResourceState } from '@/base/cases/ResourceState';
import * as i18nKeys from '@config/Identifier/common/admint.table';
import {
  AdminTableEventAction,
  type AdminTableEventState
} from './AdminTableEventInterface';

export const adminTableHeaderI18n = {
  create: i18nKeys.COMMON_ADMIN_TABLE_CREATE,
  refresh: i18nKeys.COMMON_ADMIN_TABLE_REFRESH,
  search: i18nKeys.COMMON_ADMIN_TABLE_SEARCH,
  reset: i18nKeys.COMMON_ADMIN_TABLE_RESET,
  export: i18nKeys.COMMON_ADMIN_TABLE_EXPORT,
  settings: i18nKeys.COMMON_ADMIN_TABLE_SETTINGS
} as const;

export const adminTableI18n = {
  ...adminTableHeaderI18n,
  action: i18nKeys.COMMON_ADMIN_TABLE_ACTION,
  editText: i18nKeys.COMMON_ADMIN_TABLE_EDIT,
  deleteText: i18nKeys.COMMON_ADMIN_TABLE_DELETE,
  detailText: i18nKeys.COMMON_ADMIN_TABLE_DETAIL
} as const;

export type AdminTableHeaderI18n = typeof adminTableHeaderI18n;
export type AdminTableI18n = typeof adminTableI18n;

export const resourceSelectors = {
  searchParams: (state: ResourceState) => state.searchParams,
  listState: (state: ResourceState) => state.listState,
  listLoading: (state: ResourceState) => state.listState.loading
} as const;

export const eventSelectos = {
  action: (state: AdminTableEventState) => state.action,
  createState: (state: AdminTableEventState) => state.createState,
  createLoading: (state: AdminTableEventState) => state.createState.loading,
  editState: (state: AdminTableEventState) => state.editState,
  editLoading: (state: AdminTableEventState) => state.editState.loading,
  openPopup: (state: AdminTableEventState) => state.openPopup,
  isCreate: (state: AdminTableEventState) =>
    state.action === AdminTableEventAction.CREATE
} as const;
