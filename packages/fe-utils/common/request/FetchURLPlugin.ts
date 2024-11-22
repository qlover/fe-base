import { FetchRequestErrorID, FetchRequestError } from './FetchRequest';
import { FetchRequestConfig } from './FetchRequestConfig';
import { ExecutorPlugin } from '../executor';

/**
 * Plugin for URL manipulation and response handling
 * Provides URL composition and response status checking
 *
 * Features:
 * - URL normalization
 * - Base URL handling
 * - Query parameter management
 * - Response status validation
 *
 * @implements {ExecutorPlugin}
 *
 * @example
 * ```typescript
 * // Basic usage
 * const urlPlugin = new FetchURLPlugin();
 * const client = new FetchRequest();
 * client.executor.use(urlPlugin);
 *
 * // Request with base URL and params
 * await client.get({
 *   baseURL: 'https://api.example.com',
 *   url: '/users',
 *   params: { role: 'admin' }
 * });
 * ```
 */
export class FetchURLPlugin implements ExecutorPlugin {
  /**
   * Checks if URL is absolute (starts with http:// or https://)
   *
   * @param url - URL to check
   * @returns Boolean indicating if URL is absolute
   */
  isFullURL(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Appends query parameters to URL
   * Handles existing query parameters in URL
   *
   * @param url - Base URL
   * @param params - Parameters to append
   * @returns URL with query parameters
   *
   * @example
   * ```typescript
   * const url = plugin.appendQueryParams(
   *   'https://api.example.com/users',
   *   { role: 'admin', status: 'active' }
   * );
   * // => https://api.example.com/users?role=admin&status=active
   * ```
   */
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

  /**
   * Combines base URL with path
   * Ensures proper slash handling
   *
   * @param url - URL path
   * @param baseURL - Base URL
   * @returns Combined URL
   */
  connectBaseURL(url: string, baseURL: string): string {
    return `${baseURL}/${url}`;
  }

  /**
   * Builds complete URL from configuration
   * Handles base URL, path normalization, and query parameters
   *
   * @param config - Request configuration
   * @returns Complete URL
   */
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
   * Pre-request hook that builds complete URL
   *
   * @param config - Request configuration
   */
  onBefore(config: FetchRequestConfig): void {
    // compose url and params
    config.url = this.buildUrl(config);
  }

  /**
   * Success hook that validates response status
   * Throws error for non-OK responses
   *
   * @param result - Fetch response
   * @returns Response if OK
   * @throws {FetchRequestError} If response is not OK
   */
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

  /**
   * Error handling hook
   * Wraps non-FetchRequestError errors
   *
   * @param error - Original error
   * @returns FetchRequestError
   */
  onError(error: Error): FetchRequestError {
    return error instanceof FetchRequestError
      ? error
      : new FetchRequestError(FetchRequestErrorID.FETCH_REQUEST_ERROR, error);
  }
}
