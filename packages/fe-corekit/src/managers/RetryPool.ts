import { ExecutorError } from '../executor/interface';

/**
 * Configuration options for retry operations
 *
 * This interface defines the configuration options for retry behavior,
 * which is used to control the retry logic of task executions.
 *
 * - Core Idea: Provide a flexible configuration for retry logic.
 * - Main Function: Define retry parameters such as max retries, delay, and conditions.
 * - Main Purpose: Allow customization of retry behavior to suit different use cases.
 *
 * @category RetryPool
 *
 * @example
 * ```typescript
 * const options: RetryOptions = {
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * };
 * ```
 */
export interface RetryOptions {
  /**
   * Maximum number of retry attempts (starting from 0)
   * Will be clamped between 1 and SAFE_MAX_RETRIES (16)
   * @default 3
   */
  maxRetries: number;

  /**
   * Base delay between retry attempts in milliseconds
   * Used directly for fixed delay, or as base for exponential backoff
   * @default 1000
   */
  retryDelay: number;

  /**
   * When true, implements exponential backoff delay strategy
   * Delay formula: retryDelay * (2 ^ attemptNumber)
   * @default false
   */
  useExponentialBackoff: boolean;

  /**
   * Custom function to determine if a retry should be attempted
   * @param error - The error that caused the failure
   * @returns boolean indicating if retry should be attempted
   * @default () => true (always retry)
   */
  shouldRetry: (error: Error) => boolean;
}

export const RETRY_ERROR_ID = 'RETRY_ERROR';

/**
 * Maximum safe number of retries to prevent excessive attempts
 * @category RetryPool
 */
const SAFE_MAX_RETRIES = 16;

/**
 * Default number of retry attempts if not specified
 * @category RetryPool
 */
const DEFAULT_MAX_RETRIES = 3;

/**
 * Default shouldRetry function that always returns true
 * @category RetryPool
 */
const defaultShouldRetry = (): boolean => true;

/**
 * Resource pool for managing retry logic in asynchronous operations
 *
 * `RetryPool` provides centralized management of retry logic, enabling
 * fine-grained control over retry behavior, delay strategies, and retry conditions.
 * It can be used standalone or extended as a base class for plugin implementations.
 *
 * Core concept:
 * Think of it as a retry engine that handles failed operations. Each retry operation
 * gets configured with retry parameters (max retries, delay, conditions). The pool
 * manages the retry lifecycle, ensuring proper error handling and retry execution.
 *
 * Main features:
 * - **Retry execution**: Core retry logic with configurable attempts and delays
 *   - Supports fixed delay and exponential backoff strategies
 *   - Configurable maximum retry attempts
 *   - Custom retry condition functions
 *   - Proper error handling and propagation
 *
 * - **Delay strategies**: Flexible delay calculation
 *   - Fixed delay: constant delay between retries
 *   - Exponential backoff: delay increases exponentially with each attempt
 *   - Formula: `retryDelay * (2 ^ attemptNumber)` for exponential backoff
 *
 * - **Retry conditions**: Custom logic for determining retry eligibility
 *   - Check error type or message
 *   - Check remaining retry count
 *   - Prevent retries for non-retryable errors
 *
 * Architecture decisions:
 * - Stateless design: no internal state tracking, pure retry logic
 * - Delegates delay calculation to separate method for testability
 * - Separates retry condition checking for flexibility
 * - Throws `ExecutorError` with `RETRY_ERROR` code when all retries exhausted
 *
 * @since 2.6.0
 *
 * @example Standalone usage for API requests
 * ```typescript
 * const retryPool = new RetryPool();
 *
 * const result = await retryPool.retry(
 *   async () => fetch('/api/users').then(r => r.json()),
 *   {
 *     maxRetries: 3,
 *     retryDelay: 1000,
 *     useExponentialBackoff: true,
 *     shouldRetry: (error) => error.message !== 'Invalid credentials'
 *   }
 * );
 *
 * if (result instanceof ExecutorError) {
 *   console.error('Retry failed:', result.message);
 * } else {
 *   console.log('Success:', result);
 * }
 * ```
 *
 * @example With simple function
 * ```typescript
 * const retryPool = new RetryPool();
 *
 * const result = await retryPool.retry(
 *   async () => {
 *     const response = await fetch('/api/data');
 *     if (!response.ok) throw new Error('Request failed');
 *     return response.json();
 *   },
 *   { maxRetries: 3, retryDelay: 1000 }
 * );
 * ```
 */
export class RetryPool {
  /**
   * Creates a new `RetryPool` instance
   *
   * @param poolName - Name of the pool for identification and debugging
   *
   * @example Minimal setup
   * ```typescript
   * const retryPool = new RetryPool('APIPool');
   * ```
   *
   * @example With descriptive name
   * ```typescript
   * const uploadRetryPool = new RetryPool('FileUploadPool');
   * const fetchRetryPool = new RetryPool('DataFetchPool');
   * ```
   */
  constructor(
    /**
     * Unique name identifying this pool instance
     *
     * Used for:
     * - Debugging and logging to distinguish between multiple pools
     * - Identifying pool source in error messages
     *
     * @readonly
     * @default `"RetryPool"`
     * @example `"APIPool"` // For API request retry management
     * @example `"TaskPool"` // For background task retry management
     * @example `"UploadPool"` // For file upload retry operations
     */
    public readonly poolName: string = 'RetryPool'
  ) {}

  /**
   * Implements delay between retry attempts
   *
   * This method calculates and applies a delay between retry attempts,
   * using either a fixed delay or an exponential backoff strategy.
   *
   * @param attempt - Current attempt number (0-based)
   * @param options - Retry configuration options
   * @returns Promise that resolves after the delay
   *
   * @example Fixed delay
   * ```typescript
   * await retryPool.delay(2, { retryDelay: 1000, useExponentialBackoff: false });
   * // Waits 1000ms
   * ```
   *
   * @example Exponential backoff
   * ```typescript
   * await retryPool.delay(2, { retryDelay: 1000, useExponentialBackoff: true });
   * // Waits 4000ms (1000 * 2^2)
   * ```
   */
  public async delay(attempt: number, options: RetryOptions): Promise<void> {
    const delayTime = options.useExponentialBackoff
      ? options.retryDelay * Math.pow(2, attempt)
      : options.retryDelay;

    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  /**
   * Determines if another retry attempt should be made
   *
   * This method checks if a retry should be attempted based on the
   * remaining retry count and a custom retry condition function.
   *
   * @param error - Error from failed attempt
   * @param retryCount - Number of retries remaining
   * @param options - Retry configuration options
   * @returns boolean indicating if retry should be attempted
   *
   * @example
   * ```typescript
   * if (retryPool.shouldRetry(error, 2, options)) {
   *   // Proceed with retry
   * }
   * ```
   */
  public shouldRetry(
    error: unknown,
    retryCount: number,
    options: RetryOptions
  ): boolean {
    return (
      // must be greater than 0
      retryCount > 0 &&
      // must satisfy should retry function
      options.shouldRetry(error as Error)
    );
  }

  /**
   * Core retry implementation
   *
   * This method recursively attempts to execute the task until it succeeds
   * or the maximum number of retries is reached, applying the configured delay strategy.
   *
   * @template Result - Type of task return value
   * @param fn - Function to retry (no parameters, returns Promise<Result>)
   * @param options - Retry configuration options
   * @param retryCount - Number of retries remaining (optional, defaults to options.maxRetries)
   * @returns Promise resolving to task result or ExecutorError if all retries fail
   *
   * @example Basic usage
   * ```typescript
   * const result = await retryPool.retry(
   *   async () => fetch('/api/data').then(r => r.json()),
   *   { maxRetries: 3, retryDelay: 1000, useExponentialBackoff: false, shouldRetry: () => true }
   * );
   *
   * if (result instanceof ExecutorError) {
   *   console.error('Failed:', result.message);
   * } else {
   *   console.log('Success:', result);
   * }
   * ```
   *
   * @example With exponential backoff
   * ```typescript
   * const result = await retryPool.retry(
   *   async () => uploadFile(file),
   *   { maxRetries: 5, retryDelay: 2000, useExponentialBackoff: true, shouldRetry: (error) => error.message !== 'Invalid' }
   * );
   * ```
   */
  public async retry<Result>(
    fn: () => Promise<Result>,
    options: RetryOptions,
    retryCount?: number
  ): Promise<Result | ExecutorError> {
    const currentRetryCount = retryCount ?? options.maxRetries;

    try {
      return await fn();
    } catch (error) {
      if (!this.shouldRetry(error, currentRetryCount, options)) {
        return new ExecutorError(
          RETRY_ERROR_ID,
          `All ${options.maxRetries} attempts failed: ${(error as Error).message}`
        );
      }

      await this.delay(options.maxRetries - currentRetryCount, options);

      // decrement retry count
      const nextRetryCount = currentRetryCount - 1;

      return this.retry(fn, options, nextRetryCount);
    }
  }

  /**
   * Normalizes retry options with defaults applied
   *
   * Applies default values to partial retry options and clamps maxRetries
   * to safe bounds (between 1 and SAFE_MAX_RETRIES).
   *
   * @param options - Partial retry configuration options
   * @returns Normalized retry options with all defaults applied
   *
   * @example
   * ```typescript
   * const normalized = retryPool.normalizeOptions({
   *   maxRetries: 10,
   *   retryDelay: 2000
   * });
   * // Returns: { maxRetries: 10, retryDelay: 2000, useExponentialBackoff: false, shouldRetry: defaultShouldRetry }
   * ```
   */
  public normalizeOptions(options: Partial<RetryOptions> = {}): RetryOptions {
    return {
      retryDelay: 1000,
      useExponentialBackoff: false,
      shouldRetry: defaultShouldRetry,
      ...options,
      // Clamp maxRetries between 1 and SAFE_MAX_RETRIES
      maxRetries: Math.min(
        Math.max(1, options.maxRetries ?? DEFAULT_MAX_RETRIES),
        SAFE_MAX_RETRIES
      )
    };
  }
}
