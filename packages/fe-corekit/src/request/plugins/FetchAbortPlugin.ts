import {
  RequestErrorID,
  RequestError,
  type RequestAdapterConfig
} from '../interface';
import type { ExecutorPlugin, ExecutorContext } from '../../executor';

/**
 * Plugin for handling request cancellation
 * Provides abort functionality for fetch requests
 *
 * - Core Idea: Enhance request management with cancellation capabilities.
 * - Main Function: Allow requests to be aborted programmatically.
 * - Main Purpose: Improve control over network requests and resource management.
 *
 * Features:
 * - Request cancellation support
 * - Automatic cleanup of aborted requests
 * - Multiple concurrent request handling
 * - Custom abort callbacks
 *
 * **Not Support**
 * - Abort signal from outside
 *
 * Request parameters serialized to be used as unique identifiers.
 * Or you can pass in a specific requestid.
 *
 * You can also manually specify an onAbort callback that will be executed after termination.
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
 *
 * @example
 *
 * Use RequestId to identify the request
 *
 * ```typescript
 * const abortPlugin = new AbortPlugin();
 * const client = new FetchRequest();
 * client.executor.use(abortPlugin);
 *
 * // Abort specific request
 * const config = { url: '/api/data', requestId: '123' };
 * abortPlugin.abort(config);
 * // or
 * abortPlugin.abort('123');
 * ```
 */
export class FetchAbortPlugin implements ExecutorPlugin {
  public readonly pluginName = 'FetchAbortPlugin';
  public readonly onlyOne = true;

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
   *
   * @example
   * ```typescript
   * const key = abortPlugin.generateRequestKey(config);
   * ```
   */
  private generateRequestKey(config: RequestAdapterConfig): string {
    if (config.requestId) {
      return config.requestId;
    }

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
   *
   * @example
   * ```typescript
   * const modifiedConfig = abortPlugin.onBefore(config);
   * ```
   */
  public onBefore(context: ExecutorContext<RequestAdapterConfig>): void {
    const key = this.generateRequestKey(context.parameters);

    // abort previous request
    if (this.controllers.has(key)) {
      this.abort(context.parameters);
    }

    // Check if config already has a signal
    if (!context.parameters.signal) {
      const controller = new AbortController();
      this.controllers.set(key, controller);

      // extends config with abort signal
      context.parameters.signal = controller.signal;
    }
  }

  public onSuccess({
    parameters
  }: ExecutorContext<RequestAdapterConfig>): void {
    // delete controller
    if (parameters) {
      this.controllers.delete(this.generateRequestKey(parameters));
    }
  }

  /**
   * Error handling hook for abort scenarios
   * Processes different types of abort errors and cleans up resources
   *
   * @param error - Original error
   * @param config - Request configuration
   * @returns RequestError or void
   *
   * @example
   * ```typescript
   * const error = abortPlugin.onError(new Error('AbortError'), config);
   * ```
   */
  public onError({
    error,
    parameters
  }: ExecutorContext<RequestAdapterConfig>): RequestError | void {
    // only handle plugin related error，other error should be handled by other plugins
    if (this.isSameAbortError(error)) {
      if (parameters) {
        // controller may be deleted in .abort, this is will be undefined
        const key = this.generateRequestKey(parameters);
        const controller = this.controllers.get(key);
        this.controllers.delete(key);

        return new RequestError(
          RequestErrorID.ABORT_ERROR,
          controller?.signal.reason || error
        );
      }
    }
  }

  /**
   * Determines if the given error is an abort error.
   *
   * - Identify errors that are related to request abortion.
   * - Check error properties to determine if it's an abort error.
   * - Provide a unified method to recognize abort errors.
   *
   * @param error - The error to check
   * @returns True if the error is an abort error, false otherwise
   *
   */
  public isSameAbortError(error?: Error): boolean {
    // Check if the error is an instance of AbortError
    if (error instanceof Error && error.name === 'AbortError') {
      return true;
    }

    // Check for DOMException with abort-related message
    if (error instanceof DOMException && error.name === 'AbortError') {
      return true;
    }

    // Check for Event with auto trigger abort
    // use: signal.addEventListener('abort')
    if (error instanceof Event && error.type === 'abort') {
      return true;
    }

    // Add any additional conditions that signify an abort error
    // For example, custom error types or specific error codes

    return false;
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
  public abort(config: RequestAdapterConfig | string): void {
    const key =
      typeof config === 'string' ? config : this.generateRequestKey(config);
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort(
        new RequestError(
          RequestErrorID.ABORT_ERROR,
          'The operation was aborted'
        )
      );
      // delete controller
      this.controllers.delete(key);

      if (typeof config !== 'string' && typeof config.onAbort === 'function') {
        config.onAbort.call(config, config);
      }
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
  public abortAll(): void {
    this.controllers.forEach((controller) => controller.abort());
    this.controllers.clear();
  }
}
