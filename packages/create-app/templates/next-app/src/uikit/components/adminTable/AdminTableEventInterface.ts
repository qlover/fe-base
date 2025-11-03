import { RequestState } from '@qlover/corekit-bridge';
import type { ResourceState } from '@/base/cases/ResourceState';
import type {
  ResourceServiceInterface,
  ResourceQuery,
  StoreStateInterface,
  StoreInterface,
  LifecycleInterface,
  ResourceStore
} from '@qlover/corekit-bridge';

export interface AdminTableEventCommonParams {
  resource?: ResourceServiceInterface<unknown>;
  dataSource?: unknown;
}

export const AdminTableEventAction = Object.freeze({
  CREATE: 'create',
  DELETE: 'delete',
  DETAIL: 'detail',
  EDIT: 'edit',
  REFRESH: 'refresh'
});

export type AdminTableEventActionType =
  (typeof AdminTableEventAction)[keyof typeof AdminTableEventAction];

export class AdminTableEventState implements StoreStateInterface {
  selectedResource?: unknown;
  action: AdminTableEventActionType | undefined;
  openPopup: boolean = false;

  createState = new RequestState<unknown>();
  deleteState = new RequestState<unknown>();
  editState = new RequestState<unknown>();
}

export interface AdminTableEventInterface extends LifecycleInterface {
  readonly namespace: string;
  readonly store: StoreInterface<AdminTableEventState>;

  getResource(): ResourceServiceInterface<
    unknown,
    ResourceStore<ResourceState>
  >;

  onCreated(params: AdminTableEventCommonParams): void;
  onDeleted(params: AdminTableEventCommonParams): void;
  onDetail(params: AdminTableEventCommonParams): void;
  onEdited(params: AdminTableEventCommonParams): void;
  onRefresh(params: AdminTableEventCommonParams): void;
  onChangeParams(params: AdminTableEventCommonParams & ResourceQuery): void;
  onClosePopup(): void;
  onSubmit(values: unknown): Promise<unknown>;
}
