import type {
  ResourceServiceInterface,
  ResourceQuery
} from '@qlover/corekit-bridge';

export interface AdminTableEventCommonParams {
  resource?: ResourceServiceInterface<unknown>;
  dataSource?: unknown;
}

export interface AdminTableEventInterface {
  onCreated(params: AdminTableEventCommonParams): void;
  onDeleted(params: AdminTableEventCommonParams): void;
  onDetail(params: AdminTableEventCommonParams): void;
  onEdited(params: AdminTableEventCommonParams): void;
  onRefresh(params: AdminTableEventCommonParams): void;

  onChangeParams(params: AdminTableEventCommonParams & ResourceQuery): void;
}
