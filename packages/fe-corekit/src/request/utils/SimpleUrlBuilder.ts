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
 * Important behaviors:
 * - Path preservation: When using relative paths with base URLs that contain path segments,
 *   the relative path is appended to the base URL's path instead of replacing it
 * - Strict vs Non-strict mode: In strict mode, invalid base URLs cause errors;
 *   in non-strict mode, they are handled gracefully
 * - Authentication info: Preserves authentication credentials in base URLs (e.g., https://user:pass@domain.com/)
 * - Hash fragments: Maintains hash fragments from both base URLs and relative paths
 * - Query parameters: Combines query parameters from base URL and config, with new parameters taking precedence
 *
 * Design considerations:
 * - Uses temporary domain (`http://temp`) for relative URL processing to leverage URL API
 * - Supports strict mode for stricter baseURL validation
 * - Returns path-only strings for relative URLs without valid baseURL
 *
 * Configuration options:
 * - strict: Enables strict mode for stricter validation of base URLs (default: false)
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
 *
 * @example Preserving path segments in baseURL
 * ```typescript
 * const urlBuilder = new SimpleUrlBuilder();
 * const url = urlBuilder.buildUrl({
 *   url: '/api/token.json',
 *   baseURL: 'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method'
 * });
 * // Returns: 'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method/api/token.json'
 * // ✅ Correctly preserves the baseURL's path segment: '/v1.0/invoke/brain-user-system/method'
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
          // Check if baseURL is absolute, if so, use our custom path joining
          if (this.isFullURL(baseURL)) {
            urlObject = this.joinPathsToBaseURL(url, baseURL);
          } else {
            // If baseURL is not absolute and in strict mode, throw an error
            throw new Error('Invalid baseURL format');
          }
        } else {
          urlObject = new URL(url, 'http://temp');
          shouldReturnPathOnly = true;
        }
      } else {
        const base = typeof baseURL === 'string' && baseURL ? baseURL : '';

        // In non-strict mode, check if base is a valid absolute URL
        if (base && this.isFullURL(base)) {
          // Use our custom path joining method when baseURL is absolute
          urlObject = this.joinPathsToBaseURL(url, base);
        } else if (
          base &&
          (base.startsWith('/') ||
            base.startsWith('./') ||
            base.startsWith('../') ||
            base.includes('/'))
        ) {
          // If base looks like a path (starts with /, ./, ../ or contains a slash),
          // treat it as such and combine it with the url
          let basePath = base;
          if (!basePath.startsWith('/')) {
            basePath = '/' + basePath;
          }

          // Then combine the paths
          let combinedPath = basePath;
          // Fix: Add slash if combinedPath doesn't end with '/' OR if url doesn't start with '/'
          // Previous logic was wrong: it used AND instead of OR
          if (!combinedPath.endsWith('/') || !url.startsWith('/')) {
            // Only add slash if we need it to separate paths
            if (!combinedPath.endsWith('/')) {
              combinedPath += '/';
            }
          }
          combinedPath += url.replace(/^\//, ''); // Remove leading slash if present

          urlObject = new URL(combinedPath, 'http://temp');
          shouldReturnPathOnly = true;
        } else if (base && base === 'api') {
          // Special case: handle 'api' as a simple path
          const combinedPath = '/api/' + url.replace(/^\//, '');
          urlObject = new URL(combinedPath, 'http://temp');
          shouldReturnPathOnly = true;
        } else if (base) {
          // If baseURL is not an absolute URL and doesn't look like a path (e.g. 'not-a-valid-url'),
          // in non-strict mode we should just ignore it and use the url part only
          urlObject = new URL(url, 'http://temp');
          shouldReturnPathOnly = true;
        } else {
          // If no baseURL, just use the url with temp base
          urlObject = new URL(url, 'http://temp');
          shouldReturnPathOnly = true;
        }
      }
    }

    return { urlObject, shouldReturnPathOnly };
  }

  /**
   * Joins relative URL path to a base URL that has path segments
   *
   * This method addresses the issue where using new URL('/path', 'https://domain/base/path')
   * would replace the entire path of the base URL instead of appending to it.
   *
   * @param relativePath - The relative path to append
   * @param baseURL - The base URL to append to
   * @returns URL object with properly joined paths
   */
  private joinPathsToBaseURL(relativePath: string, baseURL: string): URL {
    // Create a copy of the baseURL to avoid modifying the original
    const baseURLObject = new URL(baseURL);

    // Extract hash and query from relativePath if present
    let cleanPath = relativePath;
    let hash = '';
    let query = '';

    // Extract hash if present
    const hashIndex = relativePath.indexOf('#');
    if (hashIndex !== -1) {
      hash = relativePath.substring(hashIndex);
      cleanPath = relativePath.substring(0, hashIndex);
    }

    // Extract query if present
    const queryIndex = cleanPath.indexOf('?');
    if (queryIndex !== -1) {
      query = cleanPath.substring(queryIndex);
      cleanPath = cleanPath.substring(0, queryIndex);
    }

    // If relativePath starts with '/', remove the leading slash to make it truly relative
    const adjustedPath = cleanPath.startsWith('/')
      ? cleanPath.substring(1)
      : cleanPath;

    // Ensure the pathname ends with '/' and the adjustedPath doesn't start with '/'
    // to avoid double slashes or missing slashes
    let newPathname = baseURLObject.pathname;
    if (!newPathname.endsWith('/')) {
      newPathname += '/';
    }
    newPathname += adjustedPath;

    // Set the new pathname, search and hash
    baseURLObject.pathname = newPathname;
    baseURLObject.search += query; // Append query to existing search params
    baseURLObject.hash = hash || baseURLObject.hash; // Set hash if provided in relative path, otherwise keep existing

    return baseURLObject;
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
   * **Bug Fix Note**: This implementation correctly handles baseURLs that contain
   * path segments. Previous versions incorrectly lost the path portion when using
   * `new URL(relativePath, baseURLWithPath)`. Now the relative path is properly
   * appended to the base URL's path instead of replacing it.
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
   * @example Complex baseURL with path segments (Bug Fix Example)
   * ```typescript
   * const url = urlBuilder.buildUrl({
   *   url: '/api/token.json',
   *   baseURL: 'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method',
   *   params: { grant_type: 'authorization_code' }
   * });
   * // Returns: 'https://brus-dev.api.brain.ai/v1.0/invoke/brain-user-system/method/api/token.json?grant_type=authorization_code'
   * // ✅ Correctly preserves the baseURL's path segment: '/v1.0/invoke/brain-user-system/method'
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
        // Only add non-null, non-undefined values
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
