import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import { I } from '@config/IOCIdentifier';
import type { AppConfig } from '../cases/AppConfig';
import type { DBBridgeInterface } from '../port/DBBridgeInterface';

@injectable()
export class SupabaseBridge implements DBBridgeInterface {
  protected supabase: SupabaseClient;

  constructor(@inject(I.AppConfig) appConfig: AppConfig) {
    this.supabase = createClient(
      appConfig.supabaseUrl,
      appConfig.supabaseAnonKey
    );
  }

  add(table: string, data: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  update(table: string, id: string, data: unknown): Promise<unknown> {
    throw new Error('Method not implemented.');
  }
  delete(table: string, id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async get(table: string, id?: string): Promise<unknown> {
    const res = await this.supabase.from(table).select('*').single();
    return res;
  }
}
