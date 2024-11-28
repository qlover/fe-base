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
 * @category Request
 */
export class FetchRequest extends RequestExecutor<FetchRequestConfig> {
  /**
   * Creates a new FetchRequest instance
   * Automatically detects and configures fetch implementation
   *
   * Core Idea: Simplify HTTP requests with built-in fetch support.
   * Main Function: Initialize fetch requests with optional configuration.
   * Main Purpose: Provide a flexible and extensible HTTP request utility.
   *
   * @param config - Request configuration options
   * @throws {FetchRequestError} When fetch is not available
   *
   * @example
   * ```typescript
   * const fetchRequest = new FetchRequest({ baseURL: 'https://api.example.com' });
   * ```
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
   * Core Idea: Execute HTTP requests with merged configurations.
   * Main Function: Perform fetch requests using provided configurations.
   * Main Purpose: Facilitate HTTP communication with error handling.
   *
   * @override
   * @param config - Request configuration
   * @returns Promise resolving to Response object
   * @throws {FetchRequestError} When fetcher is not available
   *
   * @example
   * ```typescript
   * const response = await fetchRequest.request({ url: '/data' });
   * ```
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
   * Core Idea: Convert configuration into fetch-compatible format.
   * Main Function: Prepare RequestInit object for fetch API.
   * Main Purpose: Ensure correct request setup for fetch execution.
   *
   * @param config - Full request configuration
   * @returns RequestInit object for fetch API
   *
   * @internal
   *
   * @example
   * ```typescript
   * const requestInit = fetchRequest.composeRequestInit(config);
   * ```
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
