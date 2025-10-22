import { StoreInterface } from '@qlover/corekit-bridge';
import { RequestState } from '@/base/cases/RequestState';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type { StoreStateInterface } from '@qlover/corekit-bridge';

export interface ResourceQuery {
  /**
   * @default 1
   */
  page?: number;
  /**
   * @default 10
   */
  pageSize?: number;
  orderBy?: string;
  order?: 0 | 1;
}

export class ResourceState implements StoreStateInterface {
  searchParams: ResourceQuery = {
    page: 1,
    pageSize: 10,
    orderBy: 'updated_at',
    order: 1
  };
  initState = new RequestState<unknown>();
  listState = new RequestState<PaginationInterface<unknown>>();
}

export class ResourceStore<S extends ResourceState> extends StoreInterface<S> {
  changeListState(state: RequestState<unknown>): void {
    this.emit(
      this.cloneState({
        listState: state
      } as Partial<S>)
    );
  }

  changeSearchParams(params: Partial<ResourceQuery>): void {
    this.emit(
      this.cloneState({
        searchParams: params
      } as Partial<S>)
    );
  }

  changeInitState(state: RequestState<unknown>): void {
    this.emit(
      this.cloneState({
        initState: state
      } as Partial<S>)
    );
  }
}
