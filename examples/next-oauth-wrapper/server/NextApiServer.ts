import { isPlainObject, pick } from 'lodash';
import { NextResponse, type NextRequest } from 'next/server';
import type {
  AppApiMetaData,
  AppApiResult,
  AppApiSuccessInterface
} from '@interfaces/AppApiInterface';
import { BootstrapServer } from '@server/BootstrapServer';
import { RequestLogsRepository } from '@server/repositorys/RequestLogsRepository';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { ApiResultFactory } from './utils/ApiResultFactory';
import type {
  BootstrapServerContextOptions,
  BootstrapServerPlugin
} from './interfaces/ServerInterface';
import type { UserLoginContext } from './interfaces/UserServiceInterface';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ExecutorAsyncTask } from '@qlover/fe-corekit';

export type NextApiServerContext = {
  name?: string;
  nextRequest?: NextRequest;
  /**
   * @default 'api'
   */
  event_category: string;
  /**
   * @default 'http.request'
   */
  event_type: string;

  record_type?: string;
};

function isNextApiServerContext(
  value: unknown
): value is Partial<NextApiServerContext> {
  return isPlainObject(value);
}
export class NextApiServer extends BootstrapServer {
  protected context: NextApiServerContext;

  constructor(name?: string, nextRequest?: NextRequest);
  constructor(context?: Partial<NextApiServerContext>);

  constructor(
    nameOrContext?: string | Partial<NextApiServerContext>,
    nextRequest?: NextRequest
  ) {
    if (isNextApiServerContext(nameOrContext)) {
      const { name } = nameOrContext ?? {};

      super(name);
      this.context = {
        ...nameOrContext,
        event_category: 'api',
        event_type: 'http.request'
      };
    } else {
      super(nameOrContext);
      this.context = {
        name: nameOrContext,
        nextRequest,
        event_category: 'api',
        event_type: 'http.request'
      };
    }
  }

  protected getLoginContext(req: NextRequest): UserLoginContext {
    const forwarded = req.headers.get('x-forwarded-for');
    const ip =
      forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    return {
      userAgent: req.headers.get('user-agent'),
      ipAddress: ip
    };
  }

  /**
   * Adds `parameters.ctx` from {@link getLoginContext} when constructed with `NextRequest`.
   */
  protected override getContext(): BootstrapServerContextOptions {
    const base = super.getContext();
    if (this.context.nextRequest === undefined) {
      return base;
    }
    return { ...base, ctx: this.getLoginContext(this.context.nextRequest) };
  }

  protected tryLogHttpApiRequest(
    req: NextRequest,
    result: AppApiResult<unknown>,
    durationMs: number
  ): void {
    const { userAgent, ipAddress } = this.getLoginContext(req);
    const success = result.success === true;
    const httpStatus = success ? 200 : 400;
    const errorCode = success ? null : result.id;
    const errorMessage = success ? null : (result.message ?? null);
    const correlationId = result.requestId;

    void this.IOC(RequestLogsRepository).insertEvent({
      event_category: this.context.event_category,
      event_type: this.context.event_type,
      success,
      request_id: correlationId?.trim() ? correlationId : null,
      record_type: req.nextUrl.pathname,
      payload: {
        http_method: req.method,
        http_path: req.nextUrl.pathname,
        http_status: httpStatus,
        duration_ms: durationMs,
        user_agent: userAgent,
        ip_address: ipAddress,
        correlation_id: correlationId,
        error_code: errorCode,
        error_message: errorMessage
      }
    });
  }

  public async run<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >
  ): Promise<AppApiResult<Result>> {
    const started = performance.now();
    const result = await this.execNoError(task);

    const options = {
      logger: this.logger,
      config: this.IOC('SeedConfigInterface'),
      requestId: this.root.uuid
    };

    let envelope: AppApiResult<Result>;
    if (ApiResultFactory.isAppApiResult(result)) {
      envelope = result;
    } else if (result instanceof Error) {
      envelope = ApiResultFactory.createApiWithError(result, options);
    } else {
      envelope = ApiResultFactory.createApiSuccess(result, options);
    }

    if (this.context.nextRequest) {
      const durationMs = Math.round(performance.now() - started);
      this.tryLogHttpApiRequest(this.context.nextRequest, envelope, durationMs);
    }

    return envelope;
  }

  public async runWithJson<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >,
    init?: {
      successHeaders?: HeadersInit;
      errorHeaders?: HeadersInit;
    }
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return NextResponse.json(this.getSafeAppApiResult(result), {
        status: result.httpStatus ?? 400,
        headers: init?.errorHeaders
      });
    }

    return NextResponse.json(this.getSafeAppApiResult(result), {
      headers: init?.successHeaders
    });
  }

  protected getSafeAppApiResult<T>(
    result: AppApiResult<T>
  ): Omit<AppApiResult<T>, keyof AppApiMetaData> {
    return pick(result, [
      'success',
      'id',
      'requestId',
      'message',
      'data'
    ]) as AppApiSuccessInterface<T>;
  }

  public override getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
