import type { GatewayServiceName } from '../../gateway-service/impl/GatewayService';
import type {
  AsyncStoreOptions,
  AsyncStoreStateInterface,
  StoreUpdateValue
} from '../../store-state';
import { AsyncStore, AsyncStoreState } from '../../store-state';
import { clone } from '../../store-state/clone';
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
   * Staging area for transient id/slug references (multi-select buffers, pending deletes, etc.).
   */
  readonly stageRefs?: RefType[];

  /**
   * Staging area for transient rows or a single “current” row (e.g. inline editor context next to the list).
   */
  readonly stageItems?: TItem[];
}

/**
 * Async state for list/search/scroll UI: last {@link ResourceSearchResult} in `result` plus current `criteria`.
 * Used by {@link ResourceSearchStore} (including {@link ResourceScroll}).
 *
 * @example Seed defaults when constructing via {@link createResourceSearchStore}
 * ```typescript
 * new ResourceSearchStoreState({ criteria: { page: 1, pageSize: 25 }, stageRefs: [], stageItems: [] });
 * ```
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
   * See {@link ResourceSearchStoreStateOptions.stageRefs}.
   */
  public readonly stageRefs: RefType[];

  /**
   * See {@link ResourceSearchStoreStateOptions.stageItems}.
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

/**
 * Async store for list/search UIs: holds {@link ResourceSearchStoreState} (last {@link ResourceSearchResult}, `criteria`,
 * and optional staging fields). Used by {@link ResourceSearch} and {@link ResourceScroll}; construction usually goes
 * through {@link createResourceSearchStore} so `defaultState` is wired correctly.
 *
 * @example Local criteria and staging without calling the gateway
 * ```typescript
 * const store = new ResourceSearchStore<Row, RowCriteria>('products.list');
 * store.patchCriteria({ page: 2 });
 * store.setKeyword('acme');
 * store.addStageRef('row-7');
 * store.addStageItem(previewRow);
 * ```
 */
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

  /**
   * Replace the staged reference list (does not call the API).
   */
  public setStageRefs(refs: readonly RefType[]): void {
    this.emit({ stageRefs: [...refs] });
  }

  /**
   * Clear all staged references (`stageRefs` → `[]`).
   */
  public clearStageRefs(): void {
    this.emit({ stageRefs: [] });
  }

  /**
   * Append a reference if it is not already present (`===` against current `stageRefs`).
   */
  public addStageRef(ref: RefType): void {
    const { stageRefs } = this.getState();
    if (stageRefs.includes(ref)) {
      return;
    }
    this.emit({ stageRefs: [...stageRefs, ref] });
  }

  /**
   * Remove every staged reference strictly equal to `ref`.
   */
  public removeStageRef(ref: RefType): void {
    const { stageRefs } = this.getState();
    const next = stageRefs.filter((r) => r !== ref);
    if (next.length === stageRefs.length) {
      return;
    }
    this.emit({ stageRefs: next });
  }

  /**
   * Replace the staged item list (does not call the API).
   */
  public setStageItems(items: readonly TItem[]): void {
    this.emit({ stageItems: [...items] });
  }

  /**
   * Clear staged items (`stageItems` → `[]`).
   */
  public clearStageItems(): void {
    this.emit({ stageItems: [] });
  }

  /**
   * Append one item to `stageItems`.
   */
  public addStageItem(item: TItem): void {
    const { stageItems } = this.getState();
    this.emit({ stageItems: [...stageItems, item] });
  }

  /**
   * Remove the item at `index` if in range.
   */
  public removeStageItemAt(index: number): void {
    const { stageItems } = this.getState();
    if (index < 0 || index >= stageItems.length) {
      return;
    }
    const next = stageItems.slice(0, index).concat(stageItems.slice(index + 1));
    this.emit({ stageItems: next });
  }

  /**
   * Remove the first item matching `predicate`.
   */
  public removeStageItem(predicate: (item: TItem) => boolean): void {
    const { stageItems } = this.getState();
    const index = stageItems.findIndex(predicate);
    if (index === -1) {
      return;
    }
    this.removeStageItemAt(index);
  }

  /**
   * Shallow-merge `patch` into the staged item at `index` (no-op if out of range). Intended for object-like
   * {@link TItem} rows; uses {@link clone} like {@link ResourceCRUDStore.updateActiveDetail}.
   */
  public updateStageItemAt(
    index: number,
    patch: StoreUpdateValue<TItem>
  ): void {
    const { stageItems } = this.getState();
    const current = stageItems[index];
    if (current == null) {
      return;
    }
    const next = stageItems.slice();
    next[index] = Object.assign(clone(current), patch) as TItem;
    this.emit({ stageItems: next });
  }
}
