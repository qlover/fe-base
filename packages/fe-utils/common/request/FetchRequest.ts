import { ExecutorError, ExecutorPlugin } from '../executor';
import { RequestConfig, RequestExecutor } from './RequestExecutor';
import merge from 'lodash/merge';

export enum FetchRequestErrorID {
  FETCH_REQUEST_ERROR = 'FETCH_REQUEST_ERROR',
  ENV_FETCH_NOT_SUPPORT = 'ENV_FETCH_NOT_SUPPORT',
  FETCHER_NONE = 'FETCHER_NONE',
  RESPONSE_NOT_OK = 'RESPONSE_NOT_OK'
}

export class FetchRequestError extends ExecutorError {
  constructor(
    id: string,
    originalError?: Error,
    public response?: Response
  ) {
    super(id, originalError?.message || id, originalError);
  }
}

export interface FetchRequestConfig extends RequestConfig {
  /**
   * baseURL
   * @example https://api.example.com
   *
   * url = /users/1 => https://api.example.com/users/1
   * url = users/1 => https://api.example.com/users/1
   */
  baseURL?: string;

  /**
   * fetcher
   */
  fetcher?: typeof fetch;
}

export class FetchURLPlugin implements ExecutorPlugin {
  isFullURL(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  appendQueryParams(url: string, params: Record<string, string> = {}): string {
    const opt = '?';
    const link = '&';
    let [path, search = ''] = url.split(opt);

    search.split(link).forEach((item) => {
      const [key, value] = item.split('=');
      if (key && value) {
        params[key] = value;
      }
    });

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return [path, queryString].join(opt);
  }

  connectBaseURL(url: string, baseURL: string): string {
    return `${baseURL}/${url}`;
  }

  buildUrl(config: FetchRequestConfig): string {
    let { url, baseURL = '' } = config;

    // has full url
    if (!this.isFullURL(url)) {
      // normalize baseUrl and path, only one slash
      const normalizedPath = url.startsWith('/') ? url.slice(1) : url;
      const normalizedBaseUrl = baseURL.endsWith('/')
        ? baseURL.slice(0, -1)
        : baseURL;
      url = this.connectBaseURL(normalizedPath, normalizedBaseUrl);
    }

    // handle params
    if (config.params && Object.keys(config.params).length > 0) {
      url = this.appendQueryParams(url, config.params);
    }

    return url;
  }

  /**
   * @override
   */
  onBefore(config: FetchRequestConfig): void {
    // compose url and params
    config.url = this.buildUrl(config);
  }

  onSuccess(result: Response): Response {
    if (!result.ok) {
      throw new FetchRequestError(
        FetchRequestErrorID.RESPONSE_NOT_OK,
        new Error(
          `Request failed with status: ${result.status} ${result.statusText}`
        ),
        result
      );
    }
    return result;
  }

  onError(error: Error): FetchRequestError {
    return error instanceof FetchRequestError
      ? error
      : new FetchRequestError(FetchRequestErrorID.FETCH_REQUEST_ERROR, error);
  }
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

    return this.executor.exec(mergedConfig, () => fetcher(mergedConfig.url));
  }
}
