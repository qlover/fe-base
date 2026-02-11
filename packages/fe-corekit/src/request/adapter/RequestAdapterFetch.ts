import { ExecutorError } from '../../executor';
import type {
  RequestAdapterConfig,
  RequestAdapterInterface,
  RequestAdapterResponse
} from '../interface';
import { merge, pick } from 'lodash-es';
import { ENV_FETCH_NOT_SUPPORT_ID, FETCHER_NONE_ID } from '../impl/consts';
import { isAbsoluteUrl } from '../utils/isAbsoluteUrl';

/**
 * Request adapter fetch configuration
 *
 * This type defines the configuration options for a request adapter.
 * It includes properties for URL, method, headers, and other request details.
 * The main purpose is to provide a flexible structure for configuring HTTP requests.
 *
 * @since 1.0.14
 */
export interface RequestAdapterFetchConfig<Request = unknown>
  extends
    RequestAdapterConfig<Request>,
    Omit<globalThis.RequestInit, 'headers'> {
  /**
   * The fetcher function
   *
   * You can override the default fetch function
   *
   * Some environments may not have a global fetch function, or you may want to override the default fetch logic.
   *
   * @example
   * ```typescript
   * const fetchRequest = new FetchRequest({ fetcher: customFetch });
   * ```
   *
   * @example Or configure it for each request
   * ```typescript
   * const fetchRequest = new FetchRequest();
   * fetchRequest.request({ url: '/data', fetcher: customFetch });
   * ```
   */
  fetcher?: typeof fetch;
}

const reqInitAttrs = [
  'cache',
  'credentials',
  'headers',
  'integrity',
  'keepalive',
  'mode',
  'priority',
  'redirect',
  'referrer',
  'referrerPolicy',
  'signal'
];

/**
 * Fetch-based HTTP request adapter implementing the RequestAdapterInterface
 *
 * This adapter provides a lightweight wrapper around the native Fetch API,
 * offering a standardized interface for making HTTP requests with configuration
 * management and response normalization.
 *
 * Core functionality:
 * - Fetch API abstraction: Unified interface for native fetch operations
 * - Configuration management: Default and per-request configuration merging
 * - Response normalization: Converts fetch Response to standardized format
 * - Environment detection: Automatic fetch availability checking
 *
 * Main features:
 * - Native fetch support: Uses browser/Node.js native fetch implementation
 *   - Automatic detection of fetch availability
 *   - Custom fetcher injection for testing or polyfills
 *   - Full support for fetch RequestInit options
 *
 * - Configuration merging: Combines default and request-specific settings
 *   - Deep merge of configuration objects
 *   - Per-request configuration override
 *   - Immutable default configuration
 *
 * - Response standardization: Converts fetch Response to adapter format
 *   - Extracts status, headers, and data
 *   - Maintains original Response object reference
 *   - Consistent response structure across adapters
 *
 * **Important: Lifecycle plugin support removed**
 *
 * The built-in executor and plugin system have been removed from this adapter.
 * If you need lifecycle hooks, request/response transformation, or plugin support,
 * use `RequestExecutor` to compose with this adapter:
 *
 * @example Using RequestExecutor for plugin support
 * ```typescript
 * import { RequestAdapterFetch } from './adapter/RequestAdapterFetch';
 * import { RequestExecutor } from './managers/RequestExecutor';
 * import { LifecycleExecutor } from '../executor';
 *
 * // Create adapter
 * const adapter = new RequestAdapterFetch({
 *   baseURL: 'https://api.example.com'
 * });
 *
 * // Create executor with lifecycle support
 * const lifecycleExecutor = new LifecycleExecutor();
 * const executor = new RequestExecutor(adapter, lifecycleExecutor);
 *
 * // Add plugins
 * executor.use(authPlugin);
 * executor.use(loggingPlugin);
 *
 * // Make requests with plugin support
 * const response = await executor.get('/users');
 * ```
 *
 * @example Basic usage without plugins
 * ```typescript
 * const adapter = new RequestAdapterFetch({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Content-Type': 'application/json' }
 * });
 *
 * const response = await adapter.request({
 *   url: '/users/123',
 *   method: 'GET'
 * });
 * ```
 *
 * @example Custom fetcher for testing
 * ```typescript
 * const mockFetch = async (input: RequestInfo) => {
 *   return new Response(JSON.stringify({ data: 'test' }));
 * };
 *
 * const adapter = new RequestAdapterFetch({
 *   fetcher: mockFetch
 * });
 * ```
 *
 * @example Per-request configuration override
 * ```typescript
 * const adapter = new RequestAdapterFetch({
 *   baseURL: 'https://api.example.com',
 *   headers: { 'Authorization': 'Bearer token' }
 * });
 *
 * // Override headers for specific request
 * const response = await adapter.request({
 *   url: '/public/data',
 *   headers: { 'Authorization': '' } // Remove auth for public endpoint
 * });
 * ```
 *
 * @since 1.0.14
 */
export class RequestAdapterFetch implements RequestAdapterInterface<RequestAdapterFetchConfig> {
  /**
   * Default configuration for the request adapter
   *
   * This configuration is used as the base for all requests and is merged
   * with per-request configurations. It includes:
   * - Base URL for all requests
   * - Default headers
   * - Fetch options (credentials, mode, cache, etc.)
   * - Custom fetcher function
   *
   * The configuration is immutable after initialization to prevent accidental
   * modifications. Use `setConfig()` to update configuration if needed.
   */
  public readonly config: RequestAdapterFetchConfig;

  /**
   * Creates a new RequestAdapterFetch instance
   *
   * Automatically detects and configures fetch implementation. If no custom
   * fetcher is provided, uses the global fetch function. Validates fetch
   * availability in the current environment.
   *
   * Initialization flow:
   * 1. Check if custom fetcher is provided
   * 2. If not, validate global fetch availability
   * 3. Assign fetcher to configuration
   * 4. Store configuration for future requests
   *
   * @param config - Request adapter configuration options
   * @param {typeof fetch} [config.fetcher] - Custom fetch implementation
   * @param {string} [config.baseURL] - Base URL for all requests
   * @param {HeadersInit} [config.headers] - Default headers for all requests
   * @param {RequestCache} [config.cache] - Cache mode for requests
   * @param {RequestCredentials} [config.credentials] - Credentials mode
   * @param {RequestMode} [config.mode] - CORS mode
   *
   * @throws {ExecutorError} When fetch is not available in the environment
   *
   * @example Basic initialization
   * ```typescript
   * const adapter = new RequestAdapterFetch({
   *   baseURL: 'https://api.example.com'
   * });
   * ```
   *
   * @example With custom headers
   * ```typescript
   * const adapter = new RequestAdapterFetch({
   *   baseURL: 'https://api.example.com',
   *   headers: {
   *     'Content-Type': 'application/json',
   *     'Authorization': 'Bearer token'
   *   }
   * });
   * ```
   *
   * @example With custom fetcher
   * ```typescript
   * import fetch from 'node-fetch';
   *
   * const adapter = new RequestAdapterFetch({
   *   fetcher: fetch as typeof globalThis.fetch
   * });
   * ```
   *
   * @example With fetch options
   * ```typescript
   * const adapter = new RequestAdapterFetch({
   *   baseURL: 'https://api.example.com',
   *   credentials: 'include',
   *   mode: 'cors',
   *   cache: 'no-cache'
   * });
   * ```
   */
  constructor(config: Partial<RequestAdapterFetchConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new ExecutorError(ENV_FETCH_NOT_SUPPORT_ID);
      }

      config.fetcher = fetch;
    }

    this.config = config as RequestAdapterFetchConfig;
  }

  /**
   * Get the current default configuration
   *
   * Returns the adapter's default configuration that will be merged with
   * per-request configurations. This is useful for inspecting current settings
   * or creating derived configurations.
   *
   * @override
   * @returns Current adapter configuration
   *
   * @example
   * ```typescript
   * const adapter = new RequestAdapterFetch({ baseURL: 'https://api.example.com' });
   * const config = adapter.getConfig();
   * console.log(config.baseURL); // 'https://api.example.com'
   * ```
   */
  public getConfig(): RequestAdapterFetchConfig {
    return this.config;
  }

  /**
   * Update the default configuration
   *
   * Merges the provided configuration with existing default configuration.
   * This affects all subsequent requests made through this adapter.
   *
   * Note: This modifies the adapter's configuration in place. Use with caution
   * in shared adapter instances.
   *
   * @override
   * @param config - Configuration to merge with existing defaults
   *
   * @example Update base URL
   * ```typescript
   * const adapter = new RequestAdapterFetch({ baseURL: 'https://api.example.com' });
   * adapter.setConfig({ baseURL: 'https://api-v2.example.com' });
   * ```
   *
   * @example Add default headers
   * ```typescript
   * adapter.setConfig({
   *   headers: { 'Authorization': 'Bearer new-token' }
   * });
   * ```
   *
   * @since 2.4.0
   */
  public setConfig(
    config: RequestAdapterFetchConfig | Partial<RequestAdapterFetchConfig>
  ): void {
    Object.assign(this.config, config);
  }

  /**
   * Execute an HTTP request using the Fetch API
   *
   * This is the core method that performs HTTP requests. It merges the provided
   * configuration with adapter defaults, validates required parameters, executes
   * the fetch request, and normalizes the response.
   *
   * Request execution flow:
   * 1. Merge request config with adapter defaults (deep merge)
   * 2. Validate fetcher function availability
   * 3. Validate URL presence
   * 4. Convert merged config to fetch Request object
   * 5. Execute fetch request
   * 6. Normalize Response to adapter format
   * 7. Return standardized response
   *
   * Configuration merging:
   * - Adapter defaults are used as base
   * - Request-specific config overrides defaults
   * - Headers, params, and other objects are deep merged
   *
   * @override
   * @template Request - Request data type
   * @template Response - Expected response data type
   *
   * @param config - Request configuration
   * @param {string} config.url - Request URL (required, relative to baseURL or absolute)
   * @param {string} [config.method='GET'] - HTTP method
   * @param {Request} [config.data] - Request body data
   * @param {HeadersInit} [config.headers] - Request headers
   * @param {RequestCache} [config.cache] - Cache mode
   * @param {RequestCredentials} [config.credentials] - Credentials mode
   * @param {RequestMode} [config.mode] - CORS mode
   * @param {typeof fetch} [config.fetcher] - Override fetcher for this request
   *
   * @returns {Promise<RequestAdapterResponse<Request, Response>>} Promise resolving to normalized response
   *
   * @throws {ExecutorError} When fetcher is not available (RequestErrorID.FETCHER_NONE)
   * @throws {ExecutorError} When URL is not provided (RequestErrorID.URL_NONE)
   *
   * @example Basic GET request
   * ```typescript
   * const response = await adapter.request({
   *   url: '/users/123',
   *   method: 'GET'
   * });
   * console.log(response.data);
   * ```
   *
   * @example POST request with data
   * ```typescript
   * const response = await adapter.request({
   *   url: '/users',
   *   method: 'POST',
   *   data: { name: 'John Doe', email: 'john@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   *
   * @example Request with custom fetch options
   * ```typescript
   * const response = await adapter.request({
   *   url: '/api/data',
   *   method: 'GET',
   *   credentials: 'include',
   *   cache: 'no-cache',
   *   mode: 'cors'
   * });
   * ```
   *
   * @example Override fetcher for specific request
   * ```typescript
   * const response = await adapter.request({
   *   url: '/data',
   *   fetcher: customFetch
   * });
   * ```
   */
  public async request<Request, Response>(
    config: RequestAdapterFetchConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge(
      {},
      thisConfig,
      config
    ) as RequestAdapterFetchConfig<Request>;
    const { fetcher, ...rest } = mergedConfig;

    if (typeof fetcher !== 'function') {
      throw new ExecutorError(FETCHER_NONE_ID);
    }

    // Convert configuration to fetch Request object
    const request = this.parametersToRequest(rest);

    // Execute fetch request
    const response = await fetcher(request);

    // Normalize response to adapter format
    const result = this.toAdapterResponse(response, response, rest);

    return result as RequestAdapterResponse<Request, Response>;
  }

  /**
   * Builds URL from url and baseURL
   *
   * Combines the request URL with baseURL if needed. Handles both absolute
   * and relative URLs appropriately.
   *
   * URL construction rules:
   * - Absolute URLs (starting with `http://` or `https://`) are used directly
   * - Relative URLs are concatenated with baseURL if provided
   * - Handles trailing slash in baseURL to avoid double slashes
   * - If no baseURL, relative URLs are used as-is (browser resolves them)
   *
   * @param url - The URL path (absolute or relative)
   * @param baseURL - The base URL to use for relative paths
   * @returns Complete URL string
   *
   * @example
   * ```typescript
   * this.buildRequestUrl('/users', 'https://api.example.com');
   * // Returns: 'https://api.example.com/users'
   *
   * this.buildRequestUrl('/users', 'https://api.example.com/');
   * // Returns: 'https://api.example.com/users'
   *
   * this.buildRequestUrl('https://other.com/data', 'https://api.example.com');
   * // Returns: 'https://other.com/data'
   *
   * this.buildRequestUrl('/users', undefined);
   * // Returns: '/users'
   * ```
   */
  protected buildRequestUrl(url: string, baseURL?: string): string {
    if (isAbsoluteUrl(url)) {
      return url;
    }

    if (!baseURL) {
      return url;
    }

    // If url starts with baseURL, return url
    if (url.startsWith(baseURL)) {
      return url;
    }

    // Remove trailing slash from baseURL if url starts with slash
    if (baseURL.endsWith('/') && url.startsWith('/')) {
      return baseURL.slice(0, -1) + url;
    }

    return baseURL + url;
  }

  /**
   * Convert adapter configuration to fetch Request object
   *
   * Transforms the adapter's configuration format into a native fetch Request object.
   * Extracts relevant fetch options and constructs a properly formatted request.
   *
   * Conversion process:
   * 1. Extract URL and method from configuration
   * 2. Build complete URL using baseURL if needed
   * 3. Pick fetch-specific options (cache, credentials, headers, etc.)
   * 4. Add request body data if present
   * 5. Normalize HTTP method to uppercase
   * 6. Create and return fetch Request object
   *
   * @param parameters - Adapter configuration to convert
   * @returns Native fetch Request object ready for execution
   *
   * @example
   * ```typescript
   * const request = this.parametersToRequest({
   *   url: '/users',
   *   method: 'POST',
   *   data: { name: 'John' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   */
  protected parametersToRequest(
    parameters: RequestAdapterFetchConfig
  ): Request {
    const { url = '/', baseURL, method = 'GET', data } = parameters;
    const init = pick(parameters, reqInitAttrs);
    return new Request(
      this.buildRequestUrl(url, baseURL),
      Object.assign(init, {
        // FIXME: data is unknown type
        body: data as BodyInit,
        method: method.toUpperCase()
      })
    );
  }

  /**
   * Convert fetch Response to standardized adapter response format
   *
   * Normalizes the native fetch Response object into the adapter's standard
   * response format. This ensures consistent response structure across different
   * adapter implementations.
   *
   * Response structure includes:
   * - data: Response data (raw Response object in this case)
   * - status: HTTP status code
   * - statusText: HTTP status message
   * - headers: Response headers as key-value record
   * - config: Original request configuration
   * - response: Original fetch Response object reference
   *
   * @template Request - Request data type
   * @template Res - Response data type
   *
   * @param data - Response data to include in adapter response
   * @param response - Original fetch Response object
   * @param config - Request configuration used for this request
   *
   * @returns Standardized adapter response object
   *
   * @example
   * ```typescript
   * const adapterResponse = this.toAdapterResponse(
   *   responseData,
   *   fetchResponse,
   *   requestConfig
   * );
   * console.log(adapterResponse.status); // 200
   * console.log(adapterResponse.headers); // { 'content-type': 'application/json' }
   * ```
   */
  protected toAdapterResponse<Request, Res = unknown>(
    data: Res,
    response: Response,
    config: RequestAdapterFetchConfig<Request>
  ): RequestAdapterResponse<Request, Res> {
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.getResponseHeaders(response),
      config,
      response
    };
  }

  /**
   * Extract headers from fetch Response as key-value record
   *
   * Converts the fetch Response's Headers object (which uses an iterator interface)
   * into a plain JavaScript object for easier access and manipulation.
   *
   * This is necessary because:
   * - Fetch Headers use an iterator-based API
   * - Adapter response format expects a plain object
   * - Consistent header access across different adapters
   *
   * @param response - Fetch Response object containing headers
   * @returns Plain object with header names as keys and values as strings
   *
   * @example
   * ```typescript
   * const headers = this.getResponseHeaders(response);
   * console.log(headers);
   * // {
   * //   'content-type': 'application/json',
   * //   'content-length': '1234',
   * //   'cache-control': 'no-cache'
   * // }
   * ```
   */
  protected getResponseHeaders(response: Response): Record<string, string> {
    const headersObj: Record<string, string> = {};

    response.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    return headersObj;
  }
}
