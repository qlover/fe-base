import type { GatewayServiceName } from '../../gateway-service/impl/GatewayService';
import type {
  AsyncStoreOptions,
  AsyncStoreStateInterface,
  StoreUpdateValue
} from '../../store-state';
import { AsyncStore, AsyncStoreState } from '../../store-state';
import type { RefType } from '../interfaces/ResourceCRUDInterface';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '../interfaces/ResourceSearchInterface';

export interface ResourceSearchStoreStateOptions<
  TItem,
  Criteria extends ResourceSearchParams
> extends AsyncStoreStateInterface<ResourceSearchResult<TItem>> {
  /**
   * Last submitted search criteria; used for refresh / loadNext when no new criteria are passed.
   */
  readonly criteria?: Criteria | null;

  /**
   * 用于保存暂存引用
   *
   * 1. 保存一组临时的id
   */
  readonly stageRefs?: RefType[];

  /**
   * 用于保存暂存数据
   *
   * 1. 保存一组临时的数据
   * 2. 保存一个当前数据，比如详情
   */
  readonly stageItems?: TItem[];
}

/**
 * Async state for list/search/scroll UI: last {@link ResourceSearchResult} in `result` plus current `criteria`.
 * Used by {@link ResourceSearchStore} (including {@link ResourceScroll}).
 */
export class ResourceSearchStoreState<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams
> extends AsyncStoreState<ResourceSearchResult<TItem>> {
  /**
   * Last submitted search criteria; used for refresh / loadNext when no new criteria are passed.
   *
   * @remarks
   * Do **not** use a class field initializer (`= null`) here: in TS/ES, subclass field initializers run
   * after {@link AsyncStoreState}'s constructor `Object.assign(this, options)` and would wipe
   * `options.criteria` from {@link createResourceSearchStore} / default state.
   */
  public readonly criteria: Criteria | null;

  /**
   * 用于保存暂存引用
   */
  public readonly stageRefs: RefType[];

  /**
   * 用于保存暂存数据
   */
  public readonly stageItems: TItem[];

  constructor(
    options?: StoreUpdateValue<ResourceSearchStoreStateOptions<TItem, Criteria>>
  ) {
    super(options);
    this.criteria = options?.criteria ?? null;
    this.stageRefs = options?.stageRefs ?? [];
    this.stageItems = options?.stageItems ?? [];
  }
}

export class ResourceSearchStore<
  TItem,
  Criteria extends ResourceSearchParams = ResourceSearchParams,
  Key = string
> extends AsyncStore<ResourceSearchStoreState<TItem, Criteria>, Key> {
  constructor(
    public readonly resourceName: GatewayServiceName,
    options?: AsyncStoreOptions<ResourceSearchStoreState<TItem, Criteria>, Key>
  ) {
    super(options);
  }

  /**
   * Replace stored criteria (does not call the API).
   */
  public setCriteria(criteria: Criteria | null): void {
    this.emit({ criteria });
  }

  /**
   * Shallow-merge partial criteria into the current snapshot (does not call the API).
   */
  public patchCriteria(partial: Partial<Criteria>): void {
    const { criteria } = this.getState();
    const base = (criteria ?? {}) as Criteria;
    this.emit({
      criteria: { ...base, ...partial }
    });
  }

  /**
   * @param page - Request page (semantics are API-specific; see {@link ResourceSearchParams.page})
   */
  public setPage(page: number): void {
    this.patchCriteria({ page } as Partial<Criteria>);
  }

  /**
   * @param pageSize - Window size (see {@link ResourceSearchParams.pageSize})
   */
  public setPageSize(pageSize: number): void {
    this.patchCriteria({ pageSize } as Partial<Criteria>);
  }

  /**
   * @param keyword - Free-text query (see {@link ResourceSearchParams.keyword})
   */
  public setKeyword(keyword: string | undefined): void {
    this.patchCriteria({ keyword } as Partial<Criteria>);
  }
}
