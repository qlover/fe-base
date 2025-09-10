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
  DBBridgeInterface
} from '@/base/port/DBBridgeInterface';

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

  async add(event: BridgeEvent): Promise<unknown> {
    const { table, data } = event;
    if (!data) {
      throw new Error('Data is required for add operation');
    }
    const res = await this.supabase.from(table).insert(data).select().single();
    return this.catch(res);
  }
  async update(event: BridgeEvent): Promise<unknown> {
    const { table, id, data } = event;
    if (!id) {
      throw new Error('ID is required for update operation');
    }
    if (!data) {
      throw new Error('Data is required for update operation');
    }
    const res = await this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
    return this.catch(res);
  }
  async delete(event: BridgeEvent): Promise<void> {
    const { table, id } = event;
    if (!id) {
      throw new Error('ID is required for delete operation');
    }
    await this.supabase.from(table).delete().eq('id', id);
  }
  async get(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>> {
    const { table, fields = '*' } = event;
    const selectFields = Array.isArray(fields) ? fields.join(',') : fields;
    const res = await this.supabase.from(table).select(selectFields).single();
    return this.catch(res);
  }
}
