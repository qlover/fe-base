import { StoreInterface } from './StoreInterface';

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

  /**
   * Status of the async operation
   *
   * @example `'pending' | 'success' | 'failed' | 'stopped'`
   */
  status?: unknown;
}

export interface AsyncStateAction<T> {
  /**
   * Start authentication process
   * Marks the beginning of an async authentication operation
   */
  start(result?: T): void;

  /**
   * Stop authentication process
   * Marks the end of an async authentication operation
   */
  stopped(error?: unknown, result?: T): void;

  /**
   * Mark authentication as failed
   * @param error - The error that occurred
   * @param result - The result of the authentication operation
   */
  failed(error: unknown, result?: T): void;

  /**
   * Mark authentication as successful
   * @param result - The result of the authentication operation
   */
  success(result: T): void;

  /**
   * Reset store state to initial state
   * Clears all state data and resets to default values
   */
  reset(): void;

  /**
   * Update store state
   * @param state - Partial state object to merge into current state
   */
  updateState<S extends AsyncStateInterface<T>>(state: Partial<S>): void;

  /**
   * Get the duration of the async operation
   * @returns The duration of the async operation in milliseconds
   */
  getDuration(): number;
}

export interface AsyncStateStatusInterface {
  /**
   * Check if the async operation is successful
   * @returns true if the async operation is successful, false otherwise
   */
  isSuccess(): boolean;
  /**
   * Check if the async operation is failed
   * @returns true if the async operation is failed, false otherwise
   */
  isFailed(): boolean;
  /**
   * Check if the async operation is stopped
   * @returns true if the async operation is stopped, false otherwise
   */
  isStopped(): boolean;
  /**
   * Check if the async operation is completed
   * @returns true if the async operation is completed, false otherwise
   */
  isCompleted(): boolean;
  /**
   * Check if the async operation is pending
   * @returns true if the async operation is pending, false otherwise
   */
  isPending(): boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AsyncStoreInterface<State extends AsyncStateInterface<any>>
  extends AsyncStateAction<State['result']>,
    AsyncStateStatusInterface {
  /**
   * Get the underlying store instance
   * This allows reactive state access and subscription
   *
   * - If this extends StoreInterface, it will return itself.
   *
   * @returns The store instance for reactive state access
   */
  getStore(): StoreInterface<State>;

  /**
   * Get current store state
   * @returns Current state object
   */
  getState(): State;

  getLoading(): boolean;
  getError(): State['error'];
  getResult(): State['result'];
  getStatus(): State['status'];

  reset(): void;
}
