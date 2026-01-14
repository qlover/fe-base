import type { Options as PRetryOptions } from 'p-retry';

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
 * Interface for retry management functionality
 *
 * This interface defines the contract for classes that provide retry logic
 * for executing functions with configurable retry behavior.
 *
 * @since 2.6.0
 */
export interface RetryInterface<Options> {
  /**
   * Wraps a function to make it retriable with the given options
   *
   * @template Arguments - The argument types of the function
   * @template Result - The return type of the function
   * @param fn - The function to make retriable
   * @param options - Optional retry options to override the default configuration
   * @returns A wrapped function that applies retry logic when called
   */
  makeRetriable<Arguments extends readonly unknown[], Result>(
    fn: (...args: Arguments) => Promise<Result>,
    options?: Options
  ): (...args: Arguments) => Promise<Result>;

  /**
   * Executes a function directly with retry logic applied
   *
   * @template Result - The return type of the function
   * @param fn - The function to execute with retry logic
   * @param options - Optional retry options to override the default configuration
   * @returns A promise that resolves with the function result or rejects with the final error
   */
  retry<Result>(
    fn: (attemptNumber: number) => Promise<Result> | Result,
    options?: Options
  ): Promise<Result>;
}
