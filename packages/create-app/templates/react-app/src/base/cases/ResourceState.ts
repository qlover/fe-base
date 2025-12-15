import { RequestState } from '@qlover/corekit-bridge';
import type {
  ResourceQuery,
  ResourceStateInterface
} from '@qlover/corekit-bridge';

export interface PaginationInterface<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class ResourceState implements ResourceStateInterface {
  public searchParams: ResourceQuery = {
    page: 1,
    pageSize: 10,
    orderBy: 'updated_at',
    order: 1
  };
  public initState = new RequestState<unknown>();
  public listState = new RequestState<PaginationInterface<unknown>>();
}
