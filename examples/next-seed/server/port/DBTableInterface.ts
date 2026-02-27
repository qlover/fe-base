import type { PaginationInterface } from '@shared/interfaces/PaginationInterface';
import type { BridgeOrderBy } from './DBBridgeInterface';

export interface DBTableInterface {
  readonly name: string;

  pagination<T = unknown>(params: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<T>>;
}
