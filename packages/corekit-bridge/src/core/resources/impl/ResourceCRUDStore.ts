import type {
  AsyncStoreOptions,
  AsyncStoreStateInterface,
  StoreUpdateValue
} from '../../store-state';
import { AsyncStore } from '../../store-state';
import { clone } from '../../store-state/clone';

export interface ResourceCRUDState<T> extends AsyncStoreStateInterface<T> {
  /**
   * 当前活动的详情, 可用于编辑/删除/保存等操作
   */
  readonly activeDetail?: T;
}

export class ResourceCRUDStore<T, Key = string> extends AsyncStore<
  ResourceCRUDState<T>,
  Key
> {
  constructor(
    public readonly resourceName: string,
    options?: AsyncStoreOptions<ResourceCRUDState<T>, Key>
  ) {
    super(options);
  }

  public setActiveDetail(activeDetail: T): void {
    this.emit({ activeDetail });
  }

  public updateActiveDetail(activeDetail: StoreUpdateValue<T>): void {
    const currentActiveDetail = this.getState().activeDetail;

    if (currentActiveDetail == null) {
      return;
    }

    this.emit({
      activeDetail: Object.assign(clone(currentActiveDetail), activeDetail)
    });
  }
}
