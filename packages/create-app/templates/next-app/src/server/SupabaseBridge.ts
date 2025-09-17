import {
  createClient,
  type PostgrestSingleResponse,
  type SupabaseClient,
  type PostgrestResponse
} from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import { I } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';
import type {
  BridgeEvent,
  DBBridgeInterface,
  Where
} from '@/base/port/DBBridgeInterface';
import type { LoggerInterface } from '@qlover/logger';
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';

const whereHandlerMaps = {
  '=': 'eq',
  '!=': 'neq',
  '>': 'gt',
  '<': 'lt',
  '>=': 'gte',
  '<=': 'lte'
};

@injectable()
export class SupabaseBridge implements DBBridgeInterface {
  protected supabase: SupabaseClient;

  constructor(
    @inject(I.AppConfig) appConfig: AppConfig,
    @inject(I.Logger) protected logger: LoggerInterface
  ) {
    this.supabase = createClient(
      appConfig.supabaseUrl,
      appConfig.supabaseAnonKey
    );
  }

  getSupabase(): SupabaseClient {
    return this.supabase;
  }

  async execSql(sql: string): Promise<PostgrestSingleResponse<unknown>> {
    const res = await this.supabase.rpc('exec_sql', { sql });
    return this.catch(res);
  }

  protected async catch(
    result: PostgrestSingleResponse<unknown>
  ): Promise<PostgrestSingleResponse<unknown>> {
    if (result.error) {
      this.logger.info(result);
      throw new Error(result.error.message);
    }
    return result;
  }

  protected handleWhere(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handler: PostgrestFilterBuilder<any, any, any, any, string, unknown, any>,
    wheres: Where[]
  ): void {
    for (const where of wheres) {
      const [key, operator, value] = where;
      const opr = whereHandlerMaps[operator];
      if (!opr) {
        throw new Error(`Unsupported where operation: ${value}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (typeof (handler as any)[opr] !== 'function') {
        throw new Error(`Unsupported where operation: ${value}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (handler as any)[opr](key, value);
    }
  }

  async add(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, data } = event;
    if (!data) {
      throw new Error('Data is required for add operation');
    }
    const res = await this.supabase
      .from(table)
      .insert(Array.isArray(data) ? data : [data])
      .select();
    return this.catch(res);
  }

  async update(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, data, where } = event;
    if (!data) {
      throw new Error('Data is required for update operation');
    }

    const handler = this.supabase.from(table).update(data);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  async delete(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, where } = event;
    const handler = this.supabase.from(table).delete();

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  async get(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, fields = '*', where } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const handler = this.supabase.from(table).select(selectFields);

    this.handleWhere(handler, where ?? []);

    return this.catch(await handler);
  }

  async pagination(event: BridgeEvent): Promise<PostgrestResponse<unknown>> {
    const { table, fields = '*', where, page = 1, pageSize = 10 } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;

    // 获取总数
    const countHandler = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    this.handleWhere(countHandler, where ?? []);
    const countResult = await this.catch(await countHandler);

    // 获取分页数据
    const handler = this.supabase
      .from(table)
      .select(selectFields)
      .range((page - 1) * pageSize, page * pageSize - 1);

    this.handleWhere(handler, where ?? []);
    const result = await this.catch(await handler);

    if (result.error) {
      return result as PostgrestResponse<unknown>;
    }

    return {
      data: Array.isArray(result.data) ? result.data : [],
      error: null,
      count: countResult.count,
      status: result.status,
      statusText: result.statusText
    };
  }
}
