/**
 * Request executor interface
 *
 * This interface defines the contract for classes that provide request execution functionality.
 * It allows you to execute requests with a given configuration.
 *
 * @since 3.0.0
 * @example
 * ```typescript
 * const executor = new RequestExecutor(adapter);
 * ```
 */
export interface RequestExecutorInterface<Config> {
  /**
   * Execute a request with the given configuration
   *
   * @param config - The configuration for the request
   * @returns A promise that resolves to the response of the request
   * @example
   * ```typescript
   * const response = await executor.request({ url: '/users', method: 'GET' });
   * ```
   */
  request(config: Config): Promise<unknown>;
}
