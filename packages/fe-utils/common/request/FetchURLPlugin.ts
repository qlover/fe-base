import { FetchRequestErrorID, FetchRequestError } from './FetchRequest';
import { FetchRequestConfig } from './FetchRequestConfig';
import { ExecutorPlugin } from '../executor';

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
    // if response is not ok, throw error
    if (!result.ok) {
      const frError = new FetchRequestError(
        FetchRequestErrorID.RESPONSE_NOT_OK,
        `Request failed with status: ${result.status} ${result.statusText}`
      );

      // @ts-expect-error Experimental: add response to error
      frError.response = result;

      throw frError;
    }
    return result;
  }

  onError(error: Error): FetchRequestError {
    return error instanceof FetchRequestError
      ? error
      : new FetchRequestError(FetchRequestErrorID.FETCH_REQUEST_ERROR, error);
  }
}
