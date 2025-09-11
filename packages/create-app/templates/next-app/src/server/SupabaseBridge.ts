import {
  createClient,
  type PostgrestSingleResponse,
  type SupabaseClient
} from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import { I } from '@config/IOCIdentifier';
import type { AppConfig } from '@/base/cases/AppConfig';
import type {
  BridgeEvent,
  DBBridgeInterface,
  Where
} from '@/base/port/DBBridgeInterface';
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

  constructor(@inject(I.AppConfig) appConfig: AppConfig) {
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
    const res = await this.supabase.from(table).insert(data).select().single();
    return this.catch(res);
  }

  async update(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, data, where } = event;
    if (!data) {
      throw new Error('Data is required for update operation');
    }

    const handler = this.supabase.from(table).update(data);

    this.handleWhere(handler, where ?? []);

    const result = await handler.single();

    return this.catch(result);
  }

  async delete(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, where } = event;
    const handler = this.supabase.from(table).delete();

    this.handleWhere(handler, where ?? []);

    const result = await handler;

    return this.catch(result);
  }

  async get(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, fields = '*', where } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const handler = this.supabase.from(table).select(selectFields);

    this.handleWhere(handler, where ?? []);

    const result = await handler.single();

    return this.catch(result);
  }
}
