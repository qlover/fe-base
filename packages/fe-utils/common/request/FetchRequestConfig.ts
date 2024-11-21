import { ExecutorConfig } from '../executor';
import { RequestMethod } from './RequestExecutor';

export interface RequestConfig {
  url: string;
  method?: RequestMethod;
  headers?: Record<string, string>;
  body?: unknown;
  params?: Record<string, string>;
  timeout?: number;
  executor?: ExecutorConfig;
  [key: string]: unknown;
}

export interface FetchRequestConfig extends RequestConfig {
  /**
   * baseURL
   * @example https://api.example.com
   * @access FetchURLPlugin
   *
   * - url = /users/1 => https://api.example.com/users/1
   * - url = users/1 => https://api.example.com/users/1
   */
  baseURL?: string;

  /**
   * fetcher
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
