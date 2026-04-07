import type { StoreInterface } from '../../store-state';
import type {
  ResourceOptions,
  ResourceSearchParams,
  ResourceSearchResult
} from '../interfaces/ResourceSearchInterface';
import type { ResourceScrollInterface } from '../interfaces/ResourceScrollInterface';
import type { ResourceSearchStoreStateOptions } from './ResourceSearchStore';
import {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';

/**
 * Wraps {@link ResourceScrollInterface} with async store state: {@link ResourceSearchStoreState.result} holds the
 * last window; {@link ResourceSearchStoreState.criteria} tracks the request used for {@link ResourceScroll.refresh},
 * {@link ResourceScroll.loadFirst}, and {@link ResourceScroll.loadNext} when arguments are omitted.
 *
 * @remarks
 * This class implements {@link ResourceScrollInterface} on the outside but **only calls**
 * {@link ResourceScrollInterface.search} on the inner `resource`. Custom logic on the inner adapter’s
 * `loadNext` / `loadFirst` / `refresh` is **not** invoked; scroll semantics are driven by this wrapper’s criteria
 * normalization and stored state.
 */
export class ResourceScroll<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
> implements ResourceScrollInterface<TItem, Criteria> {
  protected readonly resourceName: string;
  protected readonly store: ResourceSearchStore<TItem, Criteria>;
  protected readonly resource: ResourceScrollInterface<TItem, Criteria>;

  constructor(
    resourceName: string,
    resource: ResourceScrollInterface<TItem, Criteria>,
    store?: ResourceSearchStore<TItem, Criteria>
  );

  constructor(
    resourceName: string,
    resource: ResourceScrollInterface<TItem, Criteria>,
    defaultStateOptions?: ResourceSearchStoreStateOptions<TItem, Criteria>
  );

  constructor(
    resourceName: string,
    resource: ResourceScrollInterface<TItem, Criteria>,
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
   * Subscribe to scroll/search state: async lifecycle + {@link ResourceSearchStoreState.criteria}.
   */
  public getStoreInterface(): StoreInterface<
    ResourceSearchStoreState<TItem, Criteria>
  > {
    return this.store.getStore();
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
   * First window for the current scope. With `criteria`, normalizes to a fresh window (clears cursor, `page` → 1).
   * Without `criteria`, uses stored criteria from a prior call or constructor defaults.
   *
   * @override
   */
  public loadFirst(
    criteria?: Criteria,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    const base = criteria ?? this.requireStoredCriteria('loadFirst');
    const first = this.normalizeFirstWindowCriteria(base);
    const criteriaRollback = this.store.getState().criteria;
    this.store.setCriteria(first);
    return this.runSearch(first, resourceOptions, criteriaRollback);
  }

  /**
   * Next window. With `criteria`, runs that request and updates stored criteria on success. Without `criteria`,
   * advances from the last successful result (`nextCursor` or `page + 1` when `hasMore` is not `false`); stored
   * `criteria` is not advanced until the request succeeds (stays aligned with `result` if the call fails).
   *
   * @override
   */
  public loadNext(
    criteria?: Criteria,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    if (criteria != null) {
      const criteriaRollback = this.store.getState().criteria;
      this.store.setCriteria(criteria);
      return this.runSearch(criteria, resourceOptions, criteriaRollback);
    }
    const base = this.requireStoredCriteria('loadNext');
    const last = this.store.getState().result;
    const next = this.resolveNextCriteria(base, last);
    const criteriaRollback = this.store.getState().criteria;
    return this.runSearch(next, resourceOptions, criteriaRollback);
  }

  /**
   * Re-run the current request. With `criteria`, stores and runs it as-is. Without `criteria`, repeats the last stored
   * criteria (including cursor / page).
   *
   * @override
   */
  public refresh(
    criteria?: Criteria,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    if (criteria != null) {
      const criteriaRollback = this.store.getState().criteria;
      this.store.setCriteria(criteria);
      return this.runSearch(criteria, resourceOptions, criteriaRollback);
    }
    const stored = this.requireStoredCriteria('refresh');
    return this.runSearch(stored, resourceOptions, stored);
  }

  protected requireStoredCriteria(method: string): Criteria {
    const c = this.store.getState().criteria;
    if (c == null) {
      throw new Error(
        `ResourceScroll.${method}() requires criteria when none are stored; pass criteria, use search(criteria), or provide defaultCriteria via the store constructor.`
      );
    }
    return c;
  }

  /**
   * Derive a “first page” request: clear continuation and set `page` to **1** (1-based convention).
   * Zero-based page APIs must normalize in their own adapter or avoid relying on `page` for the first window.
   */
  protected normalizeFirstWindowCriteria(criteria: Criteria): Criteria {
    return {
      ...criteria,
      cursor: null,
      page: 1
    } as Criteria;
  }

  /**
   * Derive the next window from the last response and current stored criteria.
   */
  protected resolveNextCriteria(
    base: Criteria,
    lastWindow: ResourceSearchResult<TItem> | null | undefined
  ): Criteria {
    if (lastWindow == null) {
      throw new Error(
        'ResourceScroll.loadNext() needs a prior successful window in the store when criteria are omitted; call search(), loadFirst(), or loadNext(criteria) first.'
      );
    }
    const nextCursor = lastWindow.nextCursor;
    if (nextCursor != null && nextCursor !== '') {
      return { ...base, cursor: nextCursor } as Criteria;
    }
    if (lastWindow.hasMore === false) {
      throw new Error(
        'ResourceScroll.loadNext(): backend reports no further windows (hasMore is false).'
      );
    }
    const fromPage = lastWindow.page ?? base.page ?? 1;
    return {
      ...base,
      page: fromPage + 1,
      cursor: null
    } as Criteria;
  }

  /**
   * Commits `criteria` only after success; on failure restores `criteriaRollback` (same idea as {@link ResourceSearch}).
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
