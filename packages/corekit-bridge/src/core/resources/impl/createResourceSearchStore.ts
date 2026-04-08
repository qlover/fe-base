import type { GatewayServiceName } from '../../gateway-service/impl/GatewayService';
import type { StoreUpdateValue } from '../../store-state';
import type { ResourceSearchParams } from '../interfaces/ResourceSearchInterface';
import type { ResourceSearchStoreStateOptions } from './ResourceSearchStore';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';

/**
 * Return an existing {@link ResourceSearchStore} or create one with `defaultState` built from optional seed options.
 *
 * @param resourceName - Namespaced store id (usually matches {@link GatewayServiceName} / `serviceName`)
 * @param store - Pass a ready-made store, or a partial {@link ResourceSearchStoreStateOptions} to seed
 *   {@link ResourceSearchStoreState} via `defaultState`
 * @returns A concrete {@link ResourceSearchStore} instance
 *
 * @example Share one store between tests and production wiring
 * ```typescript
 * const store = createResourceSearchStore('feed', { criteria: { pageSize: 20 }, stageRefs: [] });
 * const scroll = new ResourceScroll(gateway, { store });
 * ```
 */
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
