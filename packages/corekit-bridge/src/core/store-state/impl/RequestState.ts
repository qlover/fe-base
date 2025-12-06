import { AsyncStateInterface } from '../interface/AsyncStoreInterface';

/**
 * Concrete implementation of AsyncStateInterface for tracking request lifecycle
 *
 * This class provides a standardized way to track the state of asynchronous
 * requests, including loading states, results, errors, and timing information.
 *
 * Features:
 * - Automatic timing tracking
 * - Immutable state updates
 * - Type-safe result handling
 * - Error tracking
 * - Loading state management
 *
 * Use cases:
 * - API request tracking
 * - Data fetching states
 * - Upload/download progress
 * - Async operation monitoring
 * - Performance measurement
 *
 * @template T The type of the expected result
 *
 * @example Basic usage
 * ```typescript
 * // Initialize request state
 * const state = new RequestState<User>();
 *
 * try {
 *   // Start loading
 *   state.loading = true;
 *
 *   // Perform request
 *   const user = await fetchUser(id);
 *
 *   // Update state with result
 *   state.result = user;
 *   state.loading = false;
 * } catch (error) {
 *   // Handle error
 *   state.error = error;
 *   state.loading = false;
 * } finally {
 *   // Mark request as complete
 *   state.end();
 * }
 * ```
 *
 * @example With async/await wrapper
 * ```typescript
 * async function withRequestState<T>(
 *   operation: () => Promise<T>
 * ): Promise<RequestState<T>> {
 *   const state = new RequestState<T>(true);
 *
 *   try {
 *     state.result = await operation();
 *     return state;
 *   } catch (error) {
 *     state.error = error;
 *     return state;
 *   } finally {
 *     state.loading = false;
 *     state.end();
 *   }
 * }
 *
 * // Usage
 * const userState = await withRequestState(() => fetchUser(id));
 * ```
 */
export class RequestState<T = unknown> implements AsyncStateInterface<T> {
  /**
   * Timestamp when the request started
   *
   * Automatically set in constructor to track request duration
   * Used for:
   * - Performance monitoring
   * - Request timeout detection
   * - Operation duration calculation
   */
  startTime: number;

  /**
   * Timestamp when the request completed
   *
   * Set to 0 initially and updated when end() is called
   * Used for:
   * - Performance metrics
   * - Request duration calculation
   * - Request completion verification
   */
  endTime: number;

  /**
   * Creates a new RequestState instance
   *
   * @param loading - Initial loading state
   * @param result - Initial result value
   * @param error - Initial error value
   *
   * @example
   * ```typescript
   * // Start in loading state
   * const loadingState = new RequestState(true);
   *
   * // Initialize with result
   * const completedState = new RequestState(false, data);
   *
   * // Initialize with error
   * const errorState = new RequestState(false, null, error);
   * ```
   */
  constructor(
    public loading: boolean = false,
    public result: T | null = null,
    public error: unknown | null = null
  ) {
    this.startTime = Date.now();
    this.endTime = 0;
  }

  /**
   * Marks the request as complete and records the end time
   *
   * Use this method when:
   * - Request completes successfully
   * - Request fails with error
   * - Request is cancelled
   * - Cleanup is needed
   *
   * @returns The current instance for chaining
   *
   * @example
   * ```typescript
   * const state = new RequestState<User>();
   *
   * try {
   *   state.loading = true;
   *   state.result = await fetchUser(id);
   * } finally {
   *   state.loading = false;
   *   state.end();
   * }
   *
   * const duration = state.endTime - state.startTime;
   * ```
   */
  end(): this {
    this.endTime = Date.now();
    return this;
  }
}
