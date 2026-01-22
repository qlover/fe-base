/**
 * Request adapter configuration interface
 *
 * Core concept:
 * Defines the complete configuration structure for HTTP requests, providing
 * a unified interface that works across different HTTP clients (fetch, axios).
 * This abstraction allows switching between adapters without changing request code.
 *
 * Main features:
 * - URL configuration: Base URL and path management
 *   - Supports absolute and relative URLs
 *   - Automatic URL composition with baseURL
 *   - Query parameter serialization
 *
 * - Request customization: Headers, body, and method configuration
 *   - Type-safe request data through generic `RequestData`
 *   - Flexible header management
 *   - Support for all HTTP methods
 *
 * - Response handling: Response type and transformation options
 *   - Configurable response type (json, text, blob, etc.)
 *   - Response timeout configuration
 *   - Abort signal integration
 *
 * Design considerations:
 * - Generic `RequestData` type for type-safe request bodies
 * - Extensible configuration for adapter-specific options
 * - Compatible with both fetch and axios APIs
 * - Supports middleware and interceptor patterns
 *
 * @template RequestData - Type of request body data (defaults to `unknown`)
 *
 * @since `1.0.14`
 *
 * @example Basic GET request
 * ```typescript
 * const config: RequestAdapterConfig = {
 *   url: '/users/123',
 *   method: 'GET',
 *   baseURL: 'https://api.example.com'
 * };
 * ```
 *
 * @example POST request with typed data
 * ```typescript
 * interface CreateUserData {
 *   name: string;
 *   email: string;
 * }
 *
 * const config: RequestAdapterConfig<CreateUserData> = {
 *   url: '/users',
 *   method: 'POST',
 *   data: {
 *     name: 'John Doe',
 *     email: 'john@example.com'
 *   },
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * };
 * ```
 *
 * @example With query parameters
 * ```typescript
 * const config: RequestAdapterConfig = {
 *   url: '/users',
 *   method: 'GET',
 *   params: {
 *     role: 'admin',
 *     active: true,
 *     page: 1
 *   }
 * };
 * // Final URL: /users?role=admin&active=true&page=1
 * ```
 *
 * @example With authentication
 * ```typescript
 * const config: RequestAdapterConfig = {
 *   url: '/protected/data',
 *   method: 'GET',
 *   headers: {
 *     'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
 *     'Accept': 'application/json'
 *   }
 * };
 * ```
 */
export interface RequestAdapterConfig<RequestData = unknown> {
  /**
   * Request URL path
   * Will be combined with baseURL if provided
   *
   * Processed by FetchURLPlugin during request
   *
   * TODO: Change to URL | Request, add attribute `input`
   *
   * @example
   * ```typescript
   * url: '/users/1'
   * ```
   */
  url?: string;

  /**
   * HTTP request methods supported by the executor
   * Follows standard HTTP method definitions
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
   * @example
   * ```typescript
   * method: 'GET'
   * ```
   */
  method?: string;

  /**
   * Base URL for all requests
   * Will be prepended to the request URL
   *
   * @example
   * ```typescript
   * baseURL: 'https://api.example.com'
   * // url = /users/1 => https://api.example.com/users/1
   * // url = users/1 => https://api.example.com/users/1
   * ```
   */
  baseURL?: string;

  /**
   * Request body data
   *
   * Mapping fetch `body`
   *
   * @typeParam RequestData - The type of the request body data.
   * @example
   * ```typescript
   * data: { name: 'John Doe' }
   * ```
   */
  data?: RequestData;

  /**
   * URL query parameters
   * Will be serialized and appended to the URL
   *
   * @example
   * ```typescript
   * params: { search: 'query' }
   * ```
   */
  params?: Record<string, unknown>;

  /**
   * Request headers
   *
   * @example
   * ```typescript
   * headers: { 'Content-Type': 'application/json' }
   * ```
   */
  headers?: { [key: string]: unknown };

  /**
   * Response type
   *
   * Specifies the type of data that the server will respond with.
   *
   * @example
   * ```typescript
   * responseType: 'json'
   * ```
   */
  responseType?:
    | 'arraybuffer'
    | 'blob'
    | 'document'
    | 'json'
    | 'text'
    | 'stream'
    | 'formdata';

  /**
   * Request ID, used to identify the request in the abort plugin.
   */
  requestId?: string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Request adapter response
 *
 * This type defines the structure of a response from a request adapter.
 * It includes the response data, status, headers, and the original request configuration.
 *
 * @typeParam Req - The type of the request data.
 * @typeParam Res - The type of the response data.
 */
export interface RequestAdapterResponse<Req = unknown, Res = unknown> {
  data: Res;
  status: number;
  statusText: string;
  headers: { [key: string]: unknown };
  config: RequestAdapterConfig<Req>;
  response: Response;

  [key: string]: unknown;
}

/**
 * Request adapter interface
 *
 * This interface defines the contract for request adapters.
 * Adapters are responsible for handling the specific details of a request,
 * such as URL construction, headers, and response handling.
 *
 * 3.0.0 changed name from RequestAdapter to RequestAdapterInterface
 */
export interface RequestAdapterInterface<Config extends RequestAdapterConfig> {
  /**
   * The configuration for the request adapter.
   *
   * @type {Config}
   */
  readonly config: Config;

  /**
   * Sends a request using the specified options and returns a promise with the response.
   *
   * @typeParam Request - The type of the request data.
   * @typeParam Response - The type of the response data.
   * @param options - The configuration options for the request.
   * @returns A promise that resolves to the response of the request.
   * @example
   * ```typescript
   * adapter.request({ url: '/users', method: 'GET' }).then(response => console.log(response));
   * ```
   */
  request<Request, Response>(
    options: RequestAdapterConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>>;

  /**
   * Retrieves the current configuration of the request adapter.
   *
   * @returns The current configuration.
   * @example
   * ```typescript
   * const config = adapter.getConfig();
   * ```
   */
  getConfig: () => Config;

  /**
   * Sets the configuration for the request adapter.
   *
   * @since 2.4.0
   * @param config - The configuration to set.
   * @example
   * ```typescript
   * adapter.setConfig({ url: '/users', method: 'GET' });
   * ```
   *
   * @example Merge configuration
   * ```typescript
   *
   * adapter.setConfig({ baseURL: 'https://api.example.com' });
   * adapter.setConfig({ baseURL: 'https://api.example2.com' });
   * // baseURL = 'https://api.example2.com'
   * ```
   */
  setConfig: (config: Config | Partial<Config>) => void;
}
