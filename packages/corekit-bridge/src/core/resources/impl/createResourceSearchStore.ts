import type { GatewayServiceName } from '../../gateway-service/impl/GatewayService';
import type { StoreUpdateValue } from '../../store-state';
import type { ResourceSearchParams } from '../interfaces/ResourceSearchInterface';
import type {
  ResourceSearchStoreStateOptions} from './ResourceSearchStore';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';

export function createResourceSearchStore<
  TItem,
  Criteria extends ResourceSearchParams
>(
  resourceName: GatewayServiceName,
  store?:
    | ResourceSearchStore<TItem, Criteria>
    | StoreUpdateValue<ResourceSearchStoreStateOptions<TItem, Criteria>>
): ResourceSearchStore<TItem, Criteria> {
  if (store instanceof ResourceSearchStore) {
    return store;
  }

  return new ResourceSearchStore<TItem, Criteria>(resourceName, {
    defaultState: () => new ResourceSearchStoreState(store)
  });
}
