import {
  ApiServer,
  createLogger,
  isApiServerContext,
  type ApiServerContext,
  type BootstrapServerContextOptions,
  type BootstrapServerPlugin
} from '@qlover/next-kit/server';
import { RequestLogsRepository } from '@qlover/next-kit/server';
import { type NextRequest, NextResponse } from 'next/server';
import { API_USER_SESSION } from '@config/apiRoutes';
import { I } from '@config/ioc-identifiter';
import { oauthI18nIdToRfc } from '@config/oauthErrors';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { ServerConfig } from './ServerConfig';
import { createServerIoc } from './serverIoc';
import { NextApiHandler } from './utils/NextApiHandler';
import { ServerContext } from './utils/ServerContext';
import type { NextOAuthServerIocMap } from './BootstrapServer';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit/executor';
import type { NextKitApiResult } from '@qlover/next-kit/common';
import type { ServerContextInterface } from '@qlover/next-kit/server';

export type NextApiServerContext = ApiServerContext;

type RunWithInit = {
  successHeaders?: HeadersInit;
  errorHeaders?: HeadersInit;
  httpStatus?: number;
};

type RunWithTask<Result> = ExecutorAsyncTask<
  Result | NextKitApiResult<Result>,
  BootstrapServerContextOptions<NextOAuthServerIocMap>
>;

/**
 * App Next.js API server: wires ServerConfig + IOC, resolves ServerContext,
 * logs requests, and registers nextApiServerBackstop.
 * Keeps OAuth RFC JSON helper for machine endpoints.
 */
export class NextApiServer extends ApiServer<NextOAuthServerIocMap> {
  constructor(name?: string, nextRequest?: NextRequest);
  constructor(context?: Partial<NextApiServerContext>);

  constructor(
    nameOrContext?: string | Partial<NextApiServerContext>,
    nextRequest?: NextRequest
  ) {
    const serverConfig = new ServerConfig();

    if (isApiServerContext(nameOrContext)) {
      const name = nameOrContext.name ?? serverConfig.name;
      const logger = createLogger(name, serverConfig);
      const ioc = createServerIoc(logger, serverConfig);
      const serverContext = ioc(I.ServerContextInterface);

      super({
        name,
        logger,
        ioc,
        nextRequest: nameOrContext.nextRequest,
        event_type: nameOrContext.event_type ?? 'http.request',
        serverContext,
        resultHandler: new NextApiHandler(logger, serverContext)
      });
      return;
    }

    const name = nameOrContext ?? serverConfig.name;
    const logger = createLogger(name, serverConfig);
    const ioc = createServerIoc(logger, serverConfig);
    const serverContext = ioc(I.ServerContextInterface);

    super({
      name,
      logger,
      ioc,
      nextRequest,
      event_type: 'http.request',
      serverContext,
      resultHandler: new NextApiHandler(logger, serverContext)
    });
  }

  /**
   * @override
   */
  protected resolveServerContext(): ServerContextInterface {
    return this.IOC(I.ServerContextInterface);
  }

  /**
   * Headers stashed by ApiCorsPlugin (and similar) during onBefore.
   */
  protected getPluginResponseHeaders(): HeadersInit | undefined {
    if (this.serverContext instanceof ServerContext) {
      return this.serverContext.getResponseHeaders();
    }
    return undefined;
  }

  protected mergeResponseInit(init?: RunWithInit): RunWithInit | undefined {
    const pluginHeaders = this.getPluginResponseHeaders();
    if (!pluginHeaders && !init) {
      return undefined;
    }
    return {
      ...init,
      successHeaders: {
        ...pluginHeaders,
        ...init?.successHeaders
      },
      errorHeaders: {
        ...pluginHeaders,
        ...init?.errorHeaders
      }
    };
  }

  /**
   * @override
   *
   * Skip DB log writes for high-frequency, read-only endpoints so their JSON
   * response is not held up by a synchronous Supabase INSERT.
   * `/api/user/session` is called on every page load to restore auth state.
   */
  protected override afterApiResult<Result>(
    envelope: NextKitApiResult<Result>,
    request?: NextRequest
  ): void {
    if (!request) {
      return;
    }

    if (request.nextUrl.pathname === API_USER_SESSION) {
      return;
    }

    this.IOC(RequestLogsRepository).insertWithApiResult(envelope, { request });
  }

  /**
   * @override — merge ApiCorsPlugin headers after the pipeline runs.
   */
  public override async runWithJson<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);
    return this.returnJson(result, this.mergeResponseInit(init));
  }

  /**
   * Machine OAuth endpoints (token / userinfo / revoke) for RFC clients
   * such as Supabase Custom OAuth providers.
   *
   * Success: return the payload itself (no `{ success, data }` envelope).
   * Error: `{ error, error_description }` per RFC 6749 §5.2.
   */
  public async runWithOAuthJson<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);
    const merged = this.mergeResponseInit(init);
    const contextHttpStatus = this.serverContext.getState('httpStatus');
    const noStoreHeaders = {
      'Cache-Control': 'no-store',
      Pragma: 'no-cache'
    };

    if (!result.success) {
      return NextResponse.json(
        {
          error: oauthI18nIdToRfc(result.id ?? 'server_error'),
          error_description:
            result.message?.trim() || result.id || 'OAuth error'
        },
        {
          status: contextHttpStatus ?? 400,
          headers: {
            ...noStoreHeaders,
            ...merged?.errorHeaders
          }
        }
      );
    }

    const body =
      result.data === undefined || result.data === null ? {} : result.data;

    return NextResponse.json(body as object, {
      status: contextHttpStatus ?? 200,
      headers: {
        ...noStoreHeaders,
        ...merged?.successHeaders
      }
    });
  }

  public getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin<NextOAuthServerIocMap>[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
