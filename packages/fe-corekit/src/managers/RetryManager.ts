import { makeRetriable, Options as PRetryOptions, RetryContext } from 'p-retry';
import retry from 'p-retry';
import { RetryManagerInterface } from './interface/RetryManagerInterface';

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
export interface RetryOptions extends PRetryOptions {
  /**
   * Maximum number of retry attempts (starting from 0)
   * Will be clamped between 1 and SAFE_MAX_RETRIES (16)
   * @default 3
   */
  maxRetries?: number;

  /**
   * Base delay between retry attempts in milliseconds, or a function that calculates the delay
   * Used directly for fixed delay, or as base for exponential backoff
   * When a function is provided, it receives the attempt number (0-based) and returns the delay in milliseconds
   *
   * @example
   * ```typescript
   * const options: RetryOptions = {
   *   maxRetries: 5,
   *   retryDelay: (attemptNumber) => 1000 * Math.pow(2, attemptNumber), // Custom exponential backoff
   *   shouldRetry: (error) => error.message !== 'Invalid credentials'
   * };
   * ```
   *
   * @example
   * ```typescript
   * const options: RetryOptions = {
   *   maxRetries: 5,
   *   retryDelay: 1000, // Fixed delay
   *   shouldRetry: (error) => error.message !== 'Invalid credentials'
   * };
   *
   * @default 1000
   */
  retryDelay?: number | ((attemptNumber: number) => number);

  /**
   * When true, implements exponential backoff delay strategy
   * Delay formula: retryDelay * (2 ^ attemptNumber)
   * @default false
   */
  useExponentialBackoff?: boolean;

  /**
   * AbortSignal to cancel retrying operation externally
   * Useful for implementing user cancellation or timeout controls
   */
  signal?: AbortSignal;
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
 * **v2.8.0  Refactored to use p-retry library for retry logic. All retry logic is now self-contained within RetryManager. Added retry() method for direct execution. **
 *
 * @example
 * ```typescript
 * const retryManager = new RetryManager({
 *   maxRetries: 5,
 *   retryDelay: 2000,
 *   useExponentialBackoff: true,
 *   shouldRetry: (error) => error.message !== 'Invalid credentials'
 * });
 * ```
 *
 * @example Using the interface for dependency injection
 * ```typescript
 * import { RetryManagerInterface, RetryManager } from '@qlover/fe-corekit/managers';
 *
 * class ApiService {
 *   constructor(private retryManager: RetryManagerInterface) {}
 *
 *   async fetchData(): Promise<Data> {
 *     return this.retryManager.retry(async () => {
 *       const response = await fetch('/api/data');
 *       return response.json();
 *     });
 *   }
 * }
 *
 * const apiService = new ApiService(new RetryManager({ maxRetries: 3 }));
 * ```
 */
export class RetryManager implements RetryManagerInterface<RetryOptions> {
  /**
   * Normalized options with defaults applied
   */
  protected readonly options: RetryOptions;

  /**
   * Maximum safe number of retries to prevent excessive attempts
   */
  protected static readonly SAFE_MAX_RETRIES = 16;

  /**
   * Default number of retry attempts if not specified
   */
  protected static readonly DEFAULT_MAX_RETRIES = 3;

  protected static defaultOptions: RetryOptions = {
    maxRetries: 3,
    retryDelay: 1000,
    useExponentialBackoff: false,
    shouldRetry: () => true,
    randomize: false
  };

  /**
   * Constructs a new instance of RetryManager with specified options.
   *
   * This constructor initializes the RetryManager with user-defined options,
   * applying default values where necessary and clamping the maxRetries value.
   *
   * @param options - Partial configuration options for retry behavior
   *
   * @example
   * ```typescript
   * const retryPlugin = new RetryManager({
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
  protected convertToPRetryOptions(options: RetryOptions): PRetryOptions {
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

    return {
      // p-retry's retries is the number of retries, not total attempts
      // So if maxRetries is 3 (1 initial + 2 retries), we set retries to 2
      retries: options.maxRetries ? options.maxRetries - 1 : undefined,
      onFailedAttempt: async (error) => {
        // Call custom onFailedAttempt callback if provided
        if (options.onFailedAttempt) {
          await options.onFailedAttempt(error);
        }
        await this.shouldRetry(error, options, delayFunction);
      },
      // Pass through additional p-retry options
      shouldConsumeRetry: options.shouldConsumeRetry,
      randomize: options.randomize,
      maxRetryTime: options.maxRetryTime,
      signal: options.signal,
      unref: options.unref
    };
  }

  protected async shouldRetry(
    error: RetryContext,
    options: RetryOptions,
    delayFunction: (attemptNumber: number) => number
  ): Promise<void> {
    // error is RetryContext which has error, attemptNumber, retriesLeft properties
    const originalError = error.error;

    // Check if we should retry based on custom shouldRetry function
    if (!options.shouldRetry?.(error)) {
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
  protected normalizeOptions(
    options: Partial<RetryOptions> = {}
  ): RetryOptions {
    return {
      ...RetryManager.defaultOptions,
      useExponentialBackoff: options.useExponentialBackoff ?? false,
      maxRetries: Math.min(
        Math.max(1, options.maxRetries ?? RetryManager.DEFAULT_MAX_RETRIES),
        RetryManager.SAFE_MAX_RETRIES
      )
    };
  }

  /**
   * @override
   */
  public makeRetriable<Arguments extends readonly unknown[], Result>(
    fn: (...args: Arguments) => Promise<Result>,
    options?: RetryOptions
  ): (...args: Arguments) => Promise<Result> {
    return makeRetriable(
      fn,
      this.convertToPRetryOptions(this.normalizeOptions(options))
    );
  }

  /**
   * Executes a function with retry logic using the configured options
   *
   * This method directly executes the provided function with retry logic applied,
   * using the retry configuration stored in this RetryManager instance.
   *
   * @override
   * @template Result - The return type of the function
   * @param fn - The async function to execute with retry logic
   * @returns A promise that resolves with the function result or rejects with the final error
   *
   * @example
   * ```typescript
   * const retryManager = new RetryManager({ maxRetries: 3, retryDelay: 1000 });
   *
   * try {
   *   const result = await retryManager.retry(async () => {
   *     // Some operation that might fail
   *     return await fetchData();
   *   });
   *   console.log('Success:', result);
   * } catch (error) {
   *   console.error('All retries failed:', error);
   * }
   * ```
   */
  public retry<Result>(
    fn: (attemptNumber: number) => PromiseLike<Result> | Result,
    options?: RetryOptions
  ): Promise<Result> {
    return retry(
      fn,
      this.convertToPRetryOptions(this.normalizeOptions(options))
    );
  }
}
