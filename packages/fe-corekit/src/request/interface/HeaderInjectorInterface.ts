import { RequestAdapterConfig } from './RequestAdapter';

export interface HeaderInjectorConfig {
  /**
   * Authentication token
   *
   * Can be a string or a function that returns a token string.
   *
   * @example
   * ```typescript
   * token: 'your-token-here'
   * // or
   * token: () => localStorage.getItem('token')
   * ```
   */
  token?: string | (() => string | null);

  /**
   * Token prefix for authentication header
   *
   * Common values: 'Bearer', 'Token', etc.
   *
   * @example
   * ```typescript
   * tokenPrefix: 'Bearer' // Results in: "Bearer your-token"
   * ```
   */
  tokenPrefix?: string;

  /**
   * Authentication header key name
   *
   * - If set to `false`, auth header will not be appended
   * - Default is `'Authorization'`
   *
   * @default 'Authorization'
   * @example
   * ```typescript
   * authKey: 'Authorization' // Default
   * authKey: 'X-Auth-Token' // Custom header name
   * authKey: false // Disable auth header
   * ```
   */
  authKey?: string | false;
}

export interface HeaderInjectorInterface {
  /**
   * Inject default headers into request configuration
   *
   * Returns normalized headers with all values as strings (required by fetch API).
   *
   * @param config - Request configuration
   * @returns Headers object with injected default headers, all values normalized to strings
   */
  inject(
    config: RequestAdapterConfig & HeaderInjectorConfig
  ): Record<string, string>;
}
