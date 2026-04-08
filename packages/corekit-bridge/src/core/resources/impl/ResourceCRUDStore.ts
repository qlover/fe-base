import type {
  AsyncStoreOptions,
  AsyncStoreStateInterface,
  StoreUpdateValue
} from '../../store-state';
import { AsyncStore } from '../../store-state';
import { clone } from '../../store-state/clone';

export interface ResourceCRUDState<T> extends AsyncStoreStateInterface<T> {
  /**
   * Currently focused entity (detail panel, editor, or row driving follow-up update/remove actions).
   */
  readonly activeDetail?: T;
}

/**
 * Async store slice for one CRUD operation name (`create`, `detail`, `update`, or `remove` inside {@link ResourceCRUD}).
 * Extends {@link AsyncStore} with an optional {@link ResourceCRUDState.activeDetail} for edit flows.
 *
 * @since 3.1.0
 * @typeParam T - Resource payload type carried in `result` / `activeDetail`
 * @typeParam Key - Optional store key type for multi-tab or keyed UI patterns
 *
 * @example Keep the row being edited in sync with successful `detail`/`update` responses
 * ```typescript
 * const store = new ResourceCRUDStore<User>('users.detail');
 * store.subscribe((s) => console.log(s.activeDetail?.name));
 * store.setActiveDetail(userFromList);
 * store.updateActiveDetail({ name: 'Pat' }); // shallow merge into current activeDetail
 * ```
 */
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

  /**
   * Replace {@link ResourceCRUDState.activeDetail} (does not call the network).
   */
  public setActiveDetail(activeDetail: T): void {
    this.emit({ activeDetail });
  }

  /**
   * Shallow-merge a patch into the current {@link ResourceCRUDState.activeDetail}; no-op when `activeDetail` is unset.
   */
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
