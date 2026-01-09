import { RequestAdapterConfig } from '../interface';
import { hasObjectKeyWithValue, isAsString } from '../utils/isAsString';
import { appendHeaders } from '../utils/appendHeaders';
import {
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE,
  JSON_RESPONSE_TYPE,
  DEFAULT_AUTH_KEY
} from './consts';
import { RequestPluginConfig } from './RequestPlugin';
import {
  HeaderInjectorConfig,
  HeaderInjectorInterface
} from '../interface/HeaderInjectorInterface';

/**
 * Header injector for handling header injection logic
 *
 * This class is responsible for injecting default headers into request configuration,
 * including Content-Type headers and authentication headers.
 *
 * @example
 * ```typescript
 * const injector = new RequestHeaderInjector({
 *   token: 'your-token',
 *   tokenPrefix: 'Bearer'
 * });
 * const headers = injector.inject(config);
 * ```
 */
export class RequestHeaderInjector implements HeaderInjectorInterface {
  constructor(protected readonly config: HeaderInjectorConfig) {}

  /**
   * Inject default headers into request configuration
   *
   * This method adds default headers based on the request configuration.
   * It handles cases where headers may be null or undefined.
   *
   * @override
   * @param config - Request configuration (merged with plugin config)
   * @returns Headers object with injected default headers
   */
  public inject(
    config: RequestAdapterConfig & HeaderInjectorConfig
  ): Record<string, unknown> {
    let headers = config.headers ?? {};

    // Add Content-Type header for JSON requests if not already present
    if (
      !hasObjectKeyWithValue(headers, CONTENT_TYPE_HEADER) &&
      isAsString(config.responseType, JSON_RESPONSE_TYPE, true)
    ) {
      headers = appendHeaders(headers, CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE);
    }

    // Add auth header if token is provided
    const authKey = this.getAuthKey(config);
    if (authKey !== false && !hasObjectKeyWithValue(headers, authKey)) {
      const authValue = this.getAuthToken(config);
      if (isAsString(authValue)) {
        headers = appendHeaders(headers, authKey, authValue);
      }
    }

    return headers;
  }

  /**
   * Get auth token value from configuration
   *
   * Supports both string token and function that returns token.
   * Automatically prepends token prefix if configured.
   *
   * @param config - Request configuration
   * @returns Auth value string (with prefix if configured) or empty string if not found
   *
   * @example
   * ```typescript
   * // Returns: "Bearer your-token"
   * getAuthToken({ token: 'your-token', tokenPrefix: 'Bearer' })
   *
   * // Returns: "your-token"
   * getAuthToken({ token: 'your-token' })
   * ```
   */
  protected getAuthToken(config: RequestPluginConfig): string {
    const token = config.token;
    let tokenValue = '';

    if (typeof token === 'function') {
      const result = token.call(config);
      tokenValue = isAsString(result) ? result : '';
    } else if (isAsString(token)) {
      tokenValue = token;
    }

    if (!tokenValue) {
      return '';
    }

    const tokenPrefix = config.tokenPrefix;
    return isAsString(tokenPrefix)
      ? `${tokenPrefix} ${tokenValue}`
      : tokenValue;
  }

  /**
   * Get auth key from configuration
   *
   * @param config - Request configuration
   * @returns Auth key (default: 'Authorization') or false if auth is disabled
   */
  protected getAuthKey(config: RequestPluginConfig): string | false {
    if (config.authKey === false) {
      return false;
    }
    return config.authKey ?? DEFAULT_AUTH_KEY;
  }
}
