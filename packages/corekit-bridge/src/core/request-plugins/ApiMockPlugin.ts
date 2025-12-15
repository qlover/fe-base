import {
  type ExecutorContext,
  type ExecutorPlugin,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { ThreadUtil } from '../thread/ThreadUtil';

/**
 * Mock data value type - can be a static value or a function that returns mock data
 *
 * When a function is provided, it will be called with all request parameters,
 * allowing dynamic mock data generation based on the request context.
 *
 * @template T - The type of request parameters
 */
export type MockDataValue<T = RequestAdapterFetchConfig> =
  | unknown
  | ((parameters: T) => unknown | Promise<unknown>);

/**
 * Mock data configuration object
 *
 * All matches must include HTTP method. The mock data can be matched in the following order:
 * 1. Method + full URL match: Use "METHOD FULL_URL" format as the key (e.g., "GET https://api.example.com/api/users") - highest priority
 * 2. Method + URL path match: Use "METHOD URL" format as the key (e.g., "GET /api/users") - fallback
 * 3. Default fallback: Use "_default" key when no match is found
 *
 * Mock data values can be:
 * - Static values (objects, arrays, primitives)
 * - Functions that receive all request parameters and return mock data
 *
 * @example
 * ```typescript
 * const mockData: MockDataJson = {
 *   // Method + full URL match (highest priority) - allows distinguishing same URL path with different baseURL
 *   "GET https://api.example.com/api/users": { users: [] },
 *   "GET https://api2.example.com/api/users": { users: [{ id: 1 }] },
 *   "POST https://api.example.com/api/users": { success: true },
 *
 *   // Method + URL path match (fallback) - for backward compatibility
 *   "GET /api/users": (params) => ({ users: [], count: params.data?.page || 1 }),
 *   "POST /api/users": { success: true },
 *
 *   // Default fallback (required) - function
 *   _default: (params) => ({ error: "Not found", url: params.url })
 * };
 * ```
 */
export interface MockDataJson<T = RequestAdapterFetchConfig> {
  /**
   * Default mock data returned when no specific match is found
   * This property is required and will be used as fallback
   * Can be a static value or a function that receives request parameters
   */
  _default: MockDataValue<T>;

  /**
   * Additional mock data entries
   * Keys must include HTTP method and can be:
   * - Method + full URL format (e.g., "GET https://api.example.com/api/users", "POST https://api.example.com/api/users") - highest priority, recommended for distinguishing same URL path with different baseURL
   * - Method + URL path format (e.g., "GET /api/users", "POST /api/users") - fallback priority
   * Values can be static data or functions that receive request parameters
   */
  [key: string]: MockDataValue<T>;
}

export type ApiMockPluginConfig = RequestAdapterFetchConfig &
  ApiMockPluginOptions;

export interface ApiMockPluginOptions {
  /**
   * When disabledMock is true, the mock data will not be used
   * and the plugin will be disabled for the request
   */
  disabledMock?: boolean;

  /**
   * Override mock data for this specific request
   * If provided, this will take precedence over mockDataJson matching
   * Can be a static value or a function that receives request parameters
   */
  mockData?: MockDataJson<ApiMockPluginConfig>;

  /**
   * Delay in milliseconds before returning the mock response
   *
   * Set to 0 to disable delay (no await).
   *
   * @default 1000
   */
  mockDelay?: number;
}

/**
 * Type alias for ApiMockPlugin executor context
 */
export type ApiMockPluginContext = ExecutorContext<ApiMockPluginConfig>;

/**
 * ApiMockPlugin - Mock API responses for development and testing
 *
 * This plugin intercepts API requests and returns mock data based on:
 * All matches must include HTTP method. Matching priority:
 * 1. Method + full URL matching (highest priority) - uses "METHOD baseURL+url" format (e.g., "GET https://api.example.com/api/users")
 * 2. Method + URL path matching (fallback) - uses "METHOD url" format (e.g., "GET /api/users")
 * 3. Default mock data (_default property)
 *
 * Mock data values can be:
 * - Static values (objects, arrays, primitives)
 * - Functions that receive all request parameters and return mock data dynamically
 *
 * The plugin can simulate network delay (default: 1000ms).
 * Set delay to 0 in request parameters to disable delay.
 *
 * @example
 * ```typescript
 * // Static mock data with method + full URL (recommended for distinguishing same URL path with different baseURL)
 * const mockData: MockDataJson = {
 *   "GET https://api.example.com/api/users": { users: [{ id: 1 }] },
 *   "GET https://api2.example.com/api/users": { users: [{ id: 2 }] },
 *   "POST https://api.example.com/api/users": { success: true },
 *   _default: { error: "Not found" }
 * };
 *
 * // Static mock data with method + URL path (fallback)
 * const mockDataLegacy: MockDataJson = {
 *   "GET /api/users": { users: [{ id: 1 }] },
 *   "POST /api/users": { success: true },
 *   _default: { error: "Not found" }
 * };
 *
 * // Dynamic mock data with functions
 * const dynamicMockData: MockDataJson = {
 *   "GET https://api.example.com/api/users": (params) => ({
 *     users: params.data?.page ? [] : [{ id: 1 }]
 *   }),
 *   _default: (params) => ({ error: "Not found", url: params.url })
 * };
 *
 * const plugin = new ApiMockPlugin({ mockData }, logger);
 *
 * // Use with custom delay
 * executor.exec({ baseURL: "https://api.example.com", url: "/api/users", method: "GET", delay: 500 }); // 500ms delay
 * executor.exec({ baseURL: "https://api.example.com", url: "/api/users", method: "GET", delay: 0 });  // No delay
 * ```
 */
export class ApiMockPlugin implements ExecutorPlugin {
  public readonly pluginName = 'ApiMockPlugin';

  /**
   * Creates an instance of ApiMockPlugin
   *
   * @param options - Plugin configuration options
   * @param options.mockData - Optional mock data object that must contain a "_default" property when provided.
   *                          Keys must include HTTP method and can be:
   *                          - "METHOD FULL_URL" format (e.g., "GET https://api.example.com/api/users") - highest priority, recommended for distinguishing same URL path with different baseURL
   *                          - "METHOD URL" format (e.g., "GET /api/users") - fallback priority
   *                          Values can be static data or functions that receive request parameters.
   * @param options.mockDelay - Optional delay in milliseconds before returning the mock response (default: 1000ms).
   *                            Set to 0 to disable delay.
   * @param options.disabledMock - Optional flag to disable the plugin for specific requests
   * @param options.logger - Optional logger instance for logging mock requests
   */
  constructor(
    protected options: ApiMockPluginOptions & {
      logger?: LoggerInterface;
    }
  ) {}

  /**
   * Determines whether the plugin should be enabled for the current request
   *
   * The plugin is enabled unless disabledMock is explicitly set to true in the request parameters.
   *
   * @param _name - The plugin hook name (not used in this implementation)
   * @param context - The executor context containing request parameters
   * @returns true if the plugin should be enabled, false otherwise
   *
   * @override
   */
  public enabled(
    _name: keyof ExecutorPlugin,
    context?: ApiMockPluginContext
  ): boolean {
    return !context?.parameters.disabledMock;
  }

  /**
   * Builds a full URL by combining baseURL and url
   *
   * @param baseURL - Base URL (optional)
   * @param url - Request URL path
   * @returns Full URL string
   */
  protected buildFullUrl(baseURL: string | undefined, url: string): string {
    if (!baseURL) {
      return url;
    }

    // Remove trailing slash from baseURL and leading slash from url if present
    const normalizedBaseURL = baseURL.replace(/\/$/, '');
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${normalizedBaseURL}${normalizedUrl}`;
  }

  /**
   * Matches mock data from mockDataJson based on request parameters
   *
   * All matches must include HTTP method. Matching priority:
   * 1. Method + full URL format match (e.g., "GET https://api.example.com/api/users") - highest priority
   * 2. Method + URL path format match (e.g., "GET /api/users") - fallback
   * 3. Default fallback (_default)
   *
   * @param mockDataJson - Mock data configuration object
   * @param method - HTTP method (default: 'GET')
   * @param baseURL - Base URL (optional)
   * @param url - Request URL path
   * @returns The matched mock data value (can be a function or static value)
   */
  protected matchMockData(
    mockDataJson: MockDataJson<ApiMockPluginConfig>,
    method: string,
    baseURL: string | undefined,
    url: string
  ): MockDataValue<RequestAdapterFetchConfig & ApiMockPluginOptions> {
    if (!url) {
      return mockDataJson._default;
    }

    // Build full URL (baseURL + url)
    const fullUrl = this.buildFullUrl(baseURL, url);
    const upperMethod = method.toUpperCase();

    // Priority 1: Try Method + full URL format (e.g., "GET https://api.example.com/api/users")
    const methodFullUrlKey = `${upperMethod} ${fullUrl}`;
    const methodFullUrlMatch =
      mockDataJson[methodFullUrlKey as keyof typeof mockDataJson];
    if (methodFullUrlMatch !== undefined) {
      return methodFullUrlMatch;
    }

    // Priority 2: Try Method + URL path format (e.g., "GET /api/users")
    const methodUrlKey = `${upperMethod} ${url}`;
    const methodUrlMatch =
      mockDataJson[methodUrlKey as keyof typeof mockDataJson];
    if (methodUrlMatch !== undefined) {
      return methodUrlMatch;
    }

    // Priority 3: Use default mock data
    return mockDataJson._default;
  }

  /**
   * Resolves mock data value to actual data
   *
   * If the value is a function, it will be called with all request parameters.
   * If the value is a Promise, it will be awaited.
   * Otherwise, the value is returned as-is.
   *
   * @param mockDataValue - The mock data value (function or static value)
   * @param parameters - All request parameters
   * @returns Resolved mock data
   */
  protected async resolveMockData(
    mockDataValue: MockDataValue<
      RequestAdapterFetchConfig & ApiMockPluginOptions
    >,
    parameters: RequestAdapterFetchConfig & ApiMockPluginOptions
  ): Promise<unknown> {
    if (typeof mockDataValue === 'function') {
      const result = mockDataValue(parameters);
      // Handle both sync and async functions
      return result instanceof Promise ? await result : result;
    }
    return mockDataValue;
  }

  /**
   * Creates a Response object with the mock data
   *
   * @param mockData - The resolved mock data
   * @returns A Response object with JSON stringified mock data
   */
  protected createMockResponse(mockData: unknown): Response {
    return new Response(JSON.stringify(mockData), {
      status: 200,
      statusText: 'OK'
    });
  }

  /**
   * Logs the mock request information for debugging
   *
   * @param key - The method + URL key used for matching
   * @param headers - Request headers
   * @param mockData - The resolved mock data
   */
  protected logMockRequest(
    key: string,
    headers: Record<string, unknown> | undefined,
    mockData: unknown
  ): void {
    this.options.logger?.log(
      '%c[mock]%c ' + key,
      'color: #dd0;',
      'color: inherit;',
      ['headers:', headers],
      ['response json:', mockData]
    );
  }

  /**
   * Executes the mock plugin and returns a mock response
   *
   * This method performs the following steps:
   * 1. Simulates network delay if mockDelay > 0 (default: 1000ms, can be configured via mockDelay parameter)
   * 2. Extracts request parameters (method, baseURL, url, headers, mockData, mockDelay)
   * 3. Matches mock data using the following priority (all matches must include HTTP method):
   *    a. If mockData is provided in parameters, use it directly
   *    b. If url exists, try matching in this order:
   *       1. Method + full URL format (e.g., "GET https://api.example.com/api/users") - highest priority
   *       2. Method + URL path format (e.g., "GET /api/users") - fallback
   *    c. If all matches fail, use the _default mock data
   *    d. If url is empty, use _default directly
   * 4. Resolves mock data (handles functions and promises)
   * 5. Creates a Response object with the matched mock data
   * 6. Logs the mock request information
   * 7. Returns a RequestAdapterResponse with the mock data
   *
   * @param context - The executor context containing request parameters
   * @returns A promise that resolves to a RequestAdapterResponse with mock data
   *
   * @override
   */
  public async onExec(
    context: ApiMockPluginContext
  ): Promise<RequestAdapterResponse> {
    const { parameters } = context;
    const {
      method = 'GET',
      baseURL,
      url = '',
      headers,
      mockData,
      mockDelay
    } = parameters;

    // Priority: parameters.mockDelay > options.mockDelay > default (1000)
    const delay =
      mockDelay !== undefined
        ? mockDelay
        : this.options.mockDelay !== undefined
          ? this.options.mockDelay
          : 1000;

    // Simulate network delay if delay > 0
    if (delay > 0) {
      await ThreadUtil.sleep(delay);
    }

    // Build full URL for logging
    const fullUrl = this.buildFullUrl(baseURL, url);
    const key = `${method.toUpperCase()} ${fullUrl}`;

    // Match mock data - use parameter mockData if provided, otherwise match from mockDataJson
    const mockDataJson = mockData
      ? Object.assign({}, this.options.mockData || {}, mockData)
      : this.options.mockData || { _default: {} };

    const matchedMockDataValue = this.matchMockData(
      mockDataJson,
      method,
      baseURL,
      url
    );

    // Resolve mock data (handle functions and promises)
    const resolvedMockData = await this.resolveMockData(
      matchedMockDataValue,
      parameters
    );

    // Create Response object
    const response = this.createMockResponse(resolvedMockData);

    // Log the mock request for debugging purposes
    this.logMockRequest(key, headers, resolvedMockData);

    // Return the mock response in RequestAdapterResponse format
    return {
      status: response.status,
      statusText: response.statusText,
      headers: {},
      data: resolvedMockData,
      config: parameters,
      response
    };
  }
}
