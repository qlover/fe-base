import {
  ApiCorsPlugin as KitApiCorsPlugin,
  buildApiCorsHeaders,
  buildRuntimeCorsConfig,
  createLogger,
  type ApiCorsPluginOptionsType,
  type BootstrapServerContext,
  type RuntimeCorsConfigType
} from '@qlover/next-kit/server';
import { I } from '@config/ioc-identifiter';
import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { ServerConfig } from '@server/ServerConfig';
import { createServerIoc } from '@server/serverIoc';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import {
  RUNTIME_CORS_CACHE_KEY,
  SiteSettingsService
} from '@server/services/SiteSettingsService';
import { ServerContext } from '@server/utils/ServerContext';

export type ApiCorsPluginOptions = Omit<
  ApiCorsPluginOptionsType,
  'loader' | 'applyResponseHeaders' | 'fallbackConfig'
>;

/**
 * next-oauth CORS：从 SiteSettings 加载，headers 写入 ServerContext。
 */
export class ApiCorsPlugin extends KitApiCorsPlugin<NextOAuthServerIocMap> {
  constructor(options: ApiCorsPluginOptions = {}) {
    super({
      ...options,
      fallbackConfig: () => ApiCorsPlugin.envFallbackConfig()
    });
  }

  /**
   * @override
   */
  public override async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextOAuthServerIocMap>): Promise<void> {
    const req = this.options.request;
    if (!req) {
      return;
    }

    const config = await this.loadConfig({
      IOC
    } as BootstrapServerContext<NextOAuthServerIocMap>['parameters']);
    const headers = buildApiCorsHeaders(req, config, {
      path: this.options.path,
      credentials: this.options.credentials
    });

    const serverContext = IOC(I.ServerContextInterface);
    if (serverContext instanceof ServerContext) {
      serverContext.setResponseHeaders(headers);
    }
  }

  /**
   * @override
   */
  protected override async loadConfig(
    parameters?: BootstrapServerContext<NextOAuthServerIocMap>['parameters']
  ): Promise<RuntimeCorsConfigType> {
    const IOC = parameters?.IOC;
    if (IOC) {
      return IOC(SiteSettingsService).getCorsConfig();
    }

    try {
      const serverConfig = new ServerConfig();
      const logger = createLogger('api-cors', serverConfig);
      const ioc = createServerIoc(logger, serverConfig);
      return await ioc(SiteSettingsService).getCorsConfig();
    } catch {
      // ignore and fall back to env
    }

    const fallback = ApiCorsPlugin.envFallbackConfig();
    await new MemoryKvCacheService().setItem(RUNTIME_CORS_CACHE_KEY, fallback);
    return fallback;
  }

  protected static envFallbackConfig(): RuntimeCorsConfigType {
    const config = new ServerConfig();
    const methods =
      config.apiCorsAllowedMethods.length > 0
        ? config.apiCorsAllowedMethods
        : ['GET', 'POST', 'OPTIONS'];
    const rules = config.apiCorsAllowedOrigins.map((origin) => ({
      origin,
      path: '*',
      methods: ['*'] as string[]
    }));
    return buildRuntimeCorsConfig(rules, methods);
  }
}
