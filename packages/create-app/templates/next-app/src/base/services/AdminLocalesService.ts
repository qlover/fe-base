import { inject, injectable } from 'inversify';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import {
  AdminPageInterface,
  type AdminPageListParams,
  AdminPageState
} from '../port/AdminPageInterface';
import { AdminLocalesApi } from './adminApi/AdminLocalesApi';
import { RequestState } from '../cases/RequestState';

@injectable()
export class AdminLocalesService extends AdminPageInterface<AdminPageState> {
  constructor(
    @inject(AdminLocalesApi)
    protected adminLocalesApi: AdminLocalesApi
  ) {
    super(() => new AdminPageState());
  }

  override async fetchList(
    params: Partial<AdminPageListParams>
  ): Promise<PaginationInterface<unknown>> {
    this.changeListState(new RequestState(true, this.state.listState.result));

    try {
      const response = await this.adminLocalesApi.getLocalesList(
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

  override async update(data: Partial<LocalesSchema>): Promise<void> {
    try {
      const response = await this.adminLocalesApi.updateLocales(data);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }

      // 更新本地列表数据
      const listResult = this.state.listState
        .result as PaginationInterface<LocalesSchema>;
      if (listResult && listResult.list) {
        const updatedData = listResult.list.map((item) =>
          item.id === data.id ? { ...item, ...data } : item
        );
        this.changeListState(
          new RequestState(false, { ...listResult, list: updatedData })
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
