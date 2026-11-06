import type { NextRequest, NextResponse } from 'next/server';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '../interfaces/BootstrapServerInterface';
import type { ApiCorsConfigLoaderInterface } from '../interfaces/ApiCorsConfigLoaderInterface';
import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders,
  type ApiCorsConfig
} from '../utils/apiCors';

export type ApiCorsPluginOptionsType = {
  /** Pathname for rule matching (defaults to request URL pathname). */
  readonly path?: string;
  readonly credentials?: boolean;
  /**
   * Request used when mounted on ApiServer (onBefore).
   * Standalone {@link preflight} / {@link resolveHeaders} pass req as argument.
   */
  readonly request?: NextRequest;
  /** CORS 配置源；未传时子类须 override {@link loadConfig}. */
  readonly loader?: ApiCorsConfigLoaderInterface;
  /**
   * onBefore 解析出 headers 后的落点（应用注入 ServerContext 等）。
   */
  readonly applyResponseHeaders?: (
    headers: HeadersInit | undefined
  ) => void;
  /** loader / IOC 失败时的兜底配置。 */
  readonly fallbackConfig?: () => ApiCorsConfig | Promise<ApiCorsConfig>;
};

/**
 * CORS 插件：可独立 preflight，也可挂 ApiServer onBefore。
 * 应用侧注入 {@link ApiCorsConfigLoaderInterface} 与 headers sink。
 */
export class ApiCorsPlugin<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> implements BootstrapServerPlugin<IOCIdentifierMap>
{
  public readonly pluginName = 'ApiCorsPlugin';

  constructor(protected readonly options: ApiCorsPluginOptionsType = {}) {}

  /** Standalone OPTIONS（无 ApiServer）。 */
  public async preflight(req: NextRequest): Promise<NextResponse> {
    const config = await this.loadConfig();
    return apiCorsPreflightResponse(req, config, {
      path: this.options.path,
      credentials: this.options.credentials
    });
  }

  /** Standalone：解析 Allow-* headers。 */
  public async resolveHeaders(
    req: NextRequest
  ): Promise<HeadersInit | undefined> {
    const config = await this.loadConfig();
    return buildApiCorsHeaders(req, config, {
      path: this.options.path,
      credentials: this.options.credentials
    });
  }

  /**
   * ApiServer onBefore：加载配置并交给 {@link ApiCorsPluginOptionsType.applyResponseHeaders}。
   *
   * @override
   */
  public async onBefore({
    parameters
  }: BootstrapServerContext<IOCIdentifierMap>): Promise<void> {
    const req = this.options.request;
    if (!req) {
      return;
    }

    const config = await this.loadConfig(parameters);
    const headers = buildApiCorsHeaders(req, config, {
      path: this.options.path,
      credentials: this.options.credentials
    });
    this.options.applyResponseHeaders?.(headers);
  }

  /**
   * 加载 CORS 配置：优先 loader，否则 fallback。
   * 子类可 override 以接入 IOC。
   */
  protected async loadConfig(
    _parameters?: BootstrapServerContext<IOCIdentifierMap>['parameters']
  ): Promise<ApiCorsConfig> {
    if (this.options.loader) {
      try {
        return await this.options.loader.getCorsConfig();
      } catch {
        // fall through
      }
    }

    if (this.options.fallbackConfig) {
      return await this.options.fallbackConfig();
    }

    return {
      apiCorsAllowedOrigins: [],
      apiCorsAllowedMethods: ['GET', 'POST', 'OPTIONS'],
      apiCorsRules: []
    };
  }
}
