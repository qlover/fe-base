import type { StoreInterface, StoreUpdateValue } from '../../store-state';
import type {
  ResourceOptions,
  ResourceSearchInterface,
  ResourceSearchParams,
  ResourceSearchResult
} from '../interfaces/ResourceSearchInterface';
import type { ResourceScrollInterface } from '../interfaces/ResourceScrollInterface';
import type { ResourceSearchStoreStateOptions } from './ResourceSearchStore';
import type {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';
import type { GatewayServiceOptions } from '../../gateway-service/impl/GatewayService';
import { GatewayService } from '../../gateway-service/impl/GatewayService';
import { isResourceSearchResultStrict } from '../ResourceSearchResult';
import { createResourceSearchStore } from './createResourceSearchStore';

export type ResourceScrollOptions<
  TItem,
  Criteria extends ResourceSearchParams
> = Omit<
  GatewayServiceOptions<
    ResourceSearchResult<TItem>,
    ResourceSearchInterface<TItem, Criteria>
  >,
  'store'
> & {
  store?:
    | ResourceSearchStore<TItem, Criteria>
    | StoreUpdateValue<ResourceSearchStoreStateOptions<TItem, Criteria>>;

  /**
   * Overrides the default response guard ({@link isResourceSearchResultStrict}). When omitted, every successful response
   * is validated with `isResourceSearchResultStrict` before the store commits; failure rejects like a bad payload.
   * Pass `isResourceSearchResult` from `ResourceSearchResult.ts` for a looser shape check, or a custom guard.
   */
  isResourceSearchResult?: (
    value: unknown
  ) => value is ResourceSearchResult<TItem>;
};

/**
 * Wraps {@link ResourceScrollInterface} with async store state: {@link ResourceSearchStoreState.result} holds the
 * last window; {@link ResourceSearchStoreState.criteria} tracks the request used for {@link ResourceScroll.refresh},
 * {@link ResourceScroll.loadFirst}, and {@link ResourceScroll.loadNext} when arguments are omitted.
 *
 * @since 3.1.0
 * @remarks
 * This class implements {@link ResourceScrollInterface} on the outside but **only calls**
 * {@link ResourceSearchInterface.search} on the inner `resource` (typed as {@link ResourceSearchInterface}).
 * Adapters that also implement {@link ResourceScrollInterface} are accepted; any custom `loadNext` / `loadFirst` /
 * `refresh` on the inner object is **not** invoked—scroll semantics are driven by this wrapper’s criteria
 * normalization and stored state.
 *
 * @example First page then infinite append
 * ```typescript
 * const feed = new ResourceScroll(api, { serviceName: 'feed' });
 * await feed.loadFirst({ pageSize: 10, keyword: 'ts' });
 * await feed.loadNext(); // uses nextCursor or page+1 from the last result
 * await feed.refresh(); // same slice/cursor as last successful request
 * ```
 */
export class ResourceScroll<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
>
  extends GatewayService<
    ResourceSearchResult<TItem>,
    ResourceSearchStore<TItem, Criteria>,
    ResourceSearchInterface<TItem, Criteria>
  >
  implements ResourceScrollInterface<TItem, Criteria>
{
  private readonly searchResultGuard: (
    value: unknown
  ) => value is ResourceSearchResult<TItem>;

  /**
   * @param resource - Gateway exposing at least {@link ResourceSearchInterface.search}; extra scroll methods on the
   *   same object are **not** called by this wrapper (see class remarks).
   * @param options - Same shape as {@link ResourceSearch} (`serviceName`, store seed, response guard, logger)
   */
  constructor(
    resource: ResourceSearchInterface<TItem, Criteria>,
    options?: Partial<ResourceScrollOptions<TItem, Criteria>>
  ) {
    if (!resource) {
      throw new Error(
        'ResourceScroll.constructor() requires a resource; pass a resource to the constructor.'
      );
    }
    super({
      serviceName: options?.serviceName ?? 'resourceScroll',
      logger: options?.logger,
      gateway: resource,
      store: createResourceSearchStore(
        options?.serviceName ?? 'resourceScroll',
        options?.store
      )
    });
    this.searchResultGuard =
      options?.isResourceSearchResult ??
      (isResourceSearchResultStrict as (
        value: unknown
      ) => value is ResourceSearchResult<TItem>);
  }

  /**
   * @override
   */
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
    return this.runSearch(
      criteria,
      resourceOptions,
      criteriaRollback,
      'search'
    );
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
    return this.runSearch(
      first,
      resourceOptions,
      criteriaRollback,
      'loadFirst'
    );
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
      return this.runSearch(
        criteria,
        resourceOptions,
        criteriaRollback,
        'loadNext'
      );
    }
    const base = this.requireStoredCriteria('loadNext');
    const last = this.store.getState().result;
    const next = this.resolveNextCriteria(base, last);
    const criteriaRollback = this.store.getState().criteria;
    return this.runSearch(next, resourceOptions, criteriaRollback, 'loadNext');
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
      return this.runSearch(
        criteria,
        resourceOptions,
        criteriaRollback,
        'refresh'
      );
    }
    const stored = this.requireStoredCriteria('refresh');
    return this.runSearch(stored, resourceOptions, stored, 'refresh');
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
    criteriaRollback: Criteria | null,
    operation: 'search' | 'loadFirst' | 'loadNext' | 'refresh'
  ): Promise<ResourceSearchResult<TItem>> {
    const gateway = this.getGateway();
    if (gateway == null) {
      throw new Error(
        'ResourceScroll.runSearch() requires a gateway; pass a gateway to the constructor or search(criteria, resourceOptions).'
      );
    }
    this.store.start();

    return gateway
      .search(criteria, resourceOptions)
      .then((result) => {
        if (!this.searchResultGuard(result)) {
          const msg = `${String(this.serviceName)} ResourceScroll.${operation}: invalid response (isResourceSearchResult)`;
          this.logger?.error(msg, result);
          throw new Error(msg);
        }
        this.store.setCriteria(criteria);
        this.store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} ResourceScroll.${operation}: success`,
          result
        );
        return result;
      })
      .catch((error) => {
        this.store.setCriteria(criteriaRollback);
        this.store.failed(error);
        this.logger?.debug(
          `${String(this.serviceName)} ResourceScroll.${operation}: failed`,
          error
        );
        throw error;
      });
  }
}
