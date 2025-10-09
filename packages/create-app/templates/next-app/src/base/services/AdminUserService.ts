import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import {
  AdminPageInterface,
  type AdminPageListParams,
  AdminPageState
} from '../port/AdminPageInterface';
import { AdminUserApi } from './adminApi/AdminUserApi';
import { RequestState } from '../cases/RequestState';

@injectable()
export class AdminUserService extends AdminPageInterface<AdminPageState> {
  constructor(@inject(AdminUserApi) protected adminUserApi: AdminUserApi) {
    super(() => new AdminPageState());
  }

  override async fetchList(
    params: Partial<AdminPageListParams>
  ): Promise<PaginationInterface<unknown>> {
    this.changeListState(new RequestState(true));

    try {
      const response = await this.adminUserApi.getUserList(
        Object.assign({}, this.state.listParams, params)
      );

      if (response.data.success) {
        const paginationData = response.data
          .data as PaginationInterface<unknown>;

        this.changeListState(new RequestState(false, paginationData));

        return paginationData;
      }

      this.changeListState(
        new RequestState(false, null, response.data.message)
      );
    } catch (error) {
      this.changeListState(new RequestState(false, null, error));
    }

    return this.state.listState.result!;
  }
}
