import type { PaginationInterface } from '@/base/port/PaginationInterface';

export interface DBTableInterface {
  readonly name: string;

  pagination(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<unknown>>;
}
