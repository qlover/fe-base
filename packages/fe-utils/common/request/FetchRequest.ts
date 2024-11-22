import { AsyncExecutor, ExecutorError } from '../executor';
import { FetchRequestConfig } from './FetchRequestConfig';
import { RequestExecutor } from './RequestExecutor';
import merge from 'lodash/merge';

/**
 * Error IDs for different fetch request failure scenarios
 * Used to identify specific error types in error handling
 */
export enum FetchRequestErrorID {
  /** Generic fetch request error */
  FETCH_REQUEST_ERROR = 'FETCH_REQUEST_ERROR',
  /** Environment doesn't support fetch API */
  ENV_FETCH_NOT_SUPPORT = 'ENV_FETCH_NOT_SUPPORT',
  /** No fetcher function provided */
  FETCHER_NONE = 'FETCHER_NONE',
  /** Response status is not OK (not in 200-299 range) */
  RESPONSE_NOT_OK = 'RESPONSE_NOT_OK',
  /** Request was aborted */
  ABORT_ERROR = 'ABORT_ERROR'
}

/**
 * Custom error class for fetch request failures
 * Extends ExecutorError to maintain error chain compatibility
 *
 * @example
 * ```typescript
 * throw new FetchRequestError(
 *   FetchRequestErrorID.RESPONSE_NOT_OK,
 *   'Server responded with 404'
 * );
 * ```
 */
export class FetchRequestError extends ExecutorError {
  constructor(id: string, originalError?: string | Error) {
    super(id, originalError);
  }
}

/**
 * Fetch-based implementation of RequestExecutor
 * Provides a robust HTTP client with plugin support
 *
 * Features:
 * - Built on fetch API
 * - Automatic fetch detection and fallback
 * - Plugin support through AsyncExecutor
 * - Configurable request options
 * - Error handling with custom error types
 *
 * @extends RequestExecutor
 *
 * @example
 * ```typescript
 * // Basic usage
 * const client = new FetchRequest({
 *   baseURL: 'https://api.example.com'
 * });
 *
 * // GET request with parameters
 * const users = await client.get({
 *   url: '/users',
 *   params: { role: 'admin' }
 * });
 *
 * // POST request with body
 * const newUser = await client.post({
 *   url: '/users',
 *   body: JSON.stringify({ name: 'John' }),
 *   headers: { 'Content-Type': 'application/json' }
 * });
 * ```
 */
export class FetchRequest extends RequestExecutor<FetchRequestConfig> {
  /**
   * Creates a new FetchRequest instance
   * Automatically detects and configures fetch implementation
   *
   * @param config - Request configuration options
   * @throws {FetchRequestError} When fetch is not available
   */
  constructor(config: Partial<FetchRequestConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new FetchRequestError(FetchRequestErrorID.ENV_FETCH_NOT_SUPPORT);
      }

      config.fetcher = fetch;
    }

    // use AsyncExecutor
    const executor = config.executor || new AsyncExecutor();

    super(config as FetchRequestConfig, executor);
  }

  /**
   * Core request implementation
   * Merges configurations and executes fetch request
   *
   * @override
   * @param config - Request configuration
   * @returns Promise resolving to Response object
   * @throws {FetchRequestError} When fetcher is not available
   */
  async request(config: FetchRequestConfig): Promise<Response> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge({}, thisConfig, config);
    const fetcher = mergedConfig.fetcher;

    if (typeof fetcher !== 'function') {
      throw new FetchRequestError(FetchRequestErrorID.FETCHER_NONE);
    }

    return this.executor.exec(mergedConfig, () =>
      fetcher(mergedConfig.url, this.composeRequestInit(mergedConfig))
    );
  }

  /**
   * Composes RequestInit object from configuration
   * Extracts and formats fetch-specific options
   *
   * @param config - Full request configuration
   * @returns RequestInit object for fetch API
   *
   * @internal
   */
  private composeRequestInit(config: FetchRequestConfig): RequestInit {
    // FIXME: @type/node
    const typeNode = { dispatcher: config.dispatcher, duplex: config.duplex };
    return {
      body: config.body,
      cache: config.cache,
      credentials: config.credentials,
      headers: config.headers,
      integrity: config.integrity,
      keepalive: config.keepalive,
      method: config.method,
      mode: config.mode,
      priority: config.priority,
      redirect: config.redirect,
      referrer: config.referrer,
      referrerPolicy: config.referrerPolicy,
      signal: config.signal,

      /** Can only be null. Used to disassociate request from any Window. */
      window: null,

      ...typeNode
    };
  }
}
