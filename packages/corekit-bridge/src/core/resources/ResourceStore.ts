import {
  SliceStoreAdapter,
  type StoreInterface,
  type StoreStateInterface,
  type AsyncStateInterface
} from '../store-state';
import { clone } from '../store-state/clone';

/**
 * Interface defining resource query parameters
 *
 * Used for:
 * - Pagination control
 * - Sorting configuration
 * - Data filtering
 *
 * @example Basic query
 * ```typescript
 * const query: ResourceQuery = {
 *   page: 1,
 *   pageSize: 20,
 *   orderBy: 'createdAt',
 *   order: 'desc'
 * };
 * ```
 */
export interface ResourceQuery {
  /**
   * Current page number for pagination
   *
   * @default 1
   */
  page?: number;

  /**
   * Number of items per page
   *
   * @default 10
   */
  pageSize?: number;

  /**
   * Field name to sort by
   *
   * @example `'createdAt'` | `'name'` | `'id'`
   */
  orderBy?: string;

  /**
   * Sort order configuration
   *
   * @example `'asc'` | `'desc'` | { direction: 'asc', nulls: 'last' }
   */
  order?: unknown;
}

/**
 * Interface for resource state management
 *
 * Extends the base store state interface with resource-specific
 * state tracking, including:
 * - Search parameter state
 * - Resource initialization state
 * - Resource list loading state
 */
export interface ResourceStateInterface extends StoreStateInterface {
  /**
   * Current search parameters
   */
  searchParams: ResourceQuery;

  /**
   * Resource initialization state
   */
  initState: AsyncStateInterface<unknown>;

  /**
   * Resource list loading state
   */
  listState: AsyncStateInterface<unknown>;
}

/**
 * How {@link ResourceStore} obtains its {@link StoreInterface} port
 *
 * - Pass a state factory: a {@link SliceStoreAdapter} is created internally (default path).
 * - Pass `{ stateStore }` to inject a custom {@link StoreInterface}.
 */
export type ResourceStoreInit<S extends ResourceStateInterface> =
  | (() => S)
  | { stateStore: StoreInterface<S> };

/**
 * Store class for managing resource state
 *
 * Provides methods for:
 * - Updating list state
 * - Managing search parameters
 * - Tracking initialization state
 *
 * Uses immutable state updates through cloning (see {@link ResourceStore.emit}).
 *
 * @template S Resource state type extending ResourceStateInterface
 *
 * @example Basic usage
 * ```typescript
 * interface UserState extends ResourceStateInterface {}
 *
 * const store = new ResourceStore<UserState>(() => ({
 *   searchParams: { page: 1, pageSize: 20 },
 *   initState: { loading: false, result: null, error: null },
 *   listState: { loading: false, result: null, error: null }
 * }));
 * store.changeSearchParams({ page: 1, pageSize: 20 });
 * ```
 */
export class ResourceStore<S extends ResourceStateInterface> {
  /**
   * Backing {@link StoreInterface} for `reset` / `update` / `getState` / `subscribe`
   *
   * Named `stateStore` to avoid confusion with {@link ResourceServiceInterface.store},
   * which refers to this {@link ResourceStore} instance.
   */
  public readonly stateStore: StoreInterface<S>;

  constructor(init: ResourceStoreInit<S>) {
    this.stateStore =
      typeof init === 'function' ? new SliceStoreAdapter(init) : init.stateStore;
  }

  public get state(): S {
    return this.stateStore.getState();
  }

  /**
   * Shallow-clone current state and apply a patch (aligned with {@link SliceStoreAdapter.update})
   */
  protected cloneState(patch: Partial<S> = {} as Partial<S>): S {
    const current = this.state;
    if (
      current === null ||
      current === undefined ||
      typeof current !== 'object'
    ) {
      return current;
    }
    const next = clone(current);
    Object.assign(next as object, patch as object);
    return next;
  }

  /**
   * Single merge point: patch → cloneState → {@link StoreInterface.update}
   */
  protected emit(patch: Partial<S>): void {
    this.stateStore.update(this.cloneState(patch));
  }

  /**
   * Updates the list loading state
   *
   * Used when:
   * - Loading resource list
   * - Handling list operation results
   * - Tracking list operation errors
   *
   * @param state - New list state
   */
  public changeListState(state: AsyncStateInterface<unknown>): void {
    this.emit({
      listState: state
    } as Partial<S>);
  }

  /**
   * Updates search parameters
   *
   * Used for:
   * - Changing page number
   * - Updating sort order
   * - Modifying filter criteria
   *
   * @param params - New search parameters
   */
  public changeSearchParams(params: Partial<ResourceQuery>): void {
    this.emit({
      searchParams: params
    } as Partial<S>);
  }

  /**
   * Updates resource initialization state
   *
   * Used during:
   * - Resource setup
   * - Configuration loading
   * - Initial data fetching
   *
   * @param state - New initialization state
   */
  public changeInitState(state: AsyncStateInterface<unknown>): void {
    this.emit({
      initState: state
    } as Partial<S>);
  }
}
