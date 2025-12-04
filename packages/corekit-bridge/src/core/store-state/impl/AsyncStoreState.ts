import { AsyncStoreStatus, AsyncStoreStatusType } from './AsyncStoreStatus';
import { AsyncStoreStateInterface } from './AsyncStore';

/**
 * Async store state implementation
 *
 * - Significance: Provides a concrete implementation of `AsyncStoreStateInterface` for async operations
 * - Core idea: Encapsulate all state properties needed for async operation lifecycle management
 * - Main function: Track loading state, results, errors, timing, and status of async operations
 * - Main purpose: Serve as the default state class for `AsyncStore` instances
 *
 * Core features:
 * - Complete state tracking: Loading, result, error, timing, and status
 * - Default values: All properties initialized with sensible defaults
 * - Flexible initialization: Supports partial state updates via constructor options
 * - Type-safe: Generic type parameter ensures result type safety
 *
 * State properties:
 * - `loading`: Whether the async operation is currently in progress
 * - `result`: The result data if operation succeeded, or `null` otherwise
 * - `error`: Error information if operation failed, or `null` otherwise
 * - `startTime`: Timestamp when operation started (0 if not started)
 * - `endTime`: Timestamp when operation completed (0 if not completed)
 * - `status`: Current status of the operation (defaults to `DRAFT`)
 *
 * @template T - The type of the result data from the async operation
 *
 * @example Basic usage
 * ```typescript
 * const state = new AsyncStoreState<User>();
 * // state.loading = false
 * // state.result = null
 * // state.error = null
 * // state.startTime = 0
 * // state.endTime = 0
 * // state.status = 'draft'
 * ```
 *
 * @example With initial values
 * ```typescript
 * const state = new AsyncStoreState<User>({
 *   loading: true,
 *   startTime: Date.now(),
 *   status: AsyncStoreStatus.PENDING
 * });
 * ```
 */
export class AsyncStoreState<T> implements AsyncStoreStateInterface<T> {
  /**
   * Whether the async operation is currently in progress
   *
   * @default `false`
   */
  loading: boolean = false;

  /**
   * The result of the async operation if successful
   *
   * Will be `null` if:
   * - Operation hasn't completed
   * - Operation failed
   * - Operation completed but returned no data
   *
   * @default `null`
   */
  result: T | null = null;

  /**
   * Error information if the async operation failed
   *
   * Will be `null` if:
   * - Operation hasn't completed
   * - Operation completed successfully
   *
   * @default `null`
   */
  error: unknown | null = null;

  /**
   * Timestamp when the async operation started
   *
   * Used for performance tracking and duration calculations.
   * Will be `0` if operation hasn't started.
   *
   * @default `0`
   */
  startTime: number = 0;

  /**
   * Timestamp when the async operation completed
   *
   * Used with `startTime` to calculate total operation duration.
   * Will be `0` if operation hasn't completed.
   *
   * @default `0`
   */
  endTime: number = 0;

  /**
   * Current status of the async operation
   *
   * Status values:
   * - `DRAFT`: Initial state, operation hasn't started
   * - `PENDING`: Operation is in progress
   * - `SUCCESS`: Operation completed successfully
   * - `FAILED`: Operation failed with an error
   * - `STOPPED`: Operation was manually stopped
   *
   * @default `AsyncStoreStatus.DRAFT`
   */
  status: AsyncStoreStatusType = AsyncStoreStatus.DRAFT;

  /**
   * Constructor for async store state
   *
   * Creates a new state instance with default values. Optionally accepts partial state
   * to override default values, allowing flexible initialization.
   *
   * @param options - Optional partial state object to override default values
   *   Only specified properties will be set, others will use defaults
   *   @optional
   *
   * @example Create with defaults
   * ```typescript
   * const state = new AsyncStoreState<User>();
   * // All properties use default values
   * ```
   *
   * @example Create with partial state
   * ```typescript
   * const state = new AsyncStoreState<User>({
   *   loading: true,
   *   startTime: Date.now(),
   *   status: AsyncStoreStatus.PENDING
   * });
   * ```
   */
  constructor(options?: Partial<AsyncStoreStateInterface<T>>) {
    if (options && typeof options === 'object') {
      Object.assign(this, options);
    }
  }
}
