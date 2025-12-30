import {
  AbortManager,
  AbortManagerConfig,
  AbortManagerId
} from '../../managers';
import { AbortPlugin, AbortPluginOptions } from '../../executor';
import { RequestAdapterConfig } from '../interface';

/**
 * Configuration interface for Request Abort Plugin
 *
 * Combines abort manager configuration with request adapter configuration
 * to provide a complete configuration object for request abort operations.
 *
 * @since 2.6.0
 */
export interface RequestAbortPluginConfig
  extends AbortManagerConfig,
    RequestAdapterConfig {}

/**
 * Configuration options for the Request Abort Plugin
 *
 * Extends AbortPluginOptions with request-specific configuration and provides
 * dependency injection capabilities for the abort manager.
 *
 * @since 2.6.0
 */
export interface RequestAbortPluginOptions
  extends AbortPluginOptions<RequestAbortPluginConfig> {
  /**
   * Abort manager instance for managing abort controllers and resources
   *
   * Allows dependency injection of a custom abort manager implementation.
   * Useful for testing, custom abort logic, or sharing abort state across multiple plugins.
   * Must implement the `AbortManagerInterface<AbortManagerConfig>` contract.
   *
   * @default `new RequestAbortManager()`
   * @optional
   * @example Basic usage
   * ```typescript
   * abortManager: new RequestAbortManager()
   * ```
   *
   * @example For testing
   * ```typescript
   * abortManager: mockAbortManager // Mock implementation for unit tests
   * ```
   *
   * @example Shared abort manager
   * ```typescript
   * const sharedManager = new RequestAbortManager();
   * const plugin1 = new RequestAbortPlugin({ abortManager: sharedManager });
   * const plugin2 = new RequestAbortPlugin({ abortManager: sharedManager });
   * ```
   */
  abortManager?: RequestAbortManager;
}

/**
 * Specialized AbortManager for HTTP request abort management
 *
 * Extends the base AbortManager with request-specific ID generation logic.
 * Generates unique abort IDs based on request method, URL, parameters, and body
 * to ensure proper isolation and cleanup of individual request abort controllers.
 *
 * @since 2.6.0
 * @example
 * ```typescript
 * const manager = new RequestAbortManager();
 * const abortId = manager.generateAbortedId({
 *   method: 'POST',
 *   url: '/api/users',
 *   body: { name: 'John' }
 * });
 * ```
 */
export class RequestAbortManager extends AbortManager<RequestAbortPluginConfig> {
  /**
   * Generates a unique abort ID for the given request configuration
   *
   * Creates a deterministic string identifier based on request method, URL, params, and body.
   * This ensures that similar requests can be properly grouped and aborted together,
   * while maintaining isolation between different requests.
   *
   * ID format: `{method}-{url}-{paramsString}-{dataString}`
   *
   * @param config - The request configuration containing method, url, params, and body
   * @returns A unique string identifier for the abort operation
   * @throws Never throws - gracefully handles JSON serialization errors
   *
   * @example Basic GET request
   * ```typescript
   * generateAbortedId({ method: 'GET', url: '/api/users' })
   * // Returns: "GET-/api/users--"
   * ```
   *
   * @example POST request with body
   * ```typescript
   * generateAbortedId({
   *   method: 'POST',
   *   url: '/api/users',
   *   body: { name: 'John' }
   * })
   * // Returns: "POST-/api/users--{"name":"John"}"
   * ```
   *
   * @example Request with params
   * ```typescript
   * generateAbortedId({
   *   method: 'GET',
   *   url: '/api/users',
   *   params: { page: 1, limit: 10 }
   * })
   * // Returns: "GET-/api/users-{"page":1,"limit":10}-"
   * ```
   */
  public override generateAbortedId(
    config: RequestAbortPluginConfig
  ): AbortManagerId {
    if (config.requestId) {
      return config.requestId;
    }

    const { method = 'GET', url, params, body } = config;

    let paramsString;
    try {
      paramsString = params ? JSON.stringify(params) : '';
    } catch {
      paramsString = '';
    }

    let dataString;
    try {
      dataString = body ? JSON.stringify(body) : '';
    } catch {
      dataString = '';
    }

    return `${method}-${url}-${paramsString}-${dataString}`;
  }
}

/**
 * Factory function to create a new Request Abort Plugin instance
 *
 * Provides a convenient way to instantiate the abort plugin with proper defaults.
 * By default, uses `RequestAbortManager` for managing abort controllers and resources,
 * but allows dependency injection of custom abort managers for testing or advanced use cases.
 *
 * @param options - Configuration options for the plugin (optional)
 * @returns A new AbortPlugin instance configured for request abort management
 *
 * @example Basic usage
 * ```typescript
 * const plugin = createRequestAbortPlugin();
 * // Uses default RequestAbortManager
 * ```
 *
 * @example With custom abort manager
 * ```typescript
 * const customManager = new RequestAbortManager();
 * const plugin = createRequestAbortPlugin({
 *   abortManager: customManager,
 *   pluginName: 'CustomAbortPlugin'
 * });
 * ```
 *
 * @example With timeout configuration
 * ```typescript
 * const plugin = createRequestAbortPlugin({
 *   timeout: 5000, // 5 second timeout
 *   autoAbortOnUnmount: true
 * });
 * ```
 *
 * @since 2.6.0
 */
export function createRequestAbortPlugin(
  options?: RequestAbortPluginOptions
): AbortPlugin<RequestAbortPluginConfig> {
  return new AbortPlugin({
    ...options,
    pluginName: options?.pluginName ?? 'RequestAbortPlugin',
    abortManager: options?.abortManager ?? new RequestAbortManager()
  });
}
