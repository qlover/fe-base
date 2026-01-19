import type {
  RequestAdapterConfig,
  RequestAdapterInterface,
  RequestAdapterResponse
} from '../interface/RequestAdapter';
import { clone } from 'lodash-es';
import { type RequestInterface } from '../interface/RequestInterface';
import {
  type ExecutorContextInterface,
  type LifecycleExecutor,
  type LifecyclePluginInterface
} from '../../executor';
import { HttpMethods } from '../utils/httpMethods';

type URL = string;
type ConfigData<C extends RequestAdapterConfig> = C['data'];

/**
 * Conditional response type that normalizes adapter responses
 *
 * Type resolution logic:
 * - If `R` already extends `RequestAdapterResponse`, return `R` as is to preserve existing structure
 * - Otherwise, wrap `R` in `RequestAdapterResponse` to ensure consistent response format
 *
 * This allows plugins and adapters to work with a unified response structure while
 * maintaining flexibility for custom response types.
 *
 * @template C - Request adapter configuration type
 * @template R - Raw response type from adapter or plugin
 */
type RequestExecutorResponse<C extends RequestAdapterConfig, R> =
  R extends RequestAdapterResponse<unknown, unknown>
    ? R
    : RequestAdapterResponse<ConfigData<C>, R>;

/**
 * Configuration type for HTTP shortcut methods
 *
 * Excludes `url` and `method` properties to prevent conflicts since these are
 * automatically set by shortcut methods (get, post, put, etc.).
 *
 * Uses intersection with `never` type to enforce compile-time prevention of
 * these properties while preserving all other configuration options and type inference.
 *
 * @template C - Base request adapter configuration type
 */
type ShortcutConfig<C extends RequestAdapterConfig> = C & {
  url?: never;
  method?: never;
};

/**
 * Configuration type for HTTP methods without request body (GET, DELETE, HEAD, OPTIONS)
 *
 * Extends `ShortcutConfig` with optional `params` property for query parameters.
 * This type is specifically designed for HTTP methods that don't accept a request body.
 *
 * @template C - Base request adapter configuration type
 * @template Params - Query parameters type
 */
type ShortcutNoBodyConfig<
  C extends RequestAdapterConfig,
  Params
> = ShortcutConfig<C> & {
  params?: Params;
};

/**
 * HTTP request executor with lifecycle plugin support and adapter abstraction
 *
 * Core functionality:
 * - Request execution: Unified interface for making HTTP requests through various adapters
 * - Lifecycle management: Plugin-based request/response transformation pipeline
 * - Configuration merging: Automatic merging of default and request-specific configurations
 * - HTTP method shortcuts: Convenient methods for common HTTP operations (GET, POST, etc.)
 *
 * Main features:
 * - Adapter abstraction: Works with any adapter implementing `RequestAdapterInterface`
 *   - Supports multiple HTTP clients (Axios, Fetch, etc.)
 *   - Allows custom adapter implementations
 *   - Maintains consistent API regardless of underlying HTTP client
 *
 * - Plugin system: Extensible lifecycle hooks for request/response processing
 *   - Transform requests before sending (add headers, modify data, etc.)
 *   - Transform responses after receiving (parse data, handle errors, etc.)
 *   - Chain multiple plugins for complex processing pipelines
 *   - Type-safe plugin integration with full TypeScript support
 *
 * - Type safety: Full TypeScript support with generic type parameters
 *   - Request configuration types
 *   - Response data types
 *   - Query parameter types
 *   - Plugin context types
 *
 * - HTTP shortcuts: Convenient methods for standard HTTP operations
 *   - GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
 *   - Automatic method and URL configuration
 *   - Type-safe request/response handling
 *
 * @template Config - Request adapter configuration type extending `RequestAdapterConfig`
 * @template Ctx - Executor context type extending `ExecutorContextInterface<Config>`
 *
 * @example Basic usage without plugins
 * ```typescript
 * const adapter = new RequestAdapterAxios({ baseURL: 'https://api.example.com' });
 * const executor = new RequestExecutor(adapter);
 *
 * // Make a GET request
 * const response = await executor.get<User>('/users/123');
 * ```
 *
 * @example Usage with lifecycle plugins
 * ```typescript
 * const adapter = new RequestAdapterAxios({ baseURL: 'https://api.example.com' });
 * const lifecycleExecutor = new LifecycleExecutor();
 * const executor = new RequestExecutor(adapter, lifecycleExecutor);
 *
 * // Add authentication plugin
 * executor.use({
 *   pluginName: 'auth',
 *   onBefore: async (ctx) => {
 *     // Return new parameters to update context
 *     return {
 *       ...ctx.parameters,
 *       headers: {
 *         ...ctx.parameters.headers,
 *         Authorization: `Bearer ${getToken()}`
 *       }
 *     };
 *   }
 * });
 *
 * // Add response transformation plugin
 * executor.use({
 *   pluginName: 'transform',
 *   onSuccess: async (ctx) => {
 *     // Transform response data
 *     if (ctx.returnValue?.data) {
 *       ctx.returnValue.data = processData(ctx.returnValue.data);
 *     }
 *   }
 * });
 *
 * // Add error handling plugin
 * executor.use({
 *   pluginName: 'errorHandler',
 *   onError: async (ctx) => {
 *     console.error('Request failed:', ctx.error);
 *   }
 * });
 *
 * // Make requests with plugins applied
 * const user = await executor.get<User>('/users/123');
 * ```
 *
 * @example Using different HTTP methods
 * ```typescript
 * // GET request with query parameters
 * const users = await executor.get<User[], { page: number }>('/users', {
 *   params: { page: 1 }
 * });
 *
 * // POST request with data
 * const newUser = await executor.post<User, CreateUserDto>('/users', {
 *   name: 'John Doe',
 *   email: 'john@example.com'
 * });
 *
 * // PUT request to update resource
 * const updatedUser = await executor.put<User, UpdateUserDto>('/users/123', {
 *   name: 'Jane Doe'
 * });
 *
 * // DELETE request
 * await executor.delete('/users/123');
 * ```
 */
export class RequestExecutor<
  Config extends RequestAdapterConfig,
  Ctx extends ExecutorContextInterface<Config>
> implements RequestInterface<Config>
{
  constructor(
    /**
     * HTTP request adapter instance
     *
     * The adapter abstracts the underlying HTTP client implementation (Axios, Fetch, etc.)
     * and provides a unified interface for making requests. It handles:
     * - HTTP client initialization and configuration
     * - Request execution and response handling
     * - Default configuration management
     * - Error handling and normalization
     *
     * @example Using Axios adapter
     * ```typescript
     * const adapter = new RequestAdapterAxios({
     *   baseURL: 'https://api.example.com',
     *   timeout: 5000
     * });
     * ```
     *
     * @example Using Fetch adapter
     * ```typescript
     * const adapter = new RequestAdapterFetch({
     *   baseURL: 'https://api.example.com',
     *   timeout: 5000
     * });
     * ```
     */
    protected readonly adapter: RequestAdapterInterface<Config>,
    /**
     * Optional lifecycle executor for plugin management
     *
     * When provided, enables plugin-based request/response transformation pipeline.
     * Plugins can intercept and modify requests before sending and responses after receiving.
     *
     * Plugin execution flow:
     * 1. Before hooks: Execute in registration order before request
     * 2. Request execution: Adapter sends the request
     * 3. After hooks: Execute in reverse order after response
     * 4. Error hooks: Execute if any error occurs
     *
     * @optional
     * @default `undefined` (plugins disabled)
     *
     * @example With lifecycle executor
     * ```typescript
     * const lifecycleExecutor = new LifecycleExecutor();
     * const executor = new RequestExecutor(adapter, lifecycleExecutor);
     *
     * // Plugins can now be registered via use() method
     * executor.use(authPlugin);
     * executor.use(loggingPlugin);
     * ```
     */
    protected readonly executor?: LifecycleExecutor<Ctx>
  ) {}

  /**
   * Register a lifecycle plugin for request/response processing
   *
   * Plugins are executed in registration order for `onBefore` hooks and reverse order
   * for `onSuccess` hooks, allowing for proper request/response transformation chains.
   *
   * Plugin capabilities:
   * - Modify request configuration before sending (headers, data, params, etc.)
   * - Transform response data after receiving
   * - Handle errors and implement retry logic
   * - Add logging, metrics, and monitoring
   * - Implement authentication and authorization
   *
   * @template Ctx - Executor context type extending `ExecutorContextInterface<Config>`
   *
   * @param plugin - Lifecycle plugin implementing `LifecyclePluginInterface<Ctx>`
   *
   * Plugin structure:
   * - `pluginName`: Optional plugin identifier for debugging and logging
   * - `onlyOne`: If `true`, ensures only one instance of this plugin type can be registered
   * - `enabled`: Optional function to conditionally enable/disable the plugin
   * - `onBefore`: Optional hook executed before request, can modify parameters via return value
   *   - Type: `(ctx: Ctx) => Param | Promise<Param> | void | Promise<void>`
   *   - Can return new parameters to update context, or void to keep existing parameters
   * - `onSuccess`: Optional hook executed after successful request completion
   *   - Type: `(ctx: Ctx) => void | Promise<void>`
   *   - Can be used for logging, metrics, or response transformation
   * - `onError`: Optional hook executed when errors occur during request
   *   - Type: `(ctx: Ctx) => LifecycleErrorResult | Promise<LifecycleErrorResult>`
   *   - Can handle, transform, or suppress errors
   * - `onExec`: Optional hook to intercept or wrap the request task execution
   *   - Type: `(ctx: Ctx, task: ExecutorTask<Result, Param>) => LifecycleExecResult<Result, Param> | Promise<LifecycleExecResult<Result, Param>>`
   *   - Can return a value directly, return a new task function, or execute the task
   *
   * @returns {this} Current executor instance for method chaining
   *
   * @throws {Error} When executor is not initialized (constructor didn't receive executor)
   *
   * @example Register authentication plugin
   * ```typescript
   * executor.use({
   *   pluginName: 'auth',
   *   onBefore: async (ctx) => {
   *     const token = await getAuthToken();
   *     // Return new parameters to update context
   *     return {
   *       ...ctx.parameters,
   *       headers: {
   *         ...ctx.parameters.headers,
   *         Authorization: `Bearer ${token}`
   *       }
   *     };
   *   }
   * });
   * ```
   *
   * @example Register response transformation plugin
   * ```typescript
   * executor.use({
   *   pluginName: 'transform',
   *   onSuccess: async (ctx) => {
   *     // Transform response data
   *     if (ctx.returnValue?.data) {
   *       ctx.returnValue.data = processData(ctx.returnValue.data);
   *     }
   *   }
   * });
   * ```
   *
   * @example Register error handling plugin
   * ```typescript
   * executor.use({
   *   pluginName: 'errorHandler',
   *   onError: async (ctx) => {
   *     console.error('Request failed:', ctx.error);
   *     // Can return ExecutorError to modify error
   *     return new ExecutorError('CUSTOM_ERROR', ctx.error as Error);
   *   }
   * });
   * ```
   *
   * @example Chain multiple plugins
   * ```typescript
   * executor
   *   .use(authPlugin)
   *   .use(loggingPlugin)
   *   .use(retryPlugin)
   *   .use(cachePlugin);
   * ```
   */
  public use(plugin: LifecyclePluginInterface<Ctx>): this {
    if (!this.executor) {
      throw new Error('RequestExecutor: Executor is not set');
    }

    this.executor.use(plugin);

    return this;
  }

  /**
   * Execute an HTTP request with the provided configuration
   *
   * This is the core method that handles all HTTP requests. It merges the provided
   * configuration with adapter defaults and executes the request through the lifecycle
   * pipeline if plugins are registered.
   *
   * Request flow:
   * 1. Merge provided config with adapter defaults (deep clone to prevent mutations)
   * 2. If executor exists: Run through plugin lifecycle (before → request → after)
   * 3. If no executor: Execute request directly through adapter
   * 4. Return response (type determined by plugins or adapter)
   *
   * Configuration merging:
   * - Adapter default config is cloned to prevent side effects
   * - Request-specific config overrides defaults
   * - Deep merge for nested objects (headers, params, etc.)
   *
   * @template T - Expected response data type
   * @template D - Request data type (for POST, PUT, PATCH)
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, T>`)
   *
   * @override
   * @param config - Request configuration including URL, method, data, headers, etc.
   * @param {string} config.url - Request URL (relative to baseURL or absolute)
   * @param {string} config.method - HTTP method (GET, POST, PUT, PATCH, DELETE, etc.)
   * @param {D} [config.data] - Request body data for POST/PUT/PATCH requests
   * @param {object} [config.headers] - Custom HTTP headers
   * @param {object} [config.params] - URL query parameters
   *
   * @returns {Promise<R>} Promise resolving to response (type determined by plugins or adapter)
   *
   * @example Basic request
   * ```typescript
   * const response = await executor.request<User>({
   *   url: '/users/123',
   *   method: 'GET'
   * });
   * ```
   *
   * @example Request with data and custom headers
   * ```typescript
   * const response = await executor.request<User, CreateUserDto>({
   *   url: '/users',
   *   method: 'POST',
   *   data: { name: 'John', email: 'john@example.com' },
   *   headers: { 'Content-Type': 'application/json' }
   * });
   * ```
   *
   * @example Request with query parameters
   * ```typescript
   * const response = await executor.request<User[]>({
   *   url: '/users',
   *   method: 'GET',
   *   params: { page: 1, limit: 10 }
   * });
   * ```
   */
  public request<T, D, R = RequestExecutorResponse<Config, T>>(
    config: Config & { data?: D }
  ): Promise<R> {
    // Merge adapter defaults with request config (clone to prevent mutations)
    const mergedConfig = Object.assign(clone(this.adapter.getConfig()), config);

    // If no executor, execute request directly through adapter
    if (!this.executor) {
      return this.adapter.request(mergedConfig) as Promise<R>;
    }

    // Execute request through lifecycle pipeline with plugins
    return this.executor.exec(
      mergedConfig,
      (ctx) => this.adapter.request(ctx.parameters) as Promise<R>
    );
  }

  /**
   * Execute HTTP GET request
   *
   * Convenience method for GET requests. Automatically sets HTTP method to GET
   * and accepts optional query parameters.
   *
   * GET requests are typically used for:
   * - Retrieving resources or collections
   * - Fetching data without side effects
   * - Idempotent operations (safe to retry)
   *
   * @template Response - Expected response data type
   * @template Params - Query parameters type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param config - Optional request configuration
   * @param {Params} [config.params] - URL query parameters
   * @param {object} [config.headers] - Custom HTTP headers
   *
   * @returns {Promise<R>} Promise resolving to response data
   *
   * @example Fetch single resource
   * ```typescript
   * const user = await executor.get<User>('/users/123');
   * ```
   *
   * @example Fetch with query parameters
   * ```typescript
   * const users = await executor.get<User[], { page: number; limit: number }>('/users', {
   *   params: { page: 1, limit: 10 }
   * });
   * ```
   *
   * @example Fetch with custom headers
   * ```typescript
   * const data = await executor.get<Data>('/api/data', {
   *   headers: { 'Accept-Language': 'en-US' }
   * });
   * ```
   */
  public get<Response, Params, R = RequestExecutorResponse<Config, Response>>(
    url: URL,
    config?: ShortcutNoBodyConfig<Config, Params>
  ): Promise<R> {
    return this.request({ ...config, url, method: HttpMethods.GET } as Config);
  }

  /**
   * Execute HTTP DELETE request
   *
   * Convenience method for DELETE requests. Automatically sets HTTP method to DELETE
   * and accepts optional query parameters.
   *
   * DELETE requests are typically used for:
   * - Removing resources
   * - Idempotent deletion operations
   * - Resource cleanup
   *
   * @template Response - Expected response data type
   * @template Params - Query parameters type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param config - Optional request configuration
   * @param {Params} [config.params] - URL query parameters
   * @param {object} [config.headers] - Custom HTTP headers
   *
   * @returns {Promise<R>} Promise resolving to response data
   *
   * @example Delete resource
   * ```typescript
   * await executor.delete('/users/123');
   * ```
   *
   * @example Delete with query parameters
   * ```typescript
   * await executor.delete<void, { force: boolean }>('/users/123', {
   *   params: { force: true }
   * });
   * ```
   *
   * @example Delete with confirmation header
   * ```typescript
   * await executor.delete('/users/123', {
   *   headers: { 'X-Confirm-Delete': 'true' }
   * });
   * ```
   */
  public delete<
    Response,
    Params,
    R = RequestExecutorResponse<Config, Response>
  >(url: URL, config?: ShortcutNoBodyConfig<Config, Params>): Promise<R> {
    return this.request({
      ...config,
      url,
      method: HttpMethods.DELETE
    } as Config);
  }

  /**
   * Execute HTTP HEAD request
   *
   * Convenience method for HEAD requests. Automatically sets HTTP method to HEAD
   * and accepts optional query parameters.
   *
   * HEAD requests are typically used for:
   * - Checking resource existence without downloading content
   * - Retrieving metadata (headers) without response body
   * - Checking resource modification time (Last-Modified header)
   * - Validating URLs before downloading
   *
   * @template Response - Expected response data type (usually void for HEAD)
   * @template Params - Query parameters type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param config - Optional request configuration
   * @param {Params} [config.params] - URL query parameters
   * @param {object} [config.headers] - Custom HTTP headers
   *
   * @returns {Promise<R>} Promise resolving to response (typically only headers, no body)
   *
   * @example Check resource existence
   * ```typescript
   * const response = await executor.head('/users/123');
   * console.log(response.status); // 200 if exists, 404 if not
   * ```
   *
   * @example Check resource modification time
   * ```typescript
   * const response = await executor.head('/api/data');
   * console.log(response.headers['last-modified']);
   * ```
   */
  public head<Response, Params, R = RequestExecutorResponse<Config, Response>>(
    url: URL,
    config?: ShortcutNoBodyConfig<Config, Params>
  ): Promise<R> {
    return this.request({ ...config, url, method: HttpMethods.HEAD } as Config);
  }

  /**
   * Execute HTTP OPTIONS request
   *
   * Convenience method for OPTIONS requests. Automatically sets HTTP method to OPTIONS
   * and accepts optional query parameters.
   *
   * OPTIONS requests are typically used for:
   * - CORS preflight requests
   * - Discovering allowed HTTP methods for a resource
   * - Checking API capabilities and supported features
   * - Server capability negotiation
   *
   * @template Response - Expected response data type
   * @template Params - Query parameters type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param config - Optional request configuration
   * @param {Params} [config.params] - URL query parameters
   * @param {object} [config.headers] - Custom HTTP headers
   *
   * @returns {Promise<R>} Promise resolving to response with allowed methods in headers
   *
   * @example Check allowed methods
   * ```typescript
   * const response = await executor.options('/users/123');
   * console.log(response.headers['allow']); // "GET, PUT, DELETE"
   * ```
   *
   * @example CORS preflight check
   * ```typescript
   * const response = await executor.options('/api/data', {
   *   headers: {
   *     'Access-Control-Request-Method': 'POST',
   *     'Access-Control-Request-Headers': 'Content-Type'
   *   }
   * });
   * ```
   */
  public options<
    Response,
    Params,
    R = RequestExecutorResponse<Config, Response>
  >(url: URL, config?: ShortcutNoBodyConfig<Config, Params>): Promise<R> {
    return this.request({
      ...config,
      url,
      method: HttpMethods.OPTIONS
    } as Config);
  }

  /**
   * Execute HTTP POST request
   *
   * Convenience method for POST requests. Automatically sets HTTP method to POST
   * and accepts request body data.
   *
   * POST requests are typically used for:
   * - Creating new resources
   * - Submitting data to be processed
   * - Triggering server-side actions
   * - Non-idempotent operations
   *
   * @template Response - Expected response data type
   * @template RequestData - Request body data type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param data - Request body data to be sent
   * @param config - Optional request configuration
   * @param {object} [config.headers] - Custom HTTP headers
   * @param {object} [config.params] - URL query parameters
   *
   * @returns {Promise<R>} Promise resolving to response data
   *
   * @example Create new resource
   * ```typescript
   * const newUser = await executor.post<User, CreateUserDto>('/users', {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * ```
   *
   * @example Submit form data
   * ```typescript
   * const result = await executor.post<SubmitResult, FormData>('/forms/submit', formData, {
   *   headers: { 'Content-Type': 'multipart/form-data' }
   * });
   * ```
   *
   * @example Trigger action with parameters
   * ```typescript
   * await executor.post<void, { action: string }>('/api/actions', {
   *   action: 'send-email'
   * });
   * ```
   */
  public post<
    Response,
    RequestData,
    R = RequestExecutorResponse<Config, Response>
  >(url: URL, data?: RequestData, config?: ShortcutConfig<Config>): Promise<R> {
    return this.request({
      ...config,
      url,
      data,
      method: HttpMethods.POST
    } as Config);
  }

  /**
   * Execute HTTP PUT request
   *
   * Convenience method for PUT requests. Automatically sets HTTP method to PUT
   * and accepts request body data.
   *
   * PUT requests are typically used for:
   * - Updating existing resources (full replacement)
   * - Creating resources with client-specified IDs
   * - Idempotent update operations
   *
   * @template Response - Expected response data type
   * @template RequestData - Request body data type
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param data - Request body data to be sent
   * @param config - Optional request configuration
   * @param {object} [config.headers] - Custom HTTP headers
   * @param {object} [config.params] - URL query parameters
   *
   * @returns {Promise<R>} Promise resolving to response data
   *
   * @example Update existing resource
   * ```typescript
   * const updatedUser = await executor.put<User, UpdateUserDto>('/users/123', {
   *   name: 'Jane Doe',
   *   email: 'jane@example.com'
   * });
   * ```
   *
   * @example Replace resource completely
   * ```typescript
   * const updated = await executor.put<Config, Config>('/config', {
   *   theme: 'dark',
   *   language: 'en',
   *   notifications: true
   * });
   * ```
   */
  public put<
    Response,
    RequestData,
    R = RequestExecutorResponse<Config, Response>
  >(url: URL, data?: RequestData, config?: ShortcutConfig<Config>): Promise<R> {
    return this.request({
      ...config,
      url,
      data,
      method: HttpMethods.PUT
    } as Config);
  }

  /**
   * Execute HTTP PATCH request
   *
   * Convenience method for PATCH requests. Automatically sets HTTP method to PATCH
   * and accepts request body data.
   *
   * PATCH requests are typically used for:
   * - Partial updates to existing resources
   * - Modifying specific fields without replacing entire resource
   * - Efficient updates when only few fields change
   *
   * @template Response - Expected response data type
   * @template RequestData - Request body data type (partial update)
   * @template R - Final response type (defaults to `RequestExecutorResponse<Config, Response>`)
   *
   * @param url - Request URL (relative to baseURL or absolute)
   * @param data - Partial request body data to be sent
   * @param config - Optional request configuration
   * @param {object} [config.headers] - Custom HTTP headers
   * @param {object} [config.params] - URL query parameters
   *
   * @returns {Promise<R>} Promise resolving to response data
   *
   * @example Partial update
   * ```typescript
   * const updated = await executor.patch<User, Partial<User>>('/users/123', {
   *   name: 'Jane Doe' // Only update name, leave other fields unchanged
   * });
   * ```
   *
   * @example Update specific fields
   * ```typescript
   * await executor.patch<Settings, { theme: string }>('/settings', {
   *   theme: 'dark'
   * });
   * ```
   *
   * @example JSON Patch format
   * ```typescript
   * await executor.patch<User, JsonPatch[]>('/users/123', [
   *   { op: 'replace', path: '/name', value: 'Jane Doe' },
   *   { op: 'add', path: '/tags/-', value: 'premium' }
   * ]);
   * ```
   */
  public patch<
    Response,
    RequestData,
    R = RequestExecutorResponse<Config, Response>
  >(url: URL, data?: RequestData, config?: ShortcutConfig<Config>): Promise<R> {
    return this.request({
      ...config,
      url,
      data,
      method: HttpMethods.PATCH
    } as Config);
  }
}
