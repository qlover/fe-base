import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { RequestLogRow } from '@schemas/RequestLogSchema';
import type {
  RequestLogInsert,
  RequestLogsRepositoryInterface
} from '@server/interfaces/RequestLogsRepositoryInterface';
import { BaseRepo } from './BaseRepo';
import type { LoggerInterface } from '@qlover/logger';

const TABLE = 'request_logs';

const LIST_FIELDS = [
  'id',
  'user_id',
  'created_at',
  'updated_at',
  'event_category',
  'event_type',
  'success',
  'payload'
] as const;

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
  public async listRecentForCurrentUser(
    limit: number
  ): Promise<RequestLogRow[]> {
    try {
      const result = await this.supabaseBridge.pagination({
        table: TABLE,
        fields: LIST_FIELDS.join(','),
        page: 1,
        pageSize: limit,
        orderBy: ['created_at', 1]
      });
      return (result.data ?? []) as RequestLogRow[];
    } catch (error) {
      this.logger.warn('request_logs list failed', error);
      return [];
    }
  }
}
