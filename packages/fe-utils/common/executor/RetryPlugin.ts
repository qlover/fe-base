import { ExecutorError } from './ExecutorError';
import { ExecutorPlugin, PromiseTask } from './ExecutorPlugin';

/**
 * Configuration options for the RetryPlugin
 *
 * This interface defines the configuration options for the RetryPlugin,
 * which is used to control the retry behavior of task executions.
 *
 * Core Idea: Provide a flexible configuration for retry logic.
 * Main Function: Define retry parameters such as max retries, delay, and conditions.
 * Main Purpose: Allow customization of retry behavior to suit different use cases.
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
 *
 * @interface RetryOptions
 * @category RetryPlugin
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
 * @category RetryPlugin
 */
const SAFE_MAX_RETRIES = 16;

/**
 * Default number of retry attempts if not specified
 * @category RetryPlugin
 */
const DEFAULT_MAX_RETRIES = 3;

/**
 * Default shouldRetry function that always returns true
 * @category RetryPlugin
 */
const defaultShouldRetry = (): boolean => true;

/**
 * Plugin that implements retry logic for failed task executions
 *
 * This class provides a mechanism to retry failed tasks with configurable
 * options such as maximum retries, delay strategies, and custom retry conditions.
 *
 * Core Idea: Enhance task execution reliability through retries.
 * Main Function: Retry failed tasks based on specified conditions and strategies.
 * Main Purpose: Improve success rates of task executions by handling transient errors.
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * const retryPlugin = new RetryPlugin({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * });
 * ```
 *
 * @category RetryPlugin
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

  /**
   * Constructs a new instance of RetryPlugin with specified options.
   *
   * This constructor initializes the RetryPlugin with user-defined options,
   * applying default values where necessary and clamping the maxRetries value.
   *
   * Core Idea: Initialize retry plugin with user-defined and default settings.
   * Main Function: Set up retry configuration for task execution.
   * Main Purpose: Prepare the plugin to handle retries according to specified logic.
   *
   * @param options - Partial configuration options for retry behavior
   *
   * @example
   * ```typescript
   * const retryPlugin = new RetryPlugin({
   *   maxRetries: 5,
   *   retryDelay: 2000,
   *   useExponentialBackoff: true
   * });
   * ```
   */
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
   *
   * This method calculates and applies a delay between retry attempts,
   * using either a fixed delay or an exponential backoff strategy.
   *
   * Core Idea: Control the timing of retry attempts.
   * Main Function: Calculate and apply delay based on retry strategy.
   * Main Purpose: Prevent immediate consecutive retries, allowing time for transient issues to resolve.
   *
   * @param attempt - Current attempt number
   * @returns Promise that resolves after the delay
   *
   * @example
   * ```typescript
   * await this.delay(2); // Applies delay for the third attempt
   * ```
   */
  private async delay(attempt: number): Promise<void> {
    const delayTime = this.options.useExponentialBackoff
      ? this.options.retryDelay * Math.pow(2, attempt)
      : this.options.retryDelay;

    return new Promise((resolve) => setTimeout(resolve, delayTime));
  }

  /**
   * Custom execution hook that implements retry logic
   *
   * This method intercepts task execution to add retry capability,
   * executing the task with the configured retry logic.
   *
   * Core Idea: Integrate retry logic into task execution.
   * Main Function: Execute tasks with retry support.
   * Main Purpose: Enhance task execution robustness by handling failures.
   *
   * @template T - Type of task return value
   * @param task - Task to be executed with retry support
   * @returns Promise resolving to task result
   *
   * @example
   * ```typescript
   * const result = await retryPlugin.onExec(() => fetchData());
   * ```
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
   *
   * This method checks if a retry should be attempted based on the
   * remaining retry count and a custom retry condition function.
   *
   * Core Idea: Decide on retry attempts based on conditions.
   * Main Function: Evaluate retry conditions and remaining attempts.
   * Main Purpose: Prevent unnecessary retries and optimize execution flow.
   *
   * @param error - Error from failed attempt
   * @param retryCount - Number of retries remaining
   * @returns boolean indicating if retry should be attempted
   *
   * @example
   * ```typescript
   * if (this.shouldRetry({ error, retryCount })) {
   *   // Proceed with retry
   * }
   * ```
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
   *
   * This method recursively attempts to execute the task until it succeeds
   * or the maximum number of retries is reached, applying the configured delay strategy.
   *
   * Core Idea: Implement a robust retry mechanism for task execution.
   * Main Function: Execute tasks with retries and handle failures.
   * Main Purpose: Increase task success rates by retrying on failure.
   *
   * @template T - Type of task return value
   * @param fn - Function to retry
   * @param options - Retry configuration options
   * @param retryCount - Number of retries remaining
   * @throws {ExecutorError} When all retry attempts fail
   * @returns Promise resolving to task result
   *
   * @example
   * ```typescript
   * const result = await this.retry(fetchData, options, 3);
   * ```
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
