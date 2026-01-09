import type { RequestAdapterConfig } from '../interface';
import type { UrlBuilderInterface } from '../interface/UrlBuilderInterface';

/**
 * Simple URL builder implementation
 *
 * A lightweight implementation of UrlBuilderInterface that provides
 * basic URL construction functionality.
 *
 * Features:
 * - Base URL handling
 * - Query parameter management
 * - URL normalization
 *
 * @since 3.0.0
 *
 * @example
 * ```typescript
 * const urlBuilder = new SimpleUrlBuilder();
 * const url = urlBuilder.buildUrl({
 *   url: '/users',
 *   baseURL: 'https://api.example.com',
 *   params: { role: 'admin' }
 * });
 * 
 * // Returns: 'https://api.example.com/users?role=admin'
 * ```
 */
export class SimpleUrlBuilder implements UrlBuilderInterface {
  /**
   * Checks if URL is absolute (starts with http:// or https://)
   *
   * @param url - URL to check
   * @returns Boolean indicating if URL is absolute
   */
  protected isFullURL(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Appends query parameters to URL
   *
   * @param url - Base URL
   * @param params - Parameters to append
   * @returns URL with query parameters
   */
  protected appendQueryParams(
    url: string,
    params: Record<string, unknown> = {}
  ): string {
    const queryString = Object.entries(params)
      .filter(([, value]) => value != null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');

    if (!queryString) {
      return url;
    }

    const separator = url.includes('?') ? '&' : '?';
    return url + separator + queryString;
  }

  /**
   * Combines base URL with path
   *
   * @param url - URL path
   * @param baseURL - Base URL
   * @returns Combined URL
   */
  protected connectBaseURL(url: string, baseURL: string): string {
    const normalizedBaseUrl = baseURL.replace(/\/$/, '');
    const normalizedPath = url.replace(/^\//, '');
    return `${normalizedBaseUrl}/${normalizedPath}`;
  }

  /**
   * Builds complete URL from request configuration.
   *
   * @override
   * @param config - Request configuration
   * @returns Complete URL
   *
   * @example
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/users',
   *   baseURL: 'https://api.example.com',
   *   params: { role: 'admin' }
   * });
   *
   * // Returns: 'https://api.example.com/users?role=admin'
   * ```
   */
  public buildUrl(config: RequestAdapterConfig): string {
    let { url = '' } = config;
    const { baseURL = '', params } = config;

    // If no URL provided, return empty string
    if (!url) {
      return '';
    }

    // If URL is not absolute, combine with base URL
    if (!this.isFullURL(url) && baseURL) {
      url = this.connectBaseURL(url, baseURL);
    }

    // Append query parameters if provided
    if (params && Object.keys(params).length > 0) {
      url = this.appendQueryParams(url, params);
    }

    return url;
  }
}
