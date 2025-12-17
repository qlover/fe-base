import {
  StoreInterface,
  type StoreStateInterface,
  type AsyncStateInterface
} from '../store-state';

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
 * Store class for managing resource state
 *
 * Provides methods for:
 * - Updating list state
 * - Managing search parameters
 * - Tracking initialization state
 *
 * Uses immutable state updates through cloning
 *
 * @template S Resource state type extending ResourceStateInterface
 *
 * @example Basic usage
 * ```typescript
 * interface UserState extends ResourceStateInterface {
 *   // Additional state properties
 * }
 *
 * const store = new ResourceStore<UserState>();
 * store.changeSearchParams({ page: 1, pageSize: 20 });
 * ```
 */
export class ResourceStore<
  S extends ResourceStateInterface
> extends StoreInterface<S> {
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
    this.emit(
      this.cloneState({
        listState: state
      } as Partial<S>)
    );
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
    this.emit(
      this.cloneState({
        searchParams: params
      } as Partial<S>)
    );
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
    this.emit(
      this.cloneState({
        initState: state
      } as Partial<S>)
    );
  }
}
