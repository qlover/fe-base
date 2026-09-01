import { isPlainObject, pick } from 'lodash-es';
import { NextResponse, type NextRequest } from 'next/server';
import {
  BootstrapServer,
  type BootstrapServerDeps
} from './BootstrapServer';
import {
  NextApiHandler,
  type ResultHandlerInterface
} from './utils/NextApiHandler';
import type { BootstrapServerContextOptions } from './interfaces/BootstrapServerInterface';
import type { ServerContextInterface } from './interfaces/ServerContextInterface';
import type {
  NextKitApiResult,
  NextKitApiSuccess
} from '../common/interfaces/NextKitApi';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit/executor';

export type ApiServerContext = {
  name?: string;
  nextRequest?: NextRequest;
  /**
   * @default 'http.request'
   */
  event_type?: string;
};

export type ApiServerDeps<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> = BootstrapServerDeps<IOCIdentifierMap> & {
  nextRequest?: NextRequest;
  event_type?: string;
  /**
   * Prefer passing the app's ServerContext instance.
   * Alternatively override {@link ApiServer.resolveServerContext}.
   */
  serverContext?: ServerContextInterface;
  resultHandler?: ResultHandlerInterface;
};

type RunWithInit = {
  successHeaders?: HeadersInit;
  errorHeaders?: HeadersInit;
  httpStatus?: number;
};

export type BinaryApiPayload = {
  bytes: Uint8Array;
  contentType: string;
};

type RunWithBinaryInit = RunWithInit & {
  notFoundHeaders?: HeadersInit;
  notFoundCacheControl?: string;
  successCacheControl?: string;
};

type RunWithTask<
  Result,
  IOCIdentifierMap extends Record<PropertyKey, unknown>
> = ExecutorAsyncTask<
  Result | NextKitApiResult<Result>,
  BootstrapServerContextOptions<IOCIdentifierMap>
>;

/**
 * Base API server orchestration for Next.js route handlers.
 *
 * Apps subclass and own plugins / logging / OAuth responses:
 * - {@link resolveServerContext} — resolve context from IOC tokens
 * - {@link afterApiResult} — request logging, metrics, etc.
 * - `getPlugins` — register app-specific plugins on the subclass
 * - OAuth RFC JSON — add methods like `runWithOAuthJson` on the subclass
 */
export class ApiServer<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> extends BootstrapServer<IOCIdentifierMap> {
  protected resultHandler: ResultHandlerInterface;
  protected serverContext: ServerContextInterface;
  protected nextRequest?: NextRequest;

  constructor(deps: ApiServerDeps<IOCIdentifierMap>) {
    super(deps);
    this.nextRequest = deps.nextRequest;
    this.serverContext =
      deps.serverContext ?? this.resolveServerContext();
    this.resultHandler =
      deps.resultHandler ??
      new NextApiHandler(this.logger, this.serverContext);

    void this.serverContext.reset({
      name: deps.name,
      uid: this.root.uuid,
      event_type: deps.event_type ?? 'http.request'
    });
  }

  /**
   * Resolve {@link ServerContextInterface} when not passed via deps.
   * Default implementation throws — override in app subclasses that use IOC tokens.
   */
  protected resolveServerContext(): ServerContextInterface {
    throw new Error(
      '[@qlover/next-kit] ApiServer requires deps.serverContext or an override of resolveServerContext()'
    );
  }

  /**
   * Called after the API envelope is built. Default is a no-op.
   * Apps override to write request logs, metrics, etc.
   */
  protected afterApiResult<Result>(
    _envelope: NextKitApiResult<Result>,
    _request?: NextRequest
  ): void | Promise<void> {
    // no-op
  }

  public async run<Result>(
    task?: RunWithTask<Result, IOCIdentifierMap>
  ): Promise<NextKitApiResult<Result>> {
    if (this.nextRequest) {
      await this.serverContext.changeState({ request: this.nextRequest });
    }

    const result = await this.execNoError(task);

    const envelope = this.resultHandler.handler<Result>(
      result,
      this.serverContext
    );

    await this.afterApiResult(envelope, this.nextRequest);

    return envelope;
  }

  protected returnJson<Result>(
    result: NextKitApiResult<Result>,
    init?: RunWithInit
  ): NextResponse {
    const contextHttpStatus = this.serverContext.getState('httpStatus');

    if (!result.success) {
      return NextResponse.json(this.getSafeApiResult(result), {
        status: contextHttpStatus ?? 400,
        headers: init?.errorHeaders
      });
    }

    return NextResponse.json(this.getSafeApiResult(result), {
      headers: init?.successHeaders
    });
  }

  public async runWithJson<Result>(
    task?: RunWithTask<Result, IOCIdentifierMap>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);
    return this.returnJson(result, init);
  }

  /**
   * Run the task and redirect when `serverContext` has `redirectUrl`;
   * otherwise return JSON.
   */
  public async runWithRedirect<Result>(
    task?: RunWithTask<Result, IOCIdentifierMap>,
    init?: RunWithInit
  ): Promise<NextResponse> {
    const result = await this.run(task);

    const contextHttpStatus = this.serverContext.getState('httpStatus');
    const redirectUrl = this.serverContext.getState('redirectUrl');

    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl, {
        status: contextHttpStatus ?? 307,
        headers: init?.errorHeaders
      });
    }

    return this.returnJson(result, init);
  }

  /**
   * Binary/image endpoints: success returns raw bytes; errors use the JSON envelope.
   */
  public async runWithBinary(
    task?: RunWithTask<BinaryApiPayload | null, IOCIdentifierMap>,
    init?: RunWithBinaryInit
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return this.returnJson(result, init);
    }

    const payload = result.data ?? null;
    if (!payload) {
      return new NextResponse(null, {
        status: 404,
        headers: {
          ...init?.notFoundHeaders,
          'Cache-Control': init?.notFoundCacheControl ?? 'public, max-age=300'
        }
      });
    }

    return new NextResponse(Buffer.from(payload.bytes), {
      status: init?.httpStatus ?? 200,
      headers: {
        'Content-Type': payload.contentType,
        'Cache-Control':
          init?.successCacheControl ??
          'public, max-age=86400, stale-while-revalidate=604800',
        ...init?.successHeaders
      }
    });
  }

  protected getSafeApiResult<T>(
    result: NextKitApiResult<T>
  ): NextKitApiResult<T> {
    return pick(result, [
      'success',
      'id',
      'requestId',
      'message',
      'data'
    ]) as NextKitApiSuccess<T>;
  }
}

export function isApiServerContext(
  value: unknown
): value is Partial<ApiServerContext> {
  return isPlainObject(value);
}
