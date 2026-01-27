import {
  type LifecyclePluginInterface,
  type ExecutorContextInterface
} from '../../executor/interface';
import { type UrlBuilderInterface } from '../interface/UrlBuilderInterface';
import { type RequestAdapterConfig } from '../interface';
import { SimpleUrlBuilder } from '../utils/SimpleUrlBuilder';
import { RequestHeaderInjector } from './RequestHeaderInjector';
import {
  type HeaderInjectorConfig,
  type HeaderInjectorInterface
} from '../interface/HeaderInjectorInterface';
import { hasObjectKeyWithValue } from '../utils/isAsString';
import {
  JSON_RESPONSE_TYPE,
  CONTENT_TYPE_HEADER,
  JSON_CONTENT_TYPE
} from './consts';
import { clone } from 'lodash-es';

export type RequestAdapterContext = ExecutorContextInterface<
  RequestAdapterConfig,
  unknown
>;

/**
 * Configuration options for RequestPlugin
 *
 * Combines HeaderInjectorConfig and RequestAdapterConfig, allowing you to set
 * default values for all request configuration including data, headers, etc.
 *
 * @example
 * ```typescript
 * const config: RequestPluginConfig = {
 *   token: 'your-token',
 *   tokenPrefix: 'Bearer',
 *   authKey: 'Authorization',
 *   data: { version: '1.0' }, // Default request data
 *   requestDataSerializer: (data, config) => {
 *     // Access config properties like method, url, headers, etc.
 *     return config.method === 'POST' ? JSON.stringify(data) : data;
 *   }
 * };
 * ```
 */
export type RequestPluginConfig = HeaderInjectorConfig & {
  /**
   * Allow empty URL
   *
   * If set to `false`, an error will be thrown when both `url` and `baseURL` are empty.
   * If set to `true` (default), the URL builder will attempt to build the URL even if they are empty.
   *
   * @since 3.1.0
   * @default `true`
   */
  allowEmptyUrl?: boolean;

  requestDataSerializer?: (
    data: unknown,
    config: RequestAdapterConfig &
      Omit<RequestPluginConfig, 'requestDataSerializer'>
  ) => unknown;
};

export interface RequestPluginInnerConfig {
  urlBuilder?: UrlBuilderInterface;
  headerInjector?: HeaderInjectorInterface;
}

/**
 * Plugin for URL building
 *
 * This plugin is responsible for building the URL from the request configuration.
 *
 * This is the most basic plugin for concatenating request parameters.
 * You can also completely customize the plugin in use.
 *
 * It is currently used to replace the FetchURLPlugin plugin.
 *
 * Features:
 * - Base URL handling
 * - Query parameter management
 * - URL normalization
 * - Authentication header injection
 *
 * @example
 * ```typescript
 * const request = new RequestPlugin({
 *   urlBuilder: new SimpleUrlBuilder(),
 *   token: 'your-token',
 *   tokenPrefix: 'Bearer'
 * });
 * request.onBefore(ctx);
 * ```
 *
 * @since 3.0.0
 */
export class RequestPlugin
  implements LifecyclePluginInterface<RequestAdapterContext>
{
  public readonly pluginName = 'RequestPlugin';

  protected readonly config: RequestPluginConfig;

  /**
   * The URL builder to use
   *
   * @example
   * ```typescript
   * // ctx.parameters = {
   * //   url: 'https://api.example.com/users',
   * //   method: 'GET',
   * //   params: { role: 'admin' },
   * // }
   *
   * const request = new RequestPlugin({
   *   urlBuilder: new SimpleUrlBuilder(),
   *   token: 'your-token'
   * });
   * request.onBefore(ctx);
   *
   * // url = 'https://api.example.com/users?role=admin'
   * ```
   */
  protected readonly urlBuilder: UrlBuilderInterface;

  /**
   * Header injector for handling header injection logic
   */
  protected readonly headerInjector: HeaderInjectorInterface;

  constructor(
    /**
     * Default plugin configuration
     *
     * These settings can be overridden by values in the request context.
     *
     * @example
     * ```typescript
     * const plugin = new RequestPlugin({
     *   urlBuilder: new SimpleUrlBuilder(),
     *   token: () => localStorage.getItem('token'),
     *   tokenPrefix: 'Bearer',
     *   authKey: 'Authorization'
     * });
     * ```
     */
    options: RequestPluginConfig & RequestPluginInnerConfig = {}
  ) {
    const { urlBuilder, headerInjector, ...config } = options;

    this.config = config;
    this.urlBuilder = urlBuilder ?? new SimpleUrlBuilder();
    this.headerInjector = headerInjector ?? new RequestHeaderInjector(config);
  }

  /**
   * Pre-request hook that builds complete URL
   *
   * Merges default plugin configuration with request context configuration.
   *
   * @param ctx - Request context
   * @returns Request configuration with built URL
   *
   * @example
   * ```typescript
   * const request = new RequestPlugin({
   *   urlBuilder: new SimpleUrlBuilder(),
   *   token: 'your-token',
   *   tokenPrefix: 'Bearer'
   * });
   * request.onBefore(ctx);
   * ```
   * @override
   */
  public onBefore(ctx: RequestAdapterContext): void {
    ctx.setParameters(this.mergeConfig(ctx.parameters));
  }

  /**
   * Main request handler
   *
   * This is the core of the plugin. It merges default plugin configuration with request context configuration,
   * processes request data, builds the URL, and injects headers.
   *
   * @param config - Request configuration
   * @returns Merged configuration with processed data, built URL, and injected headers
   */
  public mergeConfig(
    config: RequestAdapterConfig & RequestPluginConfig
  ): RequestAdapterConfig & RequestPluginConfig {
    // Merge default config with context config
    const mergedConfig = this.createConfig(config);

    const processedData = this.processRequestData(mergedConfig);
    const builtUrl = this.buildUrl(mergedConfig);
    const injectedHeaders = this.injectHeaders(mergedConfig);

    return Object.assign(mergedConfig, {
      data: processedData,
      url: builtUrl,
      headers: injectedHeaders
    });
  }

  /**
   * Merge default plugin configuration with request context configuration
   *
   * Context configuration takes precedence over default configuration.
   * Data merging is delegated to RequestDataProcessor.
   *
   * If contextConfig has data (including null), it will override the default data.
   * If contextConfig.data is undefined, the default data will be preserved.
   *
   * @param contextConfig - Configuration from request context
   * @returns Merged configuration
   */
  protected createConfig(
    contextConfig: RequestAdapterConfig
  ): RequestAdapterConfig & RequestPluginConfig {
    const merged = Object.assign(clone(this.config), contextConfig);

    // Preserve default data if contextConfig.data is undefined
    // Only override if contextConfig explicitly provides data (including null)
    if (!('data' in contextConfig) && 'data' in this.config) {
      merged.data = this.config.data;
    }

    return merged;
  }

  /**
   * Build the URL from the request configuration
   *
   * @param config - Request configuration
   * @returns The built URL
   * @throws {Error} If the built URL is empty or invalid
   */
  protected buildUrl(
    config: RequestAdapterConfig & RequestPluginConfig
  ): string {
    if (config.allowEmptyUrl === false && !config.url && !config.baseURL) {
      throw new Error('Empty URL is not allowed');
    }
    return this.urlBuilder.buildUrl(config);
  }

  /**
   * Inject default headers into request configuration
   *
   * This method delegates to RequestHeaderInjector to handle header injection logic.
   * Header normalization is handled by the injector itself.
   *
   * @param config - Request configuration (merged with plugin config)
   * @returns Headers object with injected default headers, all values normalized to strings
   */
  protected injectHeaders(
    config: RequestAdapterConfig & RequestPluginConfig
  ): Record<string, string> {
    return this.headerInjector.inject(config);
  }

  /**
   * Process request data before sending
   *
   * Handles data serialization based on content type and request method.
   * GET/HEAD/OPTIONS requests should not have a body, so null is returned.
   *
   * Errors from JSON.stringify or custom serializer are propagated without modification.
   *
   * @param config - Request configuration
   * @returns Processed data (stringified JSON, FormData, or null for methods without body)
   * @throws {TypeError} If JSON.stringify fails (e.g., circular references)
   * @throws {Error} If custom serializer throws
   */
  protected processRequestData(
    config: RequestAdapterConfig & RequestPluginConfig
  ): BodyInit | null | undefined {
    const { requestDataSerializer, data, headers, responseType, method } =
      config;

    // HTTP methods that should not have a body
    const methodWithoutBody = method?.toUpperCase()?.trim();
    if (
      methodWithoutBody === 'GET' ||
      methodWithoutBody === 'HEAD' ||
      methodWithoutBody === 'OPTIONS'
    ) {
      return null;
    }

    // If data is undefined or null, return as-is
    if (data == null) {
      return data;
    }

    // Use custom serializer if provided
    if (typeof requestDataSerializer === 'function') {
      return requestDataSerializer(data, {
        ...config,
        requestDataSerializer: undefined
      }) as BodyInit | null | undefined;
    }

    // Default serializer: JSON.stringify for JSON content type
    const isJsonContentType =
      responseType === JSON_RESPONSE_TYPE ||
      hasObjectKeyWithValue(headers, CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE, {
        keyCaseSensitive: false,
        valueCaseSensitive: false
      });

    if (isJsonContentType) {
      // JSON.stringify returns undefined for undefined input, but we want to handle it explicitly
      return JSON.stringify(data);
    }

    // For non-JSON data, return as-is (could be FormData, Blob, ArrayBuffer, etc.)
    return data as BodyInit;
  }
}
