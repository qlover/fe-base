import type { StoreInterface } from '../../store-state';
import type {
  ResourceOptions,
  ResourceSearchInterface,
  ResourceSearchParams,
  ResourceSearchResult
} from '../interfaces/ResourceSearchInterface';
import type { ResourceSearchStoreStateOptions } from './ResourceSearchStore';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';

/**
 * Wraps {@link ResourceSearchInterface} with async store state. {@link ResourceSearchStoreState.result} holds the last
 * {@link ResourceSearchResult} (including `items`); {@link ResourceSearchStoreState.criteria} holds query params for
 * {@link ResourceSearch.refresh} and incremental updates via {@link ResourceSearchStore.patchCriteria} on {@link ResourceSearch.getStore}.
 */
export class ResourceSearch<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
> implements ResourceSearchInterface<TItem, Criteria> {
  protected readonly resourceName: string;
  protected readonly store: ResourceSearchStore<TItem, Criteria>;
  protected readonly resource: ResourceSearchInterface<TItem, Criteria>;

  constructor(
    resourceName: string,
    resource: ResourceSearchInterface<TItem, Criteria>,
    store?: ResourceSearchStore<TItem, Criteria>
  );

  constructor(
    resourceName: string,
    resource: ResourceSearchInterface<TItem, Criteria>,
    defaultStateOptions?: ResourceSearchStoreStateOptions<TItem, Criteria>
  );

  constructor(
    resourceName: string,
    resource: ResourceSearchInterface<TItem, Criteria>,
    store?:
      | ResourceSearchStore<TItem, Criteria>
      | ResourceSearchStoreStateOptions<TItem, Criteria>
  ) {
    this.resourceName = resourceName;
    this.resource = resource;

    if (store instanceof ResourceSearchStore) {
      this.store = store;
    } else {
      this.store = new ResourceSearchStore<TItem, Criteria>(resourceName, {
        defaultState: () => new ResourceSearchStoreState(store)
      });
    }
  }

  public getStore(): ResourceSearchStore<TItem, Criteria> {
    return this.store;
  }

  /**
   * Subscribe to full search state: async lifecycle + {@link ResourceSearchStoreState.criteria}.
   */
  public getStoreInterface(): StoreInterface<
    ResourceSearchStoreState<TItem, Criteria>
  > {
    return this.store.getStore();
  }

  /**
   * Re-run {@link ResourceSearchInterface.search} with {@link ResourceSearchStoreState.criteria}.
   *
   * @throws When no criteria have been set (constructor `defaultCriteria`, {@link setCriteria}, or a prior {@link search}).
   */
  public refresh(
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    const criteria = this.store.getState().criteria;
    if (criteria == null) {
      throw new Error(
        'ResourceSearch.refresh() requires criteria; pass defaultCriteria to the constructor, call setCriteria(), or search(criteria) first.'
      );
    }
    return this.runSearch(criteria, resourceOptions, criteria);
  }

  /**
   * @override
   */
  public search(
    criteria: Criteria,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    const criteriaRollback = this.store.getState().criteria;
    this.store.setCriteria(criteria);
    return this.runSearch(criteria, resourceOptions, criteriaRollback);
  }

  /**
   * Commits `criteria` only after a successful response; on failure restores `criteriaRollback` so
   * {@link ResourceSearchStoreState.criteria} stays aligned with the last successful {@link ResourceSearchStoreState.result}.
   */
  protected runSearch(
    criteria: Criteria,
    resourceOptions: ResourceOptions | undefined,
    criteriaRollback: Criteria | null
  ): Promise<ResourceSearchResult<TItem>> {
    this.store.start();

    return this.resource
      .search(criteria, resourceOptions)
      .then((result) => {
        this.store.setCriteria(criteria);
        this.store.success(result);
        return result;
      })
      .catch((error) => {
        this.store.setCriteria(criteriaRollback);
        this.store.failed(error);
        throw error;
      });
  }
}
