import type { PaginationInterface } from '@/server/port/PaginationInterface';
import type {
  ResourceQuery,
  ResourceState,
  ResourceStore
} from './ResourcesStore';

export interface ResourceInterface<
  T,
  Store extends ResourceStore<ResourceState> = ResourceStore<ResourceState>
> {
  getStore(): Store;

  search(params: Partial<ResourceQuery>): Promise<PaginationInterface<T>>;

  refresh(): Promise<unknown>;

  update(data: T): Promise<unknown>;

  create(data: T): Promise<unknown>;

  remove(data: T): Promise<unknown>;
}
