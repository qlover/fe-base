import type { RequestAdapterConfig } from './RequestAdapter';

/**
 * URL builder interface
 *
 * This interface defines the contract for URL builders.
 * URL builders are responsible for constructing URLs from request configurations.
 *
 * @since 3.0.0
 */
export interface UrlBuilderInterface {
  /**
   * Builds complete URL from request configuration.
   *
   * Handles base URL, path normalization, and query parameters.
   *
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
   * // Returns: 'https://api.example.com/users?role=admin'
   * ```
   */
  buildUrl(config: RequestAdapterConfig): string;
}
