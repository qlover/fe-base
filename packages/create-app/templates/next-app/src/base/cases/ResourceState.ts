import { RequestState } from '@qlover/corekit-bridge';
import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type {
  ResourceQuery,
  ResourceStateInterface
} from '@qlover/corekit-bridge';

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
