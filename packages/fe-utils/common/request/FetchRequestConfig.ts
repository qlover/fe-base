import { AsyncExecutor, ExecutorConfig } from '../executor';

export interface RequestConfig extends RequestInit {
  /**
   * Base executor config, it's only AsyncExecutor
   *
   * can override by FetchRequest
   * @access FetchRequest
   */
  executor?: AsyncExecutor;

  /**
   * @access FetchRequest
   */
  timeout?: number;

  /**
   * Base URL
   * @example https://api.example.com
   * @access FetchURLPlugin
   *
   * - url = /users/1 => https://api.example.com/users/1
   * - url = users/1 => https://api.example.com/users/1
   */
  baseURL?: string;

  /**
   * @access FetchURLPlugin
   * FIXME: change to URL | Request, add attribute `input`
   */
  url: string;

  /**
   * @access FetchURLPlugin
   */
  params?: Record<string, string>;

  /**
   * extra attributes, other plugin config
   */
  [key: string]: unknown;
}

export interface FetchRequestConfig extends RequestConfig {
  /**
   * Only use FetchRequest, can overried call send request
   * @access FetchRequest
   */
  fetcher?: typeof fetch;

  /**
   * @access AbortPlugin
   * AbortController signal
   */
  signal?: AbortSignal;

  /**
   * @access AbortPlugin
   * AbortController
   */
  controller?: AbortController;

  /**
   * @access AbortPlugin
   * AbortHandler
   */
  onAbort?: (config: FetchRequestConfig) => void;
}
