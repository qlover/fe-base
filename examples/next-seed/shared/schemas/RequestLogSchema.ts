import { z } from 'zod';

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

export const requestLogRowSchema = z.object({
  id: z.uuid(),
  user_id: z.uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  event_category: z.string(),
  event_type: z.string(),
  success: z.boolean(),
  request_id: z.uuid().nullable(),
  payload: z.record(z.string(), z.unknown()).nullable()
});

export type RequestLogRow = z.infer<typeof requestLogRowSchema>;

export const REQUEST_LOGS_LIST_FIELDS = [
  'id',
  'user_id',
  'created_at',
  'updated_at',
  'event_category',
  'event_type',
  'success',
  'request_id',
  'payload'
] as const;

export const REQUEST_LOGS_ORDER_BY_WHITELIST = new Set<string>(
  REQUEST_LOGS_LIST_FIELDS as unknown as readonly string[]
);
