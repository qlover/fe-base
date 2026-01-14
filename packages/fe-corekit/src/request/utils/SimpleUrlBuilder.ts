import type { RequestAdapterConfig } from '../interface';
import type { UrlBuilderInterface } from '../interface/UrlBuilderInterface';

/**
 * Simple URL builder implementation
 *
 * A lightweight implementation of UrlBuilderInterface that provides
 * basic URL construction functionality using the native URL API.
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
  public isFullURL(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Builds complete URL from request configuration.
   *
   * Uses the native URL API for reliable URL construction and query parameter handling.
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
    const { url = '' } = config;
    const { baseURL = '', params } = config;

    // If no URL provided, return empty string
    if (!url) {
      return '';
    }

    let urlObject: URL;
    let shouldReturnPathOnly = false;

    if (this.isFullURL(url)) {
      urlObject = new URL(url);
    } else if (baseURL) {
      urlObject = new URL(url, baseURL);
    } else {
      // NOTE: If no baseURL, use a temporary base to construct URL object
      // This allows us to leverage URL API for path normalization and query handling
      urlObject = new URL(url, 'http://temp');
      shouldReturnPathOnly = true;
    }

    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          urlObject.searchParams.set(key, String(value));
        }
      });
    }

    if (shouldReturnPathOnly) {
      return urlObject.pathname + urlObject.search;
    }

    return urlObject.toString();
  }
}
