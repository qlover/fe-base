import type { RequestLogRow } from '@schemas/RequestLogSchema';

/** Row shape for inserts; omit DB defaults where possible. */
export type RequestLogInsert = {
  event_category: string;
  event_type: string;
  success?: boolean;
  payload?: Record<string, unknown> | null;
};

export interface RequestLogsRepositoryInterface {
  /** Best-effort insert; must not throw to callers. */
  insertEvent(row: RequestLogInsert): Promise<void>;

  listRecentForCurrentUser(limit: number): Promise<RequestLogRow[]>;
}
