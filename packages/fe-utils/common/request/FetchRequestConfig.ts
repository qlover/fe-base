import { AsyncExecutor, ExecutorConfig } from '../executor';

/**
 * Base request configuration interface
 * Extends RequestInit with additional properties for enhanced functionality
 *
 * Core Idea: Extend standard RequestInit with additional options.
 * Main Function: Provide a comprehensive configuration for HTTP requests.
 * Main Purpose: Allow detailed customization of request behavior.
 *
 * @extends RequestInit
 *
 * @example
 * ```typescript
 * const config: RequestConfig = {
 *   url: '/api/data',
 *   method: 'GET',
 *   headers: { 'Content-Type': 'application/json' }
 * };
 * ```
 */
export interface RequestConfig extends RequestInit {
  /**
   * AsyncExecutor instance for request handling
   * Can be overridden when creating FetchRequest instance
   *
   * @access FetchRequest
   * Added by FetchRequest during initialization
   */
  executor?: AsyncExecutor;

  /**
   * Request timeout in milliseconds
   *
   * @access FetchRequest
   * Added by FetchRequest for timeout control
   */
  timeout?: number;

  /**
   * Base URL for all requests
   * Will be prepended to the request URL
   *
   * @access FetchURLPlugin
   * Processed by FetchURLPlugin during request
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
   * Request URL path
   * Will be combined with baseURL if provided
   *
   * @access FetchURLPlugin
   * Processed by FetchURLPlugin during request
   *
   * @todo Change to URL | Request, add attribute `input`
   */
  url: string;

  /**
   * URL query parameters
   * Will be serialized and appended to the URL
   *
   * @access FetchURLPlugin
   * Processed by FetchURLPlugin during request
   */
  params?: Record<string, string>;

  /**
   * Additional configuration properties
   * Allows plugins to extend configuration with custom options
   */
  [key: string]: unknown;
}

/**
 * Extended configuration interface for FetchRequest
 * Adds fetch-specific options and abort control
 *
 * Core Idea: Enhance request configuration with fetch-specific features.
 * Main Function: Provide additional options for fetch requests.
 * Main Purpose: Support advanced request scenarios with fetch API.
 *
 * @extends RequestConfig
 *
 * @example
 * ```typescript
 * const fetchConfig: FetchRequestConfig = {
 *   url: '/api/data',
 *   fetcher: customFetchFunction,
 *   timeout: 5000
 * };
 * ```
 */
export interface FetchRequestConfig extends RequestConfig {
  /**
   * Custom fetch implementation
   * Allows overriding the default fetch function
   *
   * @access FetchRequest
   * Used by FetchRequest to make HTTP requests
   */
  fetcher?: typeof fetch;

  /**
   * AbortSignal for request cancellation
   *
   * @access AbortPlugin
   * Added by AbortPlugin for request cancellation support
   */
  signal?: AbortSignal;

  /**
   * AbortController instance
   *
   * @access AbortPlugin
   * Added by AbortPlugin for request cancellation control
   */
  controller?: AbortController;

  /**
   * Callback function for abort events
   *
   * @access AbortPlugin
   * Called by AbortPlugin when request is cancelled
   */
  onAbort?: (config: FetchRequestConfig) => void;
}
