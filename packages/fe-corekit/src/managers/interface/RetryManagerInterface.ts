/**
 * Interface for retry management functionality
 *
 * This interface defines the contract for classes that provide retry logic
 * for executing functions with configurable retry behavior.
 *
 * @since 2.6.0
 * @interface RetryManagerInterface
 */
export interface RetryManagerInterface<Options> {
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
    fn: () => Promise<Result> | Result,
    options?: Options
  ): Promise<Result>;
}
