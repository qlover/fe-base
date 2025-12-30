import {
  RequestErrorID,
  RequestError,
  type RequestAdapterConfig,
  type RequestAdapterResponse
} from '../interface';
import type { ExecutorPlugin, ExecutorContext } from '../../executor';
import type { UrlBuilderInterface } from '../interface/UrlBuilder';
import { SimpleUrlBuilder } from './SimpleUrlBuilder';

/**
 * Plugin for URL manipulation and response handling
 * Provides URL composition and response status checking
 *
 * - Core Idea: Simplify URL handling and response validation.
 * - Main Function: Manage URL construction and check response status.
 * - Main Purpose: Ensure correct URL formation and response handling.
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
 *
 * // Custom URL builder
 * const customUrlBuilder = new MyCustomUrlBuilder();
 * const urlPlugin = new FetchURLPlugin(customUrlBuilder);
 * ```
 */
export class FetchURLPlugin implements ExecutorPlugin {
  /**
   * URL builder instance
   */
  private readonly urlBuilder: UrlBuilderInterface;

  constructor(
    public readonly pluginName = 'FetchURLPlugin',
    urlBuilder?: UrlBuilderInterface
  ) {
    this.urlBuilder = urlBuilder || new SimpleUrlBuilder();
  }

  /**
   * Builds complete URL from configuration.
   *
   * Delegates to the configured URL builder implementation.
   *
   * @param config - Request configuration
   * @returns Complete URL
   *
   * @example
   * ```typescript
   * const completeUrl = urlPlugin.buildUrl(config);
   * ```
   */
  public buildUrl(config: RequestAdapterConfig): string {
    return this.urlBuilder.buildUrl(config);
  }

  /**
   * Pre-request hook that builds complete URL
   *
   * @override
   * @param config - Request configuration
   *
   * @example
   * ```typescript
   * urlPlugin.onBefore(config);
   * ```
   */
  public onBefore({ parameters }: ExecutorContext<RequestAdapterConfig>): void {
    // compose url and params
    parameters.url = this.buildUrl(parameters);
  }

  /**
   * Success hook that validates response status
   * Throws error for non-OK responses
   *
   * @override
   * @param result - Fetch response
   * @returns Response if OK
   * @throws {RequestError} If response is not OK
   *
   * @example
   * ```typescript
   * const response = urlPlugin.onSuccess(fetchResponse);
   * ```
   */
  public onSuccess({ returnValue }: ExecutorContext): void {
    const result = returnValue as RequestAdapterResponse<unknown, Response>;
    // if response is not ok, throw error
    if (!result.response.ok) {
      const requestError = new RequestError(
        RequestErrorID.RESPONSE_NOT_OK,
        `Request failed with status: ${result.status} ${result.statusText}`
      );

      // @ts-expect-error Experimental: add response to error
      requestError.response = result.response;

      throw requestError;
    }
  }

  /**
   * Error handling hook
   * Wraps non-RequestError errors
   *
   * @override
   * @param error - Original error
   * @returns RequestError
   *
   * @example
   * ```typescript
   * const error = urlPlugin.onError(new Error('Network Error'));
   * ```
   */
  public onError({ error }: ExecutorContext): RequestError {
    return error instanceof RequestError
      ? error
      : new RequestError(RequestErrorID.REQUEST_ERROR, error);
  }
}
