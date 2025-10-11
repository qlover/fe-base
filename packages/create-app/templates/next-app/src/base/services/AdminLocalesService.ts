import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import {
  AdminPageInterface,
  type AdminPageListParams,
  AdminPageState
} from '../port/AdminPageInterface';
import { AdminUserApi } from './adminApi/AdminUserApi';

@injectable()
export class AdminLocalesService extends AdminPageInterface<AdminPageState> {
  constructor() {
    super(() => new AdminPageState());
  }

  override async fetchList(
    params: Partial<AdminPageListParams>
  ): Promise<PaginationInterface<unknown>> {
    return {
      list: [],
      total: 0,
      page: 1,
      pageSize: 10
    };
  }
}
