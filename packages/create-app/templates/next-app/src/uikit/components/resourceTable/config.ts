import { ResourceTableEventAction } from './ResourceTableEventInterface';
import type { ResourceTableState } from './ResourceEventStroe';
import type {
  AsyncStateInterface,
  ResourceStateInterface
} from '@qlover/corekit-bridge';

export type ResourceTableHeaderI18n = {
  create: string;
  refresh: string;
  search: string;
  reset: string;
  export: string;
  settings: string;
};

export type ResourceTableI18n = ResourceTableHeaderI18n & {
  action: string;
  editText: string;
  deleteText: string;
  detailText: string;
};

export interface ResourceTableActionI18n {
  editText: string;
  deleteText: string;
  detailText: string;
}

export interface ResourceTableLocales {
  readonly title: string;
  readonly description: string;
  readonly content: string;
  readonly keywords: string;
  readonly createTitle: string;
  readonly editTitle: string;
  readonly detailTitle: string;
  readonly deleteTitle: string;
  readonly deleteContent: string;
  readonly saveButton: string;
  readonly detailButton: string;
  readonly cancelButton: string;
  readonly createButton: string;
  readonly importTitle: string;
  readonly importZhTitle: string;
  readonly importEnTitle: string;
}

// TODO: need move to corekit-bridge
interface PaginationInterface<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export const resourceSelectors = {
  searchParams: (state: ResourceStateInterface) => state.searchParams,
  listState: (state: ResourceStateInterface) =>
    state.listState as AsyncStateInterface<PaginationInterface<unknown>>,
  listLoading: (state: ResourceStateInterface) => state.listState.loading
} as const;

export const eventSelectos = {
  action: (state: ResourceTableState) => state.action,
  createState: (state: ResourceTableState) => state.createState,
  createLoading: (state: ResourceTableState) => state.createState.loading,
  editState: (state: ResourceTableState) => state.editState,
  editLoading: (state: ResourceTableState) => state.editState.loading,
  openPopup: (state: ResourceTableState) => state.openPopup,
  isCreate: (state: ResourceTableState) =>
    state.action === ResourceTableEventAction.CREATE
} as const;
