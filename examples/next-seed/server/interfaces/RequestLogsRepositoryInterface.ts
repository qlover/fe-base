import type { RequestLogRow } from '@schemas/RequestLogSchema';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';

/** Row shape for inserts; omit DB defaults where possible. */
export type RequestLogInsert = {
  event_category: string;
  event_type: string;
  success?: boolean;
  /** API/request correlation id when known (e.g. AppApiResult.requestId). */
  request_id?: string | null;
  payload?: Record<string, unknown> | null;
};

/**
 * Request logs list criteria; same portable shape as {@link ResourceSearchParams}.
 * Server applies defaults and maps `sort` / `page` / `offset` to the DB layer.
 */
export type RequestLogsSearchForUserParams = ResourceSearchParams;

export interface RequestLogsRepositoryInterface {
  /** Best-effort insert; must not throw to callers. */
  insertEvent(row: RequestLogInsert): Promise<void>;

  searchForCurrentUser(
    params: RequestLogsSearchForUserParams
  ): Promise<ResourceSearchResult<RequestLogRow>>;
}
