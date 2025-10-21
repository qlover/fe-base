import { StoreInterface } from '@qlover/corekit-bridge';
import { RequestState } from '../cases/RequestState';
import type { PaginationInterface } from '../../server/port/PaginationInterface';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export interface AdminPageListParams {
  page: number;
  pageSize: number;
  orderBy?: string;
  order?: 0 | 1;
}

export class AdminPageState implements StoreStateInterface {
  listParams: AdminPageListParams = {
    page: 1,
    pageSize: 10,
    orderBy: 'updated_at',
    order: 1
  };
  initState = new RequestState<unknown>();
  listState = new RequestState<PaginationInterface<unknown>>();
}

export abstract class AdminPageInterface<
  S extends AdminPageState
> extends StoreInterface<S> {
  /**
   * 初始化
   * @returns
   */
  async initialize(): Promise<unknown> {
    this.emit(
      this.cloneState({
        initState: new RequestState(true)
      } as Partial<S>)
    );

    try {
      const result = await this.fetchList(this.state.listParams);

      this.emit(
        this.cloneState({
          initState: new RequestState(false, result).end()
        } as Partial<S>)
      );
      return result;
    } catch (error) {
      this.emit(
        this.cloneState({
          initState: new RequestState(false, null, error).end()
        } as Partial<S>)
      );

      return error;
    }
  }

  /**
   * 销毁
   */
  destroy(): void {
    this.reset();
  }

  /**
   * 获取列表
   * @param params
   * @returns
   */
  abstract fetchList(
    params: Partial<AdminPageListParams>
  ): Promise<PaginationInterface<unknown>>;

  changeListState(state: RequestState<unknown>): void {
    this.emit(
      this.cloneState({
        listState: state
      } as Partial<S>)
    );
  }

  changeListParams(params: Partial<AdminPageListParams>): void {
    this.emit(
      this.cloneState({
        listParams: params
      } as Partial<S>)
    );

    this.fetchList(this.state.listParams);
  }

  abstract update(data: Partial<unknown>): Promise<void>;
}
