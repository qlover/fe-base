import type { ResourceInterface } from './ResourceInterface';
import type { ResourceQuery } from './ResourcesStore';

export interface ResourceEventCommonParams {
  resource?: ResourceInterface<unknown>;
}

export interface ResourceEventInterface {
  onCreated(params: ResourceEventCommonParams): void;
  onDeleted(params: ResourceEventCommonParams): void;
  onDetail(params: ResourceEventCommonParams): void;
  onEdited(params: ResourceEventCommonParams): void;

  onChangeParams(params: ResourceEventCommonParams & ResourceQuery): void;
}
