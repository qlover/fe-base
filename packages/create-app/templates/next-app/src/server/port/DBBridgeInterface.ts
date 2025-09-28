export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';
export type Where = [string, WhereOperation, string | number];

export interface BridgeEvent {
  table: string;
  fields?: string | string[];
  where?: Where[];
  data?: unknown;
  page?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  total: number;
  page: number;
  pageSize: number;
}

export interface DBBridgeResponse<T> {
  error?: unknown;
  data: T;
  pagination?: PaginationInfo;
}

export interface DBBridgeInterface {
  add(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  update(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  delete(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  get(event: BridgeEvent): Promise<DBBridgeResponse<unknown>>;
  pagination(event: BridgeEvent): Promise<DBBridgeResponse<unknown[]>>;
}
