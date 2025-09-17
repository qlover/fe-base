import { inject, injectable } from 'inversify';
import {
  AdminPageInterface,
  type AdminPageListParams,
  AdminPageState
} from '../port/AdminPageInterface';
import { AdminUserApi } from './adminApi/AdminUserApi';
import type { PaginationInterface } from '../port/PaginationInterface';

@injectable()
export class AdminUserService extends AdminPageInterface<AdminPageState> {
  constructor(@inject(AdminUserApi) protected adminUserApi: AdminUserApi) {
    super(() => new AdminPageState());
  }

  override async fetchList(
    params: Partial<AdminPageListParams>
  ): Promise<PaginationInterface<unknown>> {
    return this.adminUserApi.getUserList(
      Object.assign({}, this.state.listParams, params)
    );
  }
}
