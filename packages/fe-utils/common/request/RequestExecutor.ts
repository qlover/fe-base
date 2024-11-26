import { AsyncExecutor } from '../executor';
import { RequestConfig } from './FetchRequestConfig';

/**
 * HTTP request methods supported by the executor
 * Follows standard HTTP method definitions
 */
export type RequestMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

/**
 * Base request executor class that provides HTTP request functionality
 * Built on top of AsyncExecutor for plugin support and error handling
 *
 * Features:
 * - Supports all standard HTTP methods
 * - Plugin-based request modification
 * - Configurable request options
 * - Type-safe request configuration
 *
 * @template Cfg - Type of request configuration
 *
 * @example
 * ```typescript
 * // Basic usage
 * const executor = new RequestExecutor(config, new AsyncExecutor());
 *
 * // GET request
 * const data = await executor.get({
 *   url: '/api/users',
 *   params: { id: 123 }
 * });
 *
 * // POST request with body
 * const result = await executor.post({
 *   url: '/api/users',
 *   body: JSON.stringify({ name: 'John' })
 * });
 * ```
 */
export class RequestExecutor<Cfg extends RequestConfig> {
  /**
   * Creates a new RequestExecutor instance
   * @param config - Base request configuration
   * @param executor - AsyncExecutor instance for request handling
   */
  constructor(
    protected readonly config: Cfg,
    readonly executor: AsyncExecutor
  ) {}

  /**
   * Returns the current request configuration
   * @returns Current configuration object
   */
  getConfig(): Cfg {
    return this.config;
  }

  /**
   * Core request method that handles all HTTP requests
   * Should be implemented by concrete classes
   *
   * @param config - Request configuration
   * @returns Promise resolving to response data
   * @throws {Error} When not implemented
   */
  async request(config: Cfg): Promise<unknown> {
    throw new Error('Method not implemented.');
  }

  /**
   * Performs HTTP GET request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  get(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'GET' });
  }

  /**
   * Performs HTTP POST request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  post(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'POST' });
  }

  /**
   * Performs HTTP PUT request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  put(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'PUT' });
  }

  /**
   * Performs HTTP DELETE request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  delete(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'DELETE' });
  }

  /**
   * Performs HTTP PATCH request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  patch(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'PATCH' });
  }

  /**
   * Performs HTTP HEAD request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  head(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'HEAD' });
  }

  /**
   * Performs HTTP OPTIONS request
   * @param options - Request configuration
   * @returns Promise resolving to response data
   */
  options(options: Cfg): Promise<unknown> {
    return this.request({ ...options, method: 'OPTIONS' });
  }
}
