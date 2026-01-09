import { ExecutorContextInterface } from 'src/executor';
import { LifecyclePluginInterface } from '../../executor/interface/LifecyclePluginInterface';
import {
  RequestAdapterFetchConfig,
  RequestAdapterFetchContext
} from '../adapter/RequestAdapterFetch';
import { UrlBuilderInterface } from '../interface/UrlBuilderInterface';
import { RequestAdapterConfig } from '../interface';
import { SimpleUrlBuilder } from '../utils/SimpleUrlBuilder';
import { RequestHeaderInjector } from './RequestHeaderInjector';
import {
  HeaderInjectorConfig,
  HeaderInjectorInterface
} from '../interface/HeaderInjectorInterface';
import { hasObjectKeyWithValue } from '../utils/isAsString';
import { JSON_RESPONSE_TYPE, CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE } from './consts';

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
 *   requestDataSerializer: (data) => JSON.stringify(data)
 * };
 * ```
 */
export type RequestPluginConfig = HeaderInjectorConfig & {
  requestDataSerializer?: (data: unknown) => unknown;
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
 * const request = new RequestPlugin(new SimpleUrlBuilder(), {
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
   * const request = new RequestUrlBuilder(new SimpleUrlBuilder());
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
     * const plugin = new RequestPlugin(new SimpleUrlBuilder(), {
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
   * const request = new RequestUrlBuilder(new SimpleUrlBuilder());
   * request.onBefore(ctx);
   * ```
   * @override
   */
  public onBefore(
    ctx: RequestAdapterFetchContext
  ): RequestAdapterFetchConfig<unknown> {
    // Merge default config with context config
    const mergedConfig = this.mergeConfig(ctx.parameters);

    return {
      ...ctx.parameters,
      ...mergedConfig,
      data: this.processRequestData(mergedConfig),
      url: this.buildUrl(mergedConfig),
      headers: this.injectHeaders(mergedConfig)
    };
  }

  /**
   * Merge default plugin configuration with request context configuration
   *
   * Context configuration takes precedence over default configuration.
   * Data merging is delegated to RequestDataProcessor.
   *
   * If contextConfig has data, it will override the default data, and will not be merged.
   *
   * @param contextConfig - Configuration from request context
   * @returns Merged configuration
   */
  protected mergeConfig(
    contextConfig: RequestAdapterConfig
  ): RequestAdapterConfig & RequestPluginConfig {
    return { ...this.config, ...contextConfig };
  }

  /**
   * Build the URL from the request configuration
   *
   * @param config - Request configuration
   * @returns The built URL
   */
  protected buildUrl(config: RequestAdapterConfig): string {
    // TODO: need cache?
    return this.urlBuilder.buildUrl(config);
  }

  /**
   * Inject default headers into request configuration
   *
   * This method delegates to RequestHeaderInjector to handle header injection logic.
   *
   * @param config - Request configuration (merged with plugin config)
   * @returns Headers object with injected default headers
   */
  protected injectHeaders(
    config: RequestAdapterConfig & RequestPluginConfig
  ): Record<string, unknown> {
    return this.headerInjector.inject(config);
  }

  protected processRequestData(
    config: RequestAdapterConfig & RequestPluginConfig
  ): unknown {
    const { requestDataSerializer, data, headers, responseType } = config;

    if (typeof requestDataSerializer === 'function') {
      return requestDataSerializer(data);
    }

    // default serializer
    if (
      responseType === JSON_RESPONSE_TYPE ||
      hasObjectKeyWithValue(headers, CONTENT_TYPE_HEADER, JSON_CONTENT_TYPE, {
        keyCaseSensitive: false,
        valueCaseSensitive: false
      })
    ) {
      return JSON.stringify(data);
    }

    return data;
  }
}
