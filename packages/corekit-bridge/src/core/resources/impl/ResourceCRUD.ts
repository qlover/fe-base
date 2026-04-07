import type { AsyncStoreState, StoreInterface } from '../../store-state';
import type {
  RefType,
  ResourceCRUDInterface,
  ResourceGatewayOptions
} from '../interfaces/ResourceCRUDInterface';
import { ResourceCRUDStore } from './ResourceCRUDStore';

type DetailArgs<S> = [RefType | S, ResourceGatewayOptions?];

type UpdateArgs<S> =
  | [RefType, S, ResourceGatewayOptions?]
  | [S, ResourceGatewayOptions?];

type RemoveArgs<S> =
  | [RefType, ResourceGatewayOptions?]
  | [S, ResourceGatewayOptions?]
  | [readonly RefType[], ResourceGatewayOptions?]
  | [readonly S[], ResourceGatewayOptions?];

function createDefaultStoreFactory<T>(
  resourceBaseName: string
): (name: CRUDResourceName) => ResourceCRUDStore<T> {
  return (name) => new ResourceCRUDStore<T>(`${resourceBaseName}.${name}`);
}

export type CRUDResourceName = 'create' | 'detail' | 'update' | 'remove';

/**
 * Wraps a {@link ResourceCRUDInterface} implementation with async store state for UI binding.
 */
export class ResourceCRUD<T, S = T> implements ResourceCRUDInterface<T, S> {
  protected readonly storeMap: Record<CRUDResourceName, ResourceCRUDStore<T>>;

  constructor(
    protected readonly resourceName: string,
    protected readonly resource: ResourceCRUDInterface<T, S>,
    createStoreFactory?: (name: CRUDResourceName) => ResourceCRUDStore<T>
  ) {
    const factory =
      createStoreFactory ?? createDefaultStoreFactory<T>(this.resourceName);
    this.storeMap = {
      create: factory('create'),
      detail: factory('detail'),
      update: factory('update'),
      remove: factory('remove')
    };
  }

  public getStore(name: CRUDResourceName): ResourceCRUDStore<T> {
    return this.storeMap[name];
  }

  /**
   * For binding CRUD async state in UI layers.
   */
  public getStoreInterface(
    name: CRUDResourceName
  ): StoreInterface<AsyncStoreState<T>> {
    return this.getStore(name).getStore();
  }

  /** For mutations that return a resource body (`create`, `detail`, `update`). */
  protected runWithAsyncStoreResult(
    store: ResourceCRUDStore<T>,
    promise: Promise<T>
  ): Promise<T> {
    store.start();

    return promise
      .then((result) => {
        store.success(result);
        return result;
      })
      .catch((error) => {
        store.failed(error);
        throw error;
      });
  }

  /** For `remove` (`Promise<void>`); does not treat a resolved value as missing data. */
  protected runWithAsyncStoreVoid(
    store: ResourceCRUDStore<T>,
    promise: Promise<void>
  ): Promise<void> {
    store.start();

    return promise
      .then(() => {
        store.success(null);
      })
      .catch((error) => {
        store.failed(error);
        throw error;
      });
  }

  /**
   * @override
   */
  public create(payload: T | S, options?: ResourceGatewayOptions): Promise<T> {
    return this.runWithAsyncStoreResult(
      this.getStore('create'),
      this.resource.create(payload, options)
    );
  }

  /**
   * @override
   */
  public detail(ref: RefType, options?: ResourceGatewayOptions): Promise<T>;
  /**
   * @override
   */
  public detail(snapshot: S, options?: ResourceGatewayOptions): Promise<T>;
  /**
   * @override
   */
  public detail(
    snapshotOrRef: RefType | S,
    options?: ResourceGatewayOptions
  ): Promise<T> {
    const detail = this.resource.detail as (
      ...args: DetailArgs<S>
    ) => Promise<T>;

    return this.runWithAsyncStoreResult(
      this.getStore('detail'),
      detail.call(this.resource, snapshotOrRef, options)
    );
  }

  /**
   * @override
   */
  public update(
    ref: RefType,
    payload: S,
    options?: ResourceGatewayOptions
  ): Promise<T>;
  /**
   * @override
   */
  public update(snapshot: S, options?: ResourceGatewayOptions): Promise<T>;
  /**
   * @override
   */
  public update(...args: UpdateArgs<S>): Promise<T> {
    const update = this.resource.update as (
      ...a: UpdateArgs<S>
    ) => Promise<T>;

    return this.runWithAsyncStoreResult(
      this.getStore('update'),
      update.call(this.resource, ...args)
    );
  }

  /**
   * @override
   */
  public remove(ref: RefType, options?: ResourceGatewayOptions): Promise<void>;
  /**
   * @override
   */
  public remove(snapshot: S, options?: ResourceGatewayOptions): Promise<void>;
  /**
   * @override
   */
  public remove(
    refs: readonly RefType[],
    options?: ResourceGatewayOptions
  ): Promise<void>;
  /**
   * @override
   */
  public remove(
    snapshots: readonly S[],
    options?: ResourceGatewayOptions
  ): Promise<void>;
  /**
   * @override
   */
  public remove(...args: RemoveArgs<S>): Promise<void> {
    const remove = this.resource.remove as (
      ...a: RemoveArgs<S>
    ) => Promise<void>;

    return this.runWithAsyncStoreVoid(
      this.getStore('remove'),
      remove.call(this.resource, ...args)
    );
  }
}
