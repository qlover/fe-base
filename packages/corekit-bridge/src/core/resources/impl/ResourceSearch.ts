import type { GatewayServiceOptions } from '../../gateway-service/impl/GatewayService';
import { GatewayService } from '../../gateway-service/impl/GatewayService';
import type { StoreInterface, StoreUpdateValue } from '../../store-state';
import type {
  ResourceOptions,
  ResourceSearchInterface,
  ResourceSearchParams,
  ResourceSearchResult
} from '../interfaces/ResourceSearchInterface';
import { isResourceSearchResultStrict } from '../ResourceSearchResult';
import { createResourceSearchStore } from './createResourceSearchStore';
import type { ResourceSearchStoreStateOptions } from './ResourceSearchStore';
import type {
  ResourceSearchStore,
  ResourceSearchStoreState
} from './ResourceSearchStore';

export type ResourceSearchOptions<
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
 * Wraps {@link ResourceSearchInterface} with async store state. {@link ResourceSearchStoreState.result} holds the last
 * {@link ResourceSearchResult} (including `items`); {@link ResourceSearchStoreState.criteria} holds query params for
 * {@link ResourceSearch.refresh} and incremental updates via {@link ResourceSearchStore.patchCriteria} on {@link ResourceSearch.getStore}.
 *
 * @since 3.1.0
 * @remarks
 * - {@link search} **replaces** stored criteria with the argument snapshot before calling the gateway.
 * - {@link refresh} optionally **shallow-merges** a `Partial<Criteria>`; omit the argument to repeat the last snapshot.
 *
 * @example Table: full criteria on filter change, partial merge on page size change
 * ```typescript
 * const list = new ResourceSearch(gateway, { serviceName: 'orders' });
 * await list.search({ page: 1, pageSize: 20, keyword: 'paid' });
 * await list.refresh({ pageSize: 50 }); // keeps keyword, resets page when size changes (see implementation)
 * ```
 */
export class ResourceSearch<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
>
  extends GatewayService<
    ResourceSearchResult<TItem>,
    ResourceSearchStore<TItem, Criteria>,
    ResourceSearchInterface<TItem, Criteria>
  >
  implements ResourceSearchInterface<TItem, Criteria>
{
  private readonly isResourceSearchResult: (
    value: unknown
  ) => value is ResourceSearchResult<TItem>;

  /**
   * @param resource - Bare {@link ResourceSearchInterface} implementation
   * @param options - `serviceName`, logger, optional {@link ResourceSearchStore} / state seed, custom
   *   {@link ResourceSearchOptions.isResourceSearchResult} guard
   */
  constructor(
    resource: ResourceSearchInterface<TItem, Criteria>,
    options?: Partial<ResourceSearchOptions<TItem, Criteria>>
  ) {
    if (!resource) {
      throw new Error(
        'ResourceSearch.constructor() requires a resource; pass a resource to the constructor.'
      );
    }
    const serviceName = options?.serviceName ?? 'resourceSearch';
    super({
      serviceName: serviceName,
      logger: options?.logger,
      gateway: resource,
      store: createResourceSearchStore(serviceName, options?.store)
    });
    this.isResourceSearchResult =
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
   * Subscribe to full search state: async lifecycle + {@link ResourceSearchStoreState.criteria}.
   */
  public getStoreInterface(): StoreInterface<
    ResourceSearchStoreState<TItem, Criteria>
  > {
    return this.store.getStore();
  }

  /**
   * Same parameter shape as {@link ResourceScrollInterface.refresh}: optional criteria, optional {@link ResourceOptions}.
   *
   * **Unlike** {@link ResourceScroll.refresh}: when `criteriaPatch` is provided it is **`Partial<Criteria>`** and
   * **shallow-merged** via {@link ResourceSearchStore.patchCriteria} (omit keys stay as in the store). When omitted,
   * repeats the current stored snapshot. When both `page` and `pageSize` are numbers in the patch, and `pageSize` changes
   * vs the previous criteria or last result, `page` is forced to `1` before the merge (typical table UX).
   *
   * @throws When no criteria have been set (constructor `defaultCriteria`, {@link setCriteria}, or a prior {@link search}).
   */
  public refresh(
    criteriaPatch?: Partial<Criteria>,
    resourceOptions?: ResourceOptions
  ): Promise<ResourceSearchResult<TItem>> {
    const criteriaRollback = this.store.getState().criteria;
    if (criteriaRollback == null) {
      throw new Error(
        'ResourceSearch.refresh() requires criteria; pass defaultCriteria to the constructor, call setCriteria(), or search(criteria) first.'
      );
    }

    if (criteriaPatch == null) {
      return this.runSearch(
        criteriaRollback,
        resourceOptions,
        criteriaRollback,
        'refresh'
      );
    }

    let patch = { ...criteriaPatch } as Partial<Criteria>;
    const p = patch as ResourceSearchParams;
    if (typeof p.page === 'number' && typeof p.pageSize === 'number') {
      const { result } = this.store.getState();
      const prevSize = criteriaRollback.pageSize ?? result?.pageSize;
      const nextPage =
        prevSize !== undefined && p.pageSize !== prevSize ? 1 : p.page;
      patch = {
        ...patch,
        page: nextPage,
        pageSize: p.pageSize
      } as Partial<Criteria>;
    }

    this.store.patchCriteria(patch);
    const criteria = this.store.getState().criteria!;

    return this.runSearch(
      criteria,
      resourceOptions,
      criteriaRollback,
      'refresh'
    );
  }

  /**
   * @override
   *
   * @remarks **Replaces** {@link ResourceSearchStoreState.criteria} with `criteria`. For the same two-argument shape
   * with **partial** merge, use {@link refresh}.
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
   * Commits `criteria` only after a successful response; on failure restores `criteriaRollback` so
   * {@link ResourceSearchStoreState.criteria} stays aligned with the last successful {@link ResourceSearchStoreState.result}.
   */
  protected runSearch(
    criteria: Criteria,
    resourceOptions: ResourceOptions | undefined,
    criteriaRollback: Criteria | null,
    operation: 'search' | 'refresh'
  ): Promise<ResourceSearchResult<TItem>> {
    const gateway = this.getGateway();
    if (!gateway) {
      throw new Error(
        'ResourceSearch.runSearch() requires a gateway; pass a gateway to the constructor.'
      );
    }

    // `start()` without an argument sets `result: undefined` and clears the list. For refresh, keep the last result
    // until the new response succeeds (loading spinner only).
    if (operation === 'refresh') {
      const current = this.store.getState().result;
      this.store.start(current);
    } else {
      this.store.start();
    }

    return gateway
      .search(criteria, resourceOptions)
      .then((result) => {
        if (!this.isResourceSearchResult(result)) {
          const msg = `${String(this.serviceName)} ${operation}: invalid response (isSearchResult)`;
          this.logger?.error(msg, result);
          throw new Error(msg, { cause: result });
        }
        this.store.setCriteria(criteria);
        this.store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} ${operation}: success`,
          result
        );
        return result;
      })
      .catch((error) => {
        this.store.setCriteria(criteriaRollback);
        this.store.failed(error);
        this.logger?.debug(
          `${String(this.serviceName)} ResourceSearch.${operation}: failed`,
          error
        );
        throw error;
      });
  }
}
