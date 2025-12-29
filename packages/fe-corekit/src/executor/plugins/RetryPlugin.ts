import {
  ExecutorPlugin,
  PromiseTask,
  ExecutorContext,
  ExecutorError
} from '../interface';
import { makeRetriable, Options as PRetryOptions } from 'p-retry';

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
 * @category RetryPlugin
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
 * @example With custom delay function
 * ```typescript
 * const options: RetryOptions = {
 *   maxRetries: 5,
 *   retryDelay: (attemptNumber) => 1000 * Math.pow(2, attemptNumber), // Custom exponential backoff
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
   * Base delay between retry attempts in milliseconds, or a function that calculates the delay
   * Used directly for fixed delay, or as base for exponential backoff
   * When a function is provided, it receives the attempt number (0-based) and returns the delay in milliseconds
   * @default 1000
   */
  retryDelay: number | ((attemptNumber: number) => number);

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
 * Plugin that implements retry logic for failed task executions
 *
 * This class provides a mechanism to retry failed tasks with configurable
 * options such as maximum retries, delay strategies, and custom retry conditions.
 *
 * - Core Idea: Enhance task execution reliability through retries.
 * - Main Function: Retry failed tasks based on specified conditions and strategies.
 * - Main Purpose: Improve success rates of task executions by handling transient errors.
 *
 * **v2.7.0  Refactored to use p-retry library for retry logic. All retry logic is now self-contained within RetryPlugin. **
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
   * The pluginName of the plugin
   */
  public readonly pluginName = 'RetryPlugin';

  /**
   * Ensures only one instance of RetryPlugin is used per executor
   */
  public readonly onlyOne = true;

  /**
   * Normalized options with defaults applied
   */
  private readonly options: RetryOptions;

  /**
   * Maximum safe number of retries to prevent excessive attempts
   */
  private static readonly SAFE_MAX_RETRIES = 16;

  /**
   * Default number of retry attempts if not specified
   */
  private static readonly DEFAULT_MAX_RETRIES = 3;

  /**
   * Default shouldRetry function that always returns true
   */
  private static readonly defaultShouldRetry = (): boolean => true;

  /**
   * Constructs a new instance of RetryPlugin with specified options.
   *
   * This constructor initializes the RetryPlugin with user-defined options,
   * applying default values where necessary and clamping the maxRetries value.
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
    this.options = this.normalizeOptions(options);
  }

  /**
   * Custom execution hook that implements retry logic
   *
   * This method intercepts task execution to add retry capability,
   * returning a new function that merges context.parameters and applies retry logic.
   *
   * The retry options can be overridden via `context.parameters`:
   * - `this.options` serves as default values
   * - `context.parameters` can override any option (maxRetries, retryDelay, useExponentialBackoff, shouldRetry)
   *
   * @override
   * @template T - Type of task return value
   * @param context - Executor context containing parameters and metadata. Parameters can override retry options.
   * @param task - Task to be executed with retry support
   * @returns A new function that merges parameters and applies retry logic, or undefined to skip
   *
   * @example
   * ```typescript
   * const wrappedTask = retryPlugin.onExec(context, originalTask);
   * // wrappedTask will merge context.parameters and apply retry logic
   * ```
   *
   * @example Override options via context.parameters
   * ```typescript
   * const context: ExecutorContext<Partial<RetryOptions>> = {
   *   parameters: {
   *     maxRetries: 10, // Override default maxRetries
   *     retryDelay: 5000 // Override default retryDelay
   *   }
   * };
   * const wrappedTask = retryPlugin.onExec(context, originalTask);
   * ```
   */
  public onExec(
    context: ExecutorContext<Partial<RetryOptions>>,
    task: PromiseTask<unknown, unknown>
  ): PromiseTask<unknown, unknown> | unknown {
    // Merge this.options (defaults) with context.parameters (overrides)
    const mergedOptions = {
      ...this.options,
      ...context.parameters
    };

    // Normalize merged options to ensure all required fields are present and valid
    const finalOptions = this.normalizeOptions(mergedOptions);

    // no retry, just pass through
    if (finalOptions.maxRetries < 1) {
      return undefined; // Let other plugins handle execution
    }

    const pRetryOptions = this.convertToPRetryOptions(finalOptions);

    // Create a wrapper function that merges parameters and applies retry logic
    const retriableTask = makeRetriable(
      async (newContext: ExecutorContext<unknown>) => {
        // Merge context.parameters from the original context with the new context
        const mergedContext: ExecutorContext<unknown> = {
          ...newContext,
          parameters: Object.assign(
            {},
            context.parameters,
            newContext.parameters
          ) as unknown
        };

        return await task(mergedContext);
      },
      pRetryOptions
    );

    // Return a function that wraps the retriable task and handles errors
    return async (newContext: ExecutorContext<unknown>) => {
      try {
        return await retriableTask(newContext);
      } catch (error: unknown) {
        // Convert error to ExecutorError for consistency
        throw new ExecutorError(
          'RETRY_ERROR',
          `All ${finalOptions.maxRetries} attempts failed: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    };
  }

  /**
   * Converts RetryOptions to p-retry Options format
   *
   * Note: p-retry's `retries` is the number of retries (excluding the first attempt),
   * while RetryOptions.maxRetries is the total number of attempts (including the first).
   * So we need to subtract 1 from maxRetries.
   *
   * p-retry uses minTimeout, maxTimeout, and factor for delay configuration.
   * We implement custom delay logic through onFailedAttempt callback.
   *
   * @param options - Retry configuration options
   * @returns p-retry options configuration
   */
  private convertToPRetryOptions(options: RetryOptions): PRetryOptions {
    let delayFunction: (attemptNumber: number) => number;

    // Determine delay calculation function
    if (typeof options.retryDelay === 'function') {
      // Custom delay function from RetryOptions
      delayFunction = options.retryDelay;
    } else if (options.useExponentialBackoff) {
      // Exponential backoff: retryDelay * (2 ^ attemptNumber)
      // attemptNumber in p-retry starts from 0 for the first retry
      delayFunction = (attemptNumber: number) => {
        return (options.retryDelay as number) * Math.pow(2, attemptNumber);
      };
    } else {
      // Fixed delay from RetryOptions
      delayFunction = () => options.retryDelay as number;
    }

    const pRetryOptions: PRetryOptions = {
      // p-retry's retries is the number of retries, not total attempts
      // So if maxRetries is 3 (1 initial + 2 retries), we set retries to 2
      retries: options.maxRetries - 1,
      onFailedAttempt: async (error) => {
        // error is RetryContext which has error, attemptNumber, retriesLeft properties
        const originalError = error.error;

        // Check if we should retry based on custom shouldRetry function
        if (!options.shouldRetry(originalError)) {
          // Stop retrying by throwing the error
          throw originalError;
        }

        // Apply delay before retry
        // attemptNumber is 1-based in RetryContext, but delayFunction expects 0-based
        const delay = delayFunction(error.attemptNumber - 1);
        if (delay > 0) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    };

    return pRetryOptions;
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
   * const normalized = retryPlugin.normalizeOptions({
   *   maxRetries: 10,
   *   retryDelay: 2000
   * });
   * ```
   */
  private normalizeOptions(options: Partial<RetryOptions> = {}): RetryOptions {
    return {
      retryDelay: options.retryDelay ?? 1000,
      useExponentialBackoff: options.useExponentialBackoff ?? false,
      shouldRetry: options.shouldRetry ?? RetryPlugin.defaultShouldRetry,
      // Clamp maxRetries between 1 and SAFE_MAX_RETRIES
      maxRetries: Math.min(
        Math.max(1, options.maxRetries ?? RetryPlugin.DEFAULT_MAX_RETRIES),
        RetryPlugin.SAFE_MAX_RETRIES
      )
    } as RetryOptions;
  }
}
