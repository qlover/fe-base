import type { PostgrestSingleResponse } from '@supabase/supabase-js';

export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';
export type Where = [string, WhereOperation, string | number];

export interface BridgeEvent {
  table: string;
  fields?: string | string[];
  where?: Where[];
  data?: unknown;
}

export interface DBBridgeInterface {
  add(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>>;
  update(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>>;
  delete(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>>;
  get(event: BridgeEvent): Promise<PostgrestSingleResponse<unknown>>;
}
