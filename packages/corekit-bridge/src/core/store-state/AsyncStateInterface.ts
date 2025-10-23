/**
 * Interface representing the state of an asynchronous operation
 *
 * This interface tracks the complete lifecycle of an async operation, including:
 * - Loading state
 * - Operation result
 * - Error information
 * - Timing information
 *
 * Use cases:
 * - API request state management
 * - Async data loading states
 * - Background task progress tracking
 * - Operation performance monitoring
 *
 * @template T The type of the expected result
 *
 * @example Basic usage
 * ```typescript
 * interface UserState extends AsyncStateInterface<User> {}
 *
 * const userState: UserState = {
 *   loading: true,
 *   result: null,
 *   error: null,
 *   startTime: Date.now(),
 *   endTime: 0
 * };
 * ```
 */
export interface AsyncStateInterface<T> {
  /**
   * Whether the async operation is currently in progress
   *
   * @default false
   */
  loading: boolean;

  /**
   * The result of the async operation if successful
   *
   * Will be null if:
   * - Operation hasn't completed
   * - Operation failed
   * - Operation completed but returned no data
   */
  result: T | null;

  /**
   * Error information if the async operation failed
   *
   * Will be null if:
   * - Operation hasn't completed
   * - Operation completed successfully
   */
  error: unknown | null;

  /**
   * Timestamp when the async operation started
   *
   * Used for:
   * - Performance tracking
   * - Operation timeout detection
   * - Loading time calculations
   *
   * @example `Date.now()`
   */
  startTime: number;

  /**
   * Timestamp when the async operation completed
   *
   * Will be 0 if operation hasn't completed
   * Used with startTime to calculate total operation duration
   *
   * @example `Date.now()`
   */
  endTime: number;
}
