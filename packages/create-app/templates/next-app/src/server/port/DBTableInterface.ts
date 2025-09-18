import type { PaginationInterface } from '@/base/port/PaginationInterface';

export interface DBTableInterface {
  readonly name: string;

  pagination<T = unknown>(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<T>>;
}
