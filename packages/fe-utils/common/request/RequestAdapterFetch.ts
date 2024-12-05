import {
  RequestAdapterInterface,
  RequestAdapterResponse,
  RequestAdpaterConfig
} from '../interface/RequestAdapterInterface';
import merge from 'lodash/merge';
import { AsyncExecutor, ExecutorError, ExecutorPlugin } from '../executor';
import { RequestErrorID } from './RequestError';

export type RequestAdapterFetchConfig<Request = any> = RequestInit &
  RequestAdpaterConfig<Request> & {
    fetcher?: typeof fetch;

    /**
     * @description 流式响应处理
     */
    onStreamChunk?: (chunk: string) => string;

    controller?: AbortController;
    onAbort?(config: RequestAdapterFetchConfig): void;
    [key: string]: unknown;
  };

export class RequestAdapterFetch
  implements RequestAdapterInterface<RequestAdapterFetchConfig>
{
  readonly config: RequestAdapterFetchConfig;
  private executor: AsyncExecutor;

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
  constructor(config: Partial<RequestAdapterFetchConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new ExecutorError(RequestErrorID.ENV_FETCH_NOT_SUPPORT);
      }

      config.fetcher = fetch;
    }

    // use AsyncExecutor
    this.executor = new AsyncExecutor();

    this.config = config as RequestAdapterFetchConfig;
  }

  getConfig(): RequestAdapterFetchConfig {
    return this.config;
  }

  usePlugin(plugin: ExecutorPlugin): void {
    this.executor.use(plugin);
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
  async request<Request, Response>(
    config: RequestAdapterFetchConfig<Request>
  ): Promise<RequestAdapterResponse<Request, Response>> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge({}, thisConfig, config);
    const { fetcher, url, method, headers, data, ...rest } = mergedConfig;

    if (typeof fetcher !== 'function') {
      throw new ExecutorError(RequestErrorID.FETCHER_NONE);
    }

    if (!url) {
      throw new ExecutorError(RequestErrorID.URL_NONE);
    }

    const requestInit = this.toRequestInit(mergedConfig);
    return this.executor.exec(mergedConfig, () =>
      fetcher(url, requestInit)
    ) as unknown as Promise<RequestAdapterResponse<Request, Response>>;
  }

  toRequestInit(config: RequestAdapterFetchConfig): RequestInit {
    return {
      body: config.data,
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
      window: null
    };
  }
}