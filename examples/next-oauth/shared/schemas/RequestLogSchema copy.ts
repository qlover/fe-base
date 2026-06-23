import { z } from 'zod';

/** `request_logs.record_type` for rows emitted by the demo-oauth example app. */
export const REQUEST_LOG_RECORD_TYPE_DEMO_OAUTH = 'demo-oauth';

/** Optional keys written into `payload` by server code (UI may read these). */
export type RequestLogPayload = {
  http_method?: string | null;
  http_path?: string | null;
  http_status?: number | null;
  duration_ms?: number | null;
  user_agent?: string | null;
  ip_address?: string | null;
  login_method?: string | null;
  auth_provider?: string | null;
  correlation_id?: string | null;
  device?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  [key: string]: unknown;
};

export const requestLogSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  event_category: z.string(),
  event_type: z.string(),
  success: z.boolean(),
  request_id: z.uuid().nullable(),
  record_type: z.string().nullable(),
  payload: z.record(z.string(), z.unknown()).nullable()
});

export const requestLogCreateSchema = requestLogSchema.omit({
  id: true,
  user_id: true,
  created_at: true,
  updated_at: true
});

export type RequestLogRow = z.infer<typeof requestLogSchema>;
export type RequestLogCreateType = z.infer<typeof requestLogCreateSchema>;
