import {
  RequestState,
  type ResourceStore,
  type ResourceStateInterface,
  type ResourceServiceInterface,
  type ResourceInterface,
  type ResourceQuery
} from '@qlover/corekit-bridge';
import type { AppApiResponse } from '@/base/services/appApi/AppApiRequester';
import type { PaginationInterface } from '@/server/port/PaginationInterface';

export class ResourceService<
  T,
  Store extends
    ResourceStore<ResourceStateInterface> = ResourceStore<ResourceStateInterface>
> implements ResourceServiceInterface<T>
{
  readonly unionKey: string = 'id';

  constructor(
    readonly serviceName: string,
    readonly store: Store,
    readonly resourceApi: ResourceInterface<T>
  ) {}

  getStore(): Store {
    return this.store;
  }

  /**
   * @override
   */
  async created(): Promise<unknown> {
    this.store.changeInitState(new RequestState(true));

    try {
      const result = await this.search(this.store.state.searchParams);

      this.store.changeInitState(new RequestState(false, result).end());
      return result;
    } catch (error) {
      this.store.changeInitState(new RequestState(false, null, error).end());

      return error;
    }
  }

  /**
   * @override
   */
  destroyed(): void {
    this.store.reset();
  }

  /**
   * @override
   */
  updated(): void {}

  async search(
    params: Partial<ResourceQuery>
  ): Promise<PaginationInterface<T>> {
    this.store.changeListState(
      new RequestState(true, this.store.state.listState.result)
    );

    try {
      const response = (await this.resourceApi.search(
        Object.assign({}, this.store.state.searchParams, params)
      )) as AppApiResponse<ResourceQuery, PaginationInterface<T>>;

      if (response.data.success) {
        const resultData = response.data.data as PaginationInterface<T>;
        this.store.changeListState(new RequestState(false, resultData).end());
        return resultData;
      }

      this.store.changeListState(
        new RequestState(false, null, response.data.message).end()
      );
    } catch (error) {
      this.store.changeListState(new RequestState(false, null, error).end());
    }

    return this.store.state.listState.result! as PaginationInterface<T>;
  }

  refresh(): Promise<unknown> {
    return this.search(this.store.state.searchParams);
  }

  async update(data: Partial<T>): Promise<unknown> {
    const result = await this.resourceApi.update(data);

    // 更新本地列表数据
    const listResult = this.store.state.listState
      .result as PaginationInterface<T>;
    if (listResult && listResult.list) {
      const updatedData = listResult.list.map((item) =>
        (item as Record<string, unknown>)[this.unionKey] ===
        (data as Record<string, unknown>)[this.unionKey]
          ? { ...item, ...data }
          : item
      );
      this.store.changeListState(
        new RequestState(false, { ...listResult, list: updatedData })
      );
    }

    return result;
  }

  create(data: T): Promise<unknown> {
    return this.resourceApi.create(data);
  }
  remove(data: T): Promise<unknown> {
    return this.resourceApi.remove(data);
  }
  export(data: T): Promise<unknown> {
    return this.resourceApi.export(data);
  }
}
