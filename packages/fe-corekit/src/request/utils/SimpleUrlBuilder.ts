import type { RequestAdapterConfig } from '../interface';
import type { UrlBuilderInterface } from '../interface/UrlBuilderInterface';
import { isAbsoluteUrl } from './isAbsoluteUrl';

/**
 * Simple URL builder implementation
 *
 * A lightweight implementation of `UrlBuilderInterface` that provides
 * basic URL construction functionality using the native URL API.
 *
 * Core features:
 * - Base URL handling: Supports both absolute and relative URLs with flexible baseURL configuration
 * - Query parameter management: Automatic encoding and null/undefined value filtering
 * - URL normalization: Leverages native URL API for consistent path resolution
 * - Extensible design: Protected methods allow subclass customization
 *
 * Design considerations:
 * - Uses temporary domain (`http://temp`) for relative URL processing to leverage URL API
 * - Supports strict mode for stricter baseURL validation
 * - Returns path-only strings for relative URLs without valid baseURL
 *
 * `@since` `3.0.0`
 *
 * @example Basic usage with absolute baseURL
 * ```typescript
 * const urlBuilder = new SimpleUrlBuilder();
 * const url = urlBuilder.buildUrl({
 *   url: '/users',
 *   baseURL: 'https://api.example.com',
 *   params: { role: 'admin', page: 1 }
 * });
 * // Returns: 'https://api.example.com/users?role=admin&page=1'
 * ```
 *
 * @example Relative URL without baseURL
 * ```typescript
 * const urlBuilder = new SimpleUrlBuilder();
 * const url = urlBuilder.buildUrl({
 *   url: '/users',
 *   params: { status: 'active' }
 * });
 * // Returns: '/users?status=active'
 * ```
 *
 * @example Strict mode usage
 * ```typescript
 * const urlBuilder = new SimpleUrlBuilder({ strict: true });
 * const url = urlBuilder.buildUrl({
 *   url: '/users',
 *   baseURL: 'invalid-url' // Will throw error in strict mode
 * });
 * ```
 */
export class SimpleUrlBuilder implements UrlBuilderInterface {
  constructor(
    /**
     * URL builder configuration options
     *
     * Controls the behavior of URL construction and validation
     */
    protected readonly config?: {
      /**
       * Whether to enable strict mode for baseURL validation
       *
       * When enabled:
       * - Invalid baseURL will cause URL construction to fail
       * - Only valid absolute URLs are accepted as baseURL
       *
       * When disabled (default):
       * - Invalid baseURL is treated as relative path
       * - More flexible URL handling for various scenarios
       *
       * `@default` `false`
       * `@optional`
       */
      strict?: boolean;
    }
  ) {}
  /**
   * Checks if URL is absolute (starts with `http://` or `https://`)
   *
   * This method determines whether a URL string represents an absolute URL
   * that can be used directly without a base URL.
   *
   * @param url - URL string to check
   * @returns `true` if URL is absolute, `false` otherwise
   *
   * @example
   * ```typescript
   * urlBuilder.isFullURL('https://api.example.com/users'); // true
   * urlBuilder.isFullURL('http://localhost:3000'); // true
   * urlBuilder.isFullURL('/users'); // false
   * urlBuilder.isFullURL('users'); // false
   * ```
   */
  public isFullURL(url: string): boolean {
    return isAbsoluteUrl(url);
  }

  /**
   * Creates URL object from url and baseURL
   *
   * This method handles the core URL construction logic and can be overridden
   * by subclasses to customize URL building behavior.
   *
   * URL construction strategy:
   * - Absolute URLs: Used directly, ignoring baseURL
   * - Relative URLs in strict mode: Requires valid baseURL, otherwise returns path only
   * - Relative URLs in non-strict mode: Uses baseURL if it's absolute, otherwise treats as path
   *
   * Technical implementation:
   * - Uses native URL API for reliable URL parsing and normalization
   * - Employs temporary domain (`http://temp`) for relative URL processing
   * - Returns flag indicating whether to strip domain from final result
   *
   * @param url - The URL path to build (absolute or relative)
   * @param baseURL - The base URL to use for relative paths
   * @returns Object containing:
   *   - `urlObject`: Constructed URL instance
   *   - `shouldReturnPathOnly`: Whether to return only pathname + search + hash
   *
   * @example Override in subclass
   * ```typescript
   * class CustomUrlBuilder extends SimpleUrlBuilder {
   *   protected createUrlObject(url: string, baseURL: string) {
   *     // Add custom logic before URL construction
   *     const normalizedUrl = url.toLowerCase();
   *     return super.createUrlObject(normalizedUrl, baseURL);
   *   }
   * }
   * ```
   *
   * @example Direct usage (internal)
   * ```typescript
   * const result = this.createUrlObject('/users', 'https://api.example.com');
   * // result.urlObject.toString() => 'https://api.example.com/users'
   * // result.shouldReturnPathOnly => false
   * ```
   */
  protected createUrlObject(
    url: string,
    baseURL: string
  ): { urlObject: URL; shouldReturnPathOnly: boolean } {
    let urlObject: URL;
    let shouldReturnPathOnly = false;

    if (this.isFullURL(url)) {
      urlObject = new URL(url);
    } else {
      if (this.config?.strict) {
        if (baseURL) {
          urlObject = new URL(url, baseURL);
        } else {
          urlObject = new URL(url, 'http://temp');
          shouldReturnPathOnly = true;
        }
      } else {
        const base = typeof baseURL === 'string' && baseURL ? baseURL : '';
        if (base && this.isFullURL(base)) {
          urlObject = new URL(url, base);
        } else {
          urlObject = new URL(url, 'http://temp' + base);
          shouldReturnPathOnly = true;
        }
      }
    }

    return { urlObject, shouldReturnPathOnly };
  }

  /**
   * Builds complete URL from request configuration
   *
   * Constructs a URL string by combining the request URL, base URL, and query parameters.
   * Uses the native URL API for reliable URL construction and automatic encoding.
   *
   * URL construction rules:
   * - Absolute URLs (starting with `http://` or `https://`) are used directly
   * - Relative URLs are combined with baseURL if provided
   * - Query parameters are automatically encoded and appended
   * - `null` and `undefined` parameter values are filtered out
   * - Hash fragments are preserved in the final URL
   *
   * @override
   * @param config - Request configuration containing URL components
   * @param {string} [config.url=''] - The URL path (absolute or relative)
   * @param {string} [config.baseURL=''] - The base URL for relative paths
   * @param {Record<string, any>} [config.params] - Query parameters to append
   *
   * @returns Complete URL string or empty string if no URL provided
   *
   * @example Basic URL with query parameters
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/users',
   *   baseURL: 'https://api.example.com',
   *   params: { role: 'admin', page: 1 }
   * });
   * // Returns: 'https://api.example.com/users?role=admin&page=1'
   * ```
   *
   * @example Relative URL without baseURL
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/api/users',
   *   params: { status: 'active' }
   * });
   * // Returns: '/api/users?status=active'
   * ```
   *
   * @example Absolute URL ignores baseURL
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: 'https://other.com/users',
   *   baseURL: 'https://api.example.com'
   * });
   * // Returns: 'https://other.com/users'
   * ```
   *
   * @example Parameter filtering
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/users',
   *   baseURL: 'https://api.example.com',
   *   params: { name: 'John', age: null, city: undefined }
   * });
   * // Returns: 'https://api.example.com/users?name=John'
   * // Note: null and undefined values are filtered out
   * ```
   *
   * @example URL with hash fragment
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/docs#section',
   *   baseURL: 'https://example.com',
   *   params: { version: 'v2' }
   * });
   * // Returns: 'https://example.com/docs?version=v2#section'
   * ```
   */
  public buildUrl(config: RequestAdapterConfig): string {
    const { url = '', baseURL = '', params } = config;

    if (!url) {
      return '';
    }

    const { urlObject, shouldReturnPathOnly } = this.createUrlObject(
      url,
      baseURL
    );

    // Append query parameters, filtering out null and undefined values
    if (params && Object.keys(params).length > 0) {
      Object.entries(params).forEach(([key, value]) => {
        if (value != null) {
          urlObject.searchParams.set(key, String(value));
        }
      });
    }

    if (shouldReturnPathOnly) {
      return urlObject.pathname + urlObject.search + urlObject.hash;
    }

    return urlObject.toString();
  }
}
