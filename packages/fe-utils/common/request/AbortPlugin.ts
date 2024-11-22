import { ExecutorPlugin } from '../executor';
import { FetchRequestError, FetchRequestErrorID } from './FetchRequest';
import { FetchRequestConfig } from './FetchRequestConfig';

/**
 * Plugin for handling request cancellation
 * Provides abort functionality for fetch requests
 *
 * Features:
 * - Request cancellation support
 * - Automatic cleanup of aborted requests
 * - Multiple concurrent request handling
 * - Custom abort callbacks
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * // Basic usage
 * const abortPlugin = new AbortPlugin();
 * const client = new FetchRequest();
 * client.executor.use(abortPlugin);
 *
 * // Abort specific request
 * const config = { url: '/api/data' };
 * abortPlugin.abort(config);
 *
 * // Abort all pending requests
 * abortPlugin.abortAll();
 * ```
 */
export class AbortPlugin implements ExecutorPlugin {
  /**
   * Map to store active AbortControllers
   * Keys are generated from request config
   */
  private controllers: Map<string, AbortController> = new Map();

  /**
   * Generates unique key for request identification
   * Combines method, URL, params, and body to create unique identifier
   *
   * @param config - Request configuration
   * @returns Unique request identifier
   */
  private generateRequestKey(config: FetchRequestConfig): string {
    const params = config.params ? JSON.stringify(config.params) : '';
    const data = config.body ? JSON.stringify(config.body) : '';
    return `${config.method || 'GET'}-${config.url}-${params}-${data}`;
  }

  /**
   * Pre-request hook that sets up abort handling
   * Creates new AbortController and cancels any existing request with same key
   *
   * @param config - Request configuration
   * @returns Modified configuration with abort control
   */
  onBefore(config: FetchRequestConfig): FetchRequestConfig {
    const key = this.generateRequestKey(config);

    // abort previous request
    if (this.controllers.has(key)) {
      this.abort(config);
    }

    const controller = new AbortController();
    this.controllers.set(key, controller);

    config.controller = controller;
    config.signal = controller.signal;
    return config;
  }

  /**
   * Error handling hook for abort scenarios
   * Processes different types of abort errors and cleans up resources
   *
   * @param error - Original error
   * @param config - Request configuration
   * @returns FetchRequestError or void
   */
  onError(error: Error, config?: FetchRequestConfig): FetchRequestError | void {
    // if error is a abortError (DOMException or regular AbortError)
    if (
      error &&
      (error.name === 'AbortError' || error instanceof DOMException)
    ) {
      return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, error);
    }

    if (config && config.controller) {
      this.controllers.delete(this.generateRequestKey(config));
      const reason = config.controller.signal.reason;

      // reason maybe a DOMException or a FetchRequestError
      if (reason instanceof FetchRequestError) {
        return reason;
      }

      if (reason instanceof DOMException) {
        return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, reason);
      }

      if (config.controller.signal.aborted) {
        return new FetchRequestError(FetchRequestErrorID.ABORT_ERROR, error);
      }
    }
  }

  /**
   * Aborts a specific request
   * Triggers abort callback if provided
   *
   * @param config - Configuration of request to abort
   *
   * @example
   * ```typescript
   * abortPlugin.abort({
   *   url: '/api/data',
   *   onAbort: (config) => {
   *     console.log('Request aborted:', config.url);
   *   }
   * });
   * ```
   */
  abort(config: FetchRequestConfig): void {
    const key = this.generateRequestKey(config);
    const controller = this.controllers.get(key);
    if (controller && !controller.signal.aborted) {
      controller.abort(
        new FetchRequestError(
          FetchRequestErrorID.ABORT_ERROR,
          'The operation was aborted'
        )
      );
      this.controllers.delete(key);
      config.onAbort?.(config);
    }
  }

  /**
   * Aborts all pending requests
   * Clears all stored controllers
   *
   * @example
   * ```typescript
   * // Cancel all requests when component unmounts
   * useEffect(() => {
   *   return () => abortPlugin.abortAll();
   * }, []);
   * ```
   */
  abortAll(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}
