import { NextRequest } from 'next/server';
import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import {
  RequestLogCreateType,
  type RequestLogRow
} from '@schemas/RequestLogSchema';
import { AppApiResult } from '@interfaces/AppApiInterface';
import type { ServerContextInterface } from '@server/interfaces/ServerContextInterface';
import { UserLoginContext } from '@server/interfaces/UserServiceInterface';
import { SupabaseRepo } from './SupabaseRepo';
import type { LoggerInterface } from '@qlover/logger';

const TABLE = 'request_logs';

export type HttpReqeustLogParams = {
  http_method: string;
  http_path: string;
  http_status: number;
  duration_ms: number;
  user_agent: string;
  ip_address: string;
  correlation_id: string;
  error_code: string | null;
  error_message: string | null;
};

@injectable()
export class RequestLogsRepository extends SupabaseRepo<RequestLogRow> {
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  @inject(I.ServerContextInterface)
  protected serverContext!: ServerContextInterface;

  constructor() {
    super(TABLE);
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
   * api 请求日志包含以下内容:
   *
   * @param params
   * @returns
   */
  public async insertWithApiResult(
    result: AppApiResult<unknown>,
    params: {
      request: NextRequest;
      user_id?: string;
    }
  ): Promise<RequestLogCreateType> {
    const { request } = params;
    const durationMs = Math.round(
      performance.now() - this.serverContext.getState('started')
    );
    const { userAgent, ipAddress } = this.getLoginContext(request);
    const success = result.success === true;
    const httpStatus = success ? 200 : 400;
    const errorCode = success ? null : result.id;
    const errorMessage = success ? null : (result.message ?? null);
    const correlationId = result.requestId;

    const data: RequestLogCreateType = {
      event_category: 'api',
      event_type: this.serverContext.getState('event_type') || '_default.type',
      success,
      request_id: correlationId?.trim() ? correlationId : null,
      record_type: request.nextUrl.pathname,
      payload: {
        http_method: request.method,
        http_path: request.nextUrl.pathname,
        http_status: httpStatus,
        duration_ms: durationMs,
        user_agent: userAgent,
        ip_address: ipAddress,
        correlation_id: correlationId,
        error_code: errorCode,
        error_message: errorMessage
      }
    };

    if (params.user_id) {
      (data as RequestLogRow).user_id = params.user_id;
    }

    await this.insert({ data: data as RequestLogRow });

    return data;
  }

  public async insertWithAuth(
    params: UserLoginContext & {
      auth_provider: string;
      event_type: string;
      user_id?: string;
      login_method?: string;
    }
  ): Promise<void> {
    const data: RequestLogCreateType = {
      event_category: 'auth',
      event_type: params.event_type,
      success: true,
      request_id: this.serverContext.getState('uid'),
      record_type: 'auth',
      payload: {
        auth_provider: params.auth_provider,
        user_agent: params.userAgent,
        ip_address: params.ipAddress,
        login_method: params.login_method
      }
    };

    await this.insert({
      data: data as RequestLogRow
    });
  }
}
