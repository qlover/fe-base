import { ExecutorPlugin } from '../../executor';
import { RequestAdapterFetchConfig } from '../RequestAdapterFetch';
import { RequestError } from '../RequestError';
import { RequestErrorID } from '../RequestError';

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
 * Core Idea: Enhance request management with cancellation capabilities.
 * Main Function: Allow requests to be aborted programmatically.
 * Main Purpose: Improve control over network requests and resource management.
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
export class FetchAbortPlugin implements ExecutorPlugin {
  /**
   * Map to store active AbortControllers
   * Keys are generated from request config
   */
  private controllers: Map<string, AbortController> = new Map();

  /**
   * Generates unique key for request identification
   * Combines method, URL, params, and body to create unique identifier
   *
   * Core Idea: Uniquely identify requests for management.
   * Main Function: Generate a consistent key for each request.
   * Main Purpose: Facilitate request tracking and cancellation.
   *
   * @param config - Request configuration
   * @returns Unique request identifier
   *
   * @example
   * ```typescript
   * const key = abortPlugin.generateRequestKey(config);
   * ```
   */
  private generateRequestKey(config: RequestAdapterFetchConfig): string {
    const data = config?.data || config?.body || null;
    const params = config?.params ? JSON.stringify(config.params) : '';
    const dataString = data ? JSON.stringify(data) : '';
    return `${config?.method || 'GET'}-${config?.url}-${params}-${dataString}`;
  }

  getController(
    config: RequestAdapterFetchConfig
  ): [string | undefined, AbortController | undefined] {
    const key = this.generateRequestKey(config);
    const controller = this.controllers.get(key);
    return [key, controller];
  }

  /**
   * Pre-request hook that sets up abort handling
   * Creates new AbortController and cancels any existing request with same key
   *
   * Core Idea: Prepare requests for potential cancellation.
   * Main Function: Attach abort controllers to requests.
   * Main Purpose: Enable request cancellation and resource cleanup.
   *
   * @param config - Request configuration
   * @returns Modified configuration with abort control
   *
   * @example
   * ```typescript
   * const modifiedConfig = abortPlugin.onBefore(config);
   * ```
   */
  onBefore(config: RequestAdapterFetchConfig): RequestAdapterFetchConfig {
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
   * Core Idea: Handle errors resulting from request cancellation.
   * Main Function: Identify and process abort-related errors.
   * Main Purpose: Ensure proper error handling and resource cleanup.
   *
   * @param error - Original error
   * @param config - Request configuration
   * @returns {RequestError | void}
   *
   * @example
   * ```typescript
   * const error = abortPlugin.onError(new Error('AbortError'), config);
   * ```
   */
  onError(
    error: Error,
    config?: RequestAdapterFetchConfig
  ): RequestError | void {
    // if error is a abortError (DOMException or regular AbortError)
    if (
      error &&
      (error.name === 'AbortError' || error instanceof DOMException)
    ) {
      return new RequestError(RequestErrorID.ABORT_ERROR, error);
    }

    const [key, controller] = config ? this.getController(config) : [];
    if (key && controller) {
      this.controllers.delete(key);
      const reason = controller.signal.reason;

      // reason maybe a DOMException or a RequestError
      if (reason instanceof RequestError) {
        return reason;
      }

      if (reason instanceof DOMException) {
        return new RequestError(RequestErrorID.ABORT_ERROR, reason);
      }

      if (controller.signal.aborted) {
        return new RequestError(RequestErrorID.ABORT_ERROR, error);
      }
    }
  }

  /**
   * Aborts a specific request
   * Triggers abort callback if provided
   *
   * Core Idea: Provide a mechanism to cancel specific requests.
   * Main Function: Abort a request and execute any associated callbacks.
   * Main Purpose: Allow precise control over individual request lifecycles.
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
  abort(config: RequestAdapterFetchConfig): void {
    const [key, controller] = this.getController(config);

    if (key && controller && !controller.signal.aborted) {
      console.log('abort=======', key, controller);
      controller.abort(
        new RequestError(
          RequestErrorID.ABORT_ERROR,
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
   * Core Idea: Provide a mechanism to cancel all active requests.
   * Main Function: Abort all requests and clear associated resources.
   * Main Purpose: Allow bulk cancellation of requests, useful in cleanup scenarios.
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
