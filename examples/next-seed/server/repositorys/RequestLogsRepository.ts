import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import {
  REQUEST_LOGS_LIST_FIELDS,
  REQUEST_LOGS_ORDER_BY_WHITELIST,
  type RequestLogRow
} from '@schemas/RequestLogSchema';
import type { PaginationInfo } from '@schemas/SearchResultSchema';
import type {
  RequestLogInsert,
  RequestLogsRepositoryInterface,
  RequestLogsSearchForUserParams
} from '@server/interfaces/RequestLogsRepositoryInterface';
import { BaseRepo } from './BaseRepo';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

const TABLE = 'request_logs';

const LIST_FIELDS = REQUEST_LOGS_LIST_FIELDS;

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_SORT_FIELD = 'created_at';

function clampPageSize(n: number): number {
  if (!Number.isFinite(n) || n < 1) {
    return DEFAULT_PAGE_SIZE;
  }
  return Math.min(Math.floor(n), MAX_PAGE_SIZE);
}

function resolvePageAndSize(criteria: ResourceSearchParams): PaginationInfo {
  const pageSize = clampPageSize(criteria.pageSize ?? DEFAULT_PAGE_SIZE);
  if (
    criteria.page != null &&
    Number.isFinite(criteria.page) &&
    criteria.page >= 1
  ) {
    return { page: Math.floor(criteria.page), pageSize };
  }
  if (
    criteria.offset != null &&
    Number.isFinite(criteria.offset) &&
    criteria.offset >= 0
  ) {
    const page = Math.floor(criteria.offset / pageSize) + 1;
    return { page, pageSize };
  }
  return { page: DEFAULT_PAGE, pageSize };
}

function resolveOrderBy(criteria: ResourceSearchParams): [string, 0 | 1] {
  const first = criteria.sort?.[0];
  const rawField = first?.orderBy?.trim() || DEFAULT_SORT_FIELD;
  const field = REQUEST_LOGS_ORDER_BY_WHITELIST.has(rawField)
    ? rawField
    : DEFAULT_SORT_FIELD;
  const o = first?.order;
  const ascending = typeof o === 'string' && o.toLowerCase() === 'asc';
  return [field, ascending ? 0 : 1];
}

@injectable()
export class RequestLogsRepository
  extends BaseRepo
  implements RequestLogsRepositoryInterface
{
  @inject(I.Logger)
  protected logger!: LoggerInterface;

  constructor() {
    super(TABLE);
  }

  /**
   * @override
   */
  public async insertEvent(row: RequestLogInsert): Promise<void> {
    try {
      await this.supabaseBridge.add({
        table: TABLE,
        data: {
          event_category: row.event_category,
          event_type: row.event_type,
          success: row.success ?? true,
          request_id: row.request_id ?? null,
          payload: row.payload ?? null
        }
      });
    } catch (error) {
      this.logger.warn('request_logs insert failed', error);
    }
  }

  /**
   * @override
   */
  public async searchForCurrentUser(
    criteria: RequestLogsSearchForUserParams
  ): Promise<ResourceSearchResult<RequestLogRow>> {
    const { page, pageSize } = resolvePageAndSize(criteria);
    const orderBy = resolveOrderBy(criteria);
    try {
      const result = await this.supabaseBridge.pagination({
        table: TABLE,
        fields: LIST_FIELDS.join(','),
        page,
        pageSize,
        orderBy
      });
      const items = (result.data ?? []) as RequestLogRow[];
      const total = result.count ?? items.length;
      const hasMore = page * pageSize < total;
      return {
        items,
        total,
        page,
        pageSize,
        hasMore
      };
    } catch (error) {
      this.logger.warn('request_logs search failed', error);
      return {
        items: [],
        total: 0,
        page,
        pageSize,
        hasMore: false
      };
    }
  }
}
