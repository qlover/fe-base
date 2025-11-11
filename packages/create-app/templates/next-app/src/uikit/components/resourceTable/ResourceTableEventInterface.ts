import type { ResourceTableState } from './ResourceEventStroe';
import type {
  ResourceServiceInterface,
  ResourceQuery,
  StoreInterface,
  LifecycleInterface,
  ResourceStore,
  ResourceStateInterface
} from '@qlover/corekit-bridge';

export interface ResourceTableEventCommonParams {
  resource?: ResourceServiceInterface<unknown>;
  dataSource?: unknown;
}

export const ResourceTableEventAction = Object.freeze({
  CREATE: 'create',
  DELETE: 'delete',
  DETAIL: 'detail',
  EDIT: 'edit',
  REFRESH: 'refresh'
});

export type ResourceTableEventActionType =
  (typeof ResourceTableEventAction)[keyof typeof ResourceTableEventAction];

export interface ResourceTableEventInterface extends LifecycleInterface {
  readonly namespace: string;
  readonly store: StoreInterface<ResourceTableState>;

  getResource(): ResourceServiceInterface<
    unknown,
    ResourceStore<ResourceStateInterface>
  >;

  onCreated(params: ResourceTableEventCommonParams): void;
  onDeleted(params: ResourceTableEventCommonParams): void;
  onDetail(params: ResourceTableEventCommonParams): void;
  onEdited(params: ResourceTableEventCommonParams): void;
  onRefresh(params: ResourceTableEventCommonParams): void;
  onChangeParams(params: ResourceTableEventCommonParams & ResourceQuery): void;
  onClosePopup(): void;
  onSubmit(values: unknown): Promise<unknown>;
}
