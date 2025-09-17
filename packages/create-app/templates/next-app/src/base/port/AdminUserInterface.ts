import { StoreInterface } from '@qlover/corekit-bridge';
import type { AdminPageInterface } from './AdminPageInterface';
import type { PaginationInterface } from './PaginationInterface';
import type { RequestState } from '../cases/RequestState';

export interface AdminUserListParams {
  page: number;
  pageSize: number;
}

export interface AdminUserState {
  listParams: AdminUserListParams;
  initStatus: RequestState<unknown>;
  listStatus: RequestState<PaginationInterface<unknown>>;
}

export abstract class AdminUserInterface
  extends StoreInterface<AdminUserState>
  implements AdminPageInterface
{
  initialize(): Promise<unknown> {
    return this.fetchList(this.state.listParams);
  }

  async fetchList(
    params: AdminUserListParams
  ): Promise<PaginationInterface<unknown>> {
    return Promise.resolve({
      list: [],
      total: 0,
      page: params.page,
      pageSize: params.pageSize
    });
  }
}
