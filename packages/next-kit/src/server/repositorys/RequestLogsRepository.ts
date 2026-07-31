import type { NextRequest } from 'next/server';
import type {
  RequestLogCreateType,
  RequestLogRow
} from '../../common/schemas/RequestLogSchema';
import type { NextKitApiResult } from '../../common/interfaces/NextKitApi';
import type { ServerContextInterface } from '../interfaces/ServerContextInterface';
import type { UserLoginContext } from '../interfaces/UserLoginContext';
import { SupabaseRepo, type SupabaseRepoDeps } from './SupabaseRepo';

const DEFAULT_TABLE = 'request_logs';

export type HttpRequestLogParams = {
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

export type RequestLogsRepositoryDeps = SupabaseRepoDeps & {
  serverContext: ServerContextInterface;
  /** @default 'request_logs' */
  tableName?: string;
};

/**
 * Shared `request_logs` writer used by API / auth audit flows.
 *
 * Apps supply Supabase clients + {@link ServerContextInterface}; table schema
 * is assumed compatible with {@link RequestLogRow}.
 */
export class RequestLogsRepository extends SupabaseRepo<RequestLogRow> {
  protected readonly serverContext: ServerContextInterface;
  protected readonly tableName: string;

  constructor(deps: RequestLogsRepositoryDeps) {
    const tableName = deps.tableName ?? DEFAULT_TABLE;
    super(tableName, deps);
    this.serverContext = deps.serverContext;
    this.tableName = tableName;
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

  public async insertWithApiResult(
    result: NextKitApiResult<unknown>,
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
    const contextHttpStatus = this.serverContext.getState('httpStatus');
    const httpStatus = success
      ? (contextHttpStatus ?? 200)
      : (contextHttpStatus ?? 400);
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

    const row = { ...data } as RequestLogRow;
    if (params.user_id) {
      row.user_id = params.user_id;
    }

    await this.insert({ data: row });

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

  /**
   * Delete all `request_logs` rows (admin client; matches unfiltered list search).
   */
  public async clearAll(): Promise<number> {
    const client = this.getAdminSupabase();
    const { error, count } = await client
      .from(this.tableName)
      .delete({ count: 'exact' })
      .not('id', 'is', null);

    this.throwIfError({ error });
    return count ?? 0;
  }
}
