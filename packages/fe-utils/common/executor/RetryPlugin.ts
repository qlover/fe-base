import { ExecutorError, ExecutorPlugin, PromiseTask } from './Executor';

/**
 * Configuration options for the RetryPlugin
 * @interface RetryOptions
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

/**
 * Maximum safe number of retries to prevent excessive attempts
 */
const SAFE_MAX_RETRIES = 16;

/**
 * Default number of retry attempts if not specified
 */
const DEFAULT_MAX_RETRIES = 3;

/**
 * Default shouldRetry function that always returns true
 */
const defaultShouldRetry = (): boolean => true;

/**
 * Plugin that implements retry logic for failed task executions
 *
 * Features:
 * - Configurable maximum retry attempts
 * - Fixed or exponential backoff delay
 * - Custom retry condition function
 * - Safe maximum retry limit
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * // Basic usage with default options
 * const executor = new AsyncExecutor();
 * executor.use(new RetryPlugin());
 *
 * // Advanced configuration
 * const retryPlugin = new RetryPlugin({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => {
 *     return error.message !== 'Invalid credentials';
 *   }
 * });
 *
 * // Usage with API calls
 * const result = await executor.exec(async () => {
 *   const response = await fetch('https://api.example.com/data');
 *   if (!response.ok) {
 *     throw new Error('API request failed');
 *   }
 *   return response.json();
 * });
 * ```
 */
export class RetryPlugin implements ExecutorPlugin {
  /**
   * Ensures only one instance of RetryPlugin is used per executor
   */
  readonly onlyOne = true;

  /**
   * Normalized options with defaults applied
   */
  private readonly options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = {
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

  /**
   * Implements delay between retry attempts
   * Uses either fixed or exponential backoff delay strategy
   *
   * @param attempt - Current attempt number
   * @returns Promise that resolves after the delay
   */
  private async delay(attempt: number): Promise<void> {
    const delayTime = this.options.useExponentialBackoff
      ? this.options.retryDelay * Math.pow(2, attempt)
      : this.options.retryDelay;

    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  /**
   * Custom execution hook that implements retry logic
   * Intercepts task execution to add retry capability
   *
   * @template T - Type of task return value
   * @param task - Task to be executed with retry support
   * @returns Promise resolving to task result
   */
  async onExec<T>(task: PromiseTask<T>): Promise<T | void> {
    // no retry, just execute
    if (this.options.maxRetries < 1) {
      return task(null);
    }

    return this.retry<T>(task, this.options, this.options.maxRetries);
  }

  /**
   * Determines if another retry attempt should be made
   * Checks retry count and custom shouldRetry function
   *
   * @param error - Error from failed attempt
   * @param retryCount - Number of retries remaining
   * @returns boolean indicating if retry should be attempted
   */
  private shouldRetry({
    error,
    retryCount
  }: {
    error: unknown;
    retryCount: number;
  }): boolean {
    return (
      // must be greater than 0
      retryCount > 0 &&
      // must satisfy should retry function
      this.options.shouldRetry(error as Error)
    );
  }

  /**
   * Core retry implementation
   * Recursively attempts to execute the task until success or max retries reached
   *
   * Retry process:
   * 1. Attempt task execution
   * 2. On failure, check if retry is possible
   * 3. Apply delay (fixed or exponential)
   * 4. Recursively retry with decremented count
   *
   * @template T - Type of task return value
   * @param fn - Function to retry
   * @param options - Retry configuration options
   * @param retryCount - Number of retries remaining
   * @throws {ExecutorError} When all retry attempts fail
   * @returns Promise resolving to task result
   */
  async retry<T>(
    fn: PromiseTask<T>,
    options: RetryOptions,
    retryCount: number
  ): Promise<T | undefined> {
    try {
      return await fn(null);
    } catch (error) {
      if (!this.shouldRetry({ error, retryCount })) {
        throw new ExecutorError(
          'RETRY_ERROR',
          `All ${options.maxRetries} attempts failed: ${(error as Error).message}`
        );
      }

      console.info(
        `Attempt ${options.maxRetries - retryCount + 1} failed. Retrying in ${options.retryDelay}ms... (${retryCount} attempts remaining)`
      );

      await this.delay(options.maxRetries - retryCount);

      // decrement retry count
      retryCount--;

      return this.retry(fn, options, retryCount);
    }
  }
}
