import {
  apiCorsPreflightResponse,
  buildApiCorsHeaders,
  createLogger
} from '@qlover/next-kit/server';
import { I } from '@config/ioc-identifiter';
import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import { ServerConfig } from '@server/ServerConfig';
import { createServerIoc } from '@server/serverIoc';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import {
  FE_RUNTIME_CORS_CACHE_KEY,
  SiteSettingsService
} from '@server/services/SiteSettingsService';
import {
  buildRuntimeCorsConfig,
  type RuntimeCorsConfig
} from '@server/utils/resolveRuntimeCorsConfig';
import { ServerContext } from '@server/utils/ServerContext';
import type {
  BootstrapServerContext,
  BootstrapServerPlugin
} from '@qlover/next-kit/server';
import type { NextRequest } from 'next/server';
import type { NextResponse } from 'next/server';

export type ApiCorsPluginOptions = {
  /** Pathname for rule matching (defaults to request URL pathname). */
  readonly path?: string;
  readonly credentials?: boolean;
  /**
   * Request used when mounted on NextApiServer (onBefore).
   * Standalone {@link preflight} / {@link resolveHeaders} pass req as argument.
   */
  readonly request?: NextRequest;
};

/**
 * CORS unit used both standalone and as a NextApiServer plugin.
 *
 * - Standalone: `new ApiCorsPlugin(opts).preflight(req)`
 * - Pipeline: `.use(new ApiCorsPlugin({ ...opts, request: req }))`
 */
export class ApiCorsPlugin implements BootstrapServerPlugin<NextOAuthServerIocMap> {
  public readonly pluginName = 'ApiCorsPlugin';

  constructor(private readonly options: ApiCorsPluginOptions = {}) {}

  /** Standalone OPTIONS (no NextApiServer). */
  public async preflight(req: NextRequest): Promise<NextResponse> {
    const config = await this.loadConfig();
    return apiCorsPreflightResponse(req, config, {
      path: this.options.path,
      credentials: this.options.credentials
    });
  }

  /** Standalone: resolve Allow-* headers for a request. */
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
   * NextApiServer onBefore: load via IOC and stash headers on ServerContext.

   * @override
      */
  public async onBefore({
    parameters: { IOC }
  }: BootstrapServerContext<NextOAuthServerIocMap>): Promise<void> {
    const req = this.options.request;
    if (!req) {
      return;
    }

    const config = await this.loadConfig(IOC);
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
   * Prefer SiteSettingsService (MemoryKv write-through).
   * Without IOC (standalone), spin a minimal server IOC; env fallback last.
   */
  protected async loadConfig(
    IOC?: BootstrapServerContext<NextOAuthServerIocMap>['parameters']['IOC']
  ): Promise<RuntimeCorsConfig> {
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
    await new MemoryKvCacheService().setItem(
      FE_RUNTIME_CORS_CACHE_KEY,
      fallback
    );
    return fallback;
  }

  protected static envFallbackConfig(): RuntimeCorsConfig {
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
