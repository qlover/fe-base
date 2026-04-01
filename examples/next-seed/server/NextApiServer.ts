import { NextResponse, type NextRequest } from 'next/server';
import type { AppApiResult } from '@interfaces/AppApiInterface';
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

export class NextApiServer extends BootstrapServer {
  private readonly nextRequest?: NextRequest;

  /**
   * @param name Optional server name (logging / IOC scope).
   * @param nextRequest When set, {@link run} / {@link runWithJson} record one `request_logs` row per invocation.
   */
  constructor(name?: string, nextRequest?: NextRequest) {
    super(name);
    this.nextRequest = nextRequest;
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
    if (this.nextRequest === undefined) {
      return base;
    }
    return { ...base, ctx: this.getLoginContext(this.nextRequest) };
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
      event_category: 'api',
      event_type: 'http.request',
      success,
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

    if (this.nextRequest) {
      const durationMs = Math.round(performance.now() - started);
      this.tryLogHttpApiRequest(this.nextRequest, envelope, durationMs);
    }

    return envelope;
  }

  public async runWithJson<Result>(
    task?: ExecutorAsyncTask<
      Result | AppApiResult<Result>,
      BootstrapServerContextOptions
    >
  ): Promise<NextResponse> {
    const result = await this.run(task);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  }

  public override getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
