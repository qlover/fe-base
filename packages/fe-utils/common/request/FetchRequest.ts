import { ExecutorError, ExecutorPlugin } from '../executor';
import { RequestConfig, RequestExecutor } from './RequestExecutor';
import merge from 'lodash/merge';

export enum FetchRequestErrorID {
  FETCH_REQUEST_ERROR = 'FETCH_REQUEST_ERROR',
  ENV_FETCH_NOT_SUPPORT = 'ENV_FETCH_NOT_SUPPORT',
  FETCHER_NONE = 'FETCHER_NONE',
  RESPONSE_NOT_OK = 'RESPONSE_NOT_OK',
  ABORT_ERROR = 'ABORT_ERROR'
}

export class FetchRequestError extends ExecutorError {
  constructor(id: string, originalError?: string | Error) {
    super(
      id,
      typeof originalError === 'string'
        ? originalError
        : originalError?.message || id,
      originalError instanceof Error ? originalError : undefined
    );
  }
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

export class FetchRequest extends RequestExecutor<FetchRequestConfig> {
  constructor(config: Partial<FetchRequestConfig> = {}) {
    if (!config.fetcher) {
      if (typeof fetch !== 'function') {
        throw new FetchRequestError(FetchRequestErrorID.ENV_FETCH_NOT_SUPPORT);
      }

      config.fetcher = fetch;
    }

    super(config as FetchRequestConfig);
  }

  /**
   * @override
   * @returns Response
   */
  async request(config: FetchRequestConfig): Promise<Response> {
    const thisConfig = this.getConfig();
    const mergedConfig = merge({}, thisConfig, config);
    const fetcher = mergedConfig.fetcher;

    if (typeof fetcher !== 'function') {
      throw new FetchRequestError(FetchRequestErrorID.FETCHER_NONE);
    }

    return this.executor.exec(mergedConfig, () =>
      fetcher(mergedConfig.url, {
        signal: mergedConfig.signal
      })
    );
  }
}
