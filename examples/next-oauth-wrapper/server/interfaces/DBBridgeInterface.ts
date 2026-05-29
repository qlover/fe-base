import type { PaginationParams } from '@schemas/SearchResultSchema';
import type { DBTablePaginationParams } from './DBTableInterface';

export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';
export type Where = [string, WhereOperation, string | number];

export interface BridgeEvent extends Partial<DBTablePaginationParams> {
  table: string;
  fields?: string | string[];
  where?: Where[];
  data?: unknown;
}

export type BridgeOrderBy = [string, 0 | 1]; // 0: asc, 1: desc

export interface DBBridgeResponse<T> {
  error?: unknown;
  data: T;
  count?: number;
  pagination?: PaginationParams;
}

export interface DBBridgeInterface {
  add(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  update(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  upsert(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  delete(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  get(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>>;
}
