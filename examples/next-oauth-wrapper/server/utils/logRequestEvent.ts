import { REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH } from '@schemas/RequestLogSchema';
import type { BootstrapServer } from '@server/BootstrapServer';
import { RequestLogsRepository } from '@server/repositorys/RequestLogsRepository';
import type { NextRequest } from 'next/server';

export type LogRequestEventInput = {
  event_category: string;
  event_type: string;
  success: boolean;
  http_method?: string;
  http_path?: string;
  http_status?: number;
  duration_ms?: number;
  request_id?: string | null;
  payload?: Record<string, unknown> | null;
};

function clientIp(req: NextRequest): string | null {
  const forwarded = req.headers.get('x-forwarded-for');
  return (
    forwarded?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null
  );
}

/**
 * Best-effort OAuth / protocol endpoint log with {@link REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH}.
 */
export function logRequestEvent(
  server: BootstrapServer,
  req: NextRequest,
  input: LogRequestEventInput
): void {
  const requestId = input.request_id?.trim() ? input.request_id : null;
  const httpPath = input.http_path ?? req.nextUrl.pathname;

  void server
    .getIOC()(RequestLogsRepository)
    .insertEvent({
      event_category: input.event_category,
      event_type: input.event_type,
      success: input.success,
      request_id: requestId,
      record_type: REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH,
      payload: {
        http_method: input.http_method ?? req.method,
        http_path: httpPath,
        http_status: input.http_status ?? null,
        duration_ms: input.duration_ms ?? null,
        user_agent: req.headers.get('user-agent'),
        ip_address: clientIp(req),
        correlation_id: requestId,
        ...input.payload
      }
    });
}
