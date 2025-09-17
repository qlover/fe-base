import { inject, injectable } from 'inversify';
import { AdminApi } from './adminApi/AdminApi';
import type { AdminPageInterface } from '../port/AdminPageInterface';
import type { PaginationInterface } from '../port/PaginationInterface';

@injectable()
export class AdminUserService implements AdminPageInterface {
  constructor(@inject(AdminApi) protected adminApi: AdminApi) {}

  async initialize(): Promise<unknown> {
    return Promise.resolve();
  }

  async fetchList(_params: unknown): Promise<PaginationInterface<unknown>> {
    return Promise.resolve({
      list: [],
      total: 0,
      page: 1,
      pageSize: 10
    });
  }
}
