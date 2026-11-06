import {
  ApiServer,
  createLogger,
  isApiServerContext,
  type ApiServerContext,
  type BinaryApiPayload,
  type BootstrapServerContextOptions,
  type BootstrapServerPlugin
} from '@qlover/next-kit/server';
import { RequestLogsRepository } from '@qlover/next-kit/server';
import { type NextRequest, NextResponse } from 'next/server';
import { I } from '@config/ioc-identifiter';
import { oauthI18nIdToRfc } from '@config/oauthErrors';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { ServerConfig } from './ServerConfig';
import { createServerIoc } from './serverIoc';
import { NextApiHandler } from './utils/NextApiHandler';
import { ServerContext } from './utils/ServerContext';
import type { NextOAuthServerIocMap } from './BootstrapServer';
import type { SessionCookieFieldsType } from './services/OAuthSessionService';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit/executor';
import type { NextKitApiResult } from '@qlover/next-kit/common';
import type { ServerContextInterface } from '@qlover/next-kit/server';

function readSessionCookieFromResult(
  result: NextKitApiResult<unknown>
): SessionCookieFieldsType | null {
  if (
    !result.success ||
    result.data == null ||
    typeof result.data !== 'object'
  ) {
    return null;
  }
  const cookie = (result.data as { sessionCookie?: unknown }).sessionCookie;
  if (cookie == null || typeof cookie !== 'object') {
    return null;
  }
  const fields = cookie as Partial<SessionCookieFieldsType>;
  if (
    typeof fields.name !== 'string' ||
    typeof fields.value !== 'string' ||
    typeof fields.maxAge !== 'number'
  ) {
    return null;
  }
  return fields as SessionCookieFieldsType;
}

export type NextApiServerContext = ApiServerContext;

type RunWithInit = {
  successHeaders?: HeadersInit;
  errorHeaders?: HeadersInit;
  httpStatus?: number;
};

type RunWithBinaryInit = RunWithInit & {
  notFoundHeaders?: HeadersInit;
  notFoundCacheControl?: string;
  successCacheControl?: string;
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
   * General API **success is not persisted** (noise / table growth).
   * Only failures are written. Auth login/logout use `insertWithAuth`
   * separately (not via this hook).
   */
  protected override afterApiResult<Result>(
    envelope: NextKitApiResult<Result>,
    request?: NextRequest
  ): void {
    if (!request || envelope.success) {
      return;
    }

    void this.IOC(RequestLogsRepository).insertWithApiResult(envelope, {
      request
    });
  }

  /**
   * @override — merge ApiCorsPlugin headers after the pipeline runs.
   */
  public override async runWithJson<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const started = performance.now();
    const result = await this.run(task);
    const response = this.returnJson(result, this.mergeResponseInit(init));
    response.headers.set(
      'Server-Timing',
      `app;dur=${Math.round(performance.now() - started)}`
    );
    return response;
  }

  /**
   * Binary/image endpoints with CORS header merge + Server-Timing.
   *
   * @override
   */
  public override async runWithBinary(
    task?: RunWithTask<BinaryApiPayload | null>,
    init?: RunWithBinaryInit
  ): Promise<NextResponse> {
    const started = performance.now();
    const response = await super.runWithBinary(
      task,
      this.mergeResponseInit(init)
    );
    response.headers.set(
      'Server-Timing',
      `app;dur=${Math.round(performance.now() - started)}`
    );
    return response;
  }

  /**
   * Redirect responses must carry the session cookie on the
   * {@link NextResponse} itself — `cookies().set` alone is often dropped.
   *
   * @override
   */
  public override async runWithRedirect<Result>(
    task?: RunWithTask<Result>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);
    const merged = this.mergeResponseInit(init);
    const contextHttpStatus = this.serverContext.getState('httpStatus');
    const redirectUrl = this.serverContext.getState('redirectUrl');

    if (redirectUrl) {
      const response = NextResponse.redirect(redirectUrl, {
        status: contextHttpStatus ?? 307,
        headers: merged?.successHeaders ?? merged?.errorHeaders
      });
      const sessionCookie = readSessionCookieFromResult(result);
      if (sessionCookie != null) {
        response.cookies.set(sessionCookie.name, sessionCookie.value, {
          httpOnly: sessionCookie.httpOnly,
          secure: sessionCookie.secure,
          sameSite: sessionCookie.sameSite,
          path: sessionCookie.path,
          maxAge: sessionCookie.maxAge
        });
      }
      return response;
    }

    return this.returnJson(result, merged);
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
