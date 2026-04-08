import type {
  GatewayServiceName,
  GatewayServiceOptions
} from '../../gateway-service/impl/GatewayService';
import { GatewayService } from '../../gateway-service/impl/GatewayService';
import type { AsyncStoreState, StoreInterface } from '../../store-state';
import type {
  RefType,
  ResourceCRUDInterface,
  ResourceGatewayOptions
} from '../interfaces/ResourceCRUDInterface';
import type { ResourceCRUDState } from './ResourceCRUDStore';
import { ResourceCRUDStore } from './ResourceCRUDStore';

type UpdateArgs<S> =
  | [RefType, S, ResourceGatewayOptions?]
  | [S, ResourceGatewayOptions?];

type RemoveArgs<S> =
  | [RefType, ResourceGatewayOptions?]
  | [S, ResourceGatewayOptions?]
  | [readonly RefType[], ResourceGatewayOptions?]
  | [readonly S[], ResourceGatewayOptions?];

function createDefaultStoreFactory<T>(
  resourceBaseName: GatewayServiceName,
  defaultState?: () => ResourceCRUDState<T> | null
): (name: CRUDResourceName) => ResourceCRUDStore<T> {
  return (name) =>
    new ResourceCRUDStore<T>(`${String(resourceBaseName)}.${name}`, {
      defaultState
    });
}
export type CRUDResourceName = 'create' | 'detail' | 'update' | 'remove';

export type ResourceCRUDOptions<T, S = T> = Omit<
  GatewayServiceOptions<T, ResourceCRUDInterface<T, S>>,
  'store'
> & {
  /**
   * Custom factory for per-operation stores (`create`, `detail`, `update`, `remove`). Defaults to namespaced
   * {@link ResourceCRUDStore} instances derived from `serviceName`.
   */
  createStoreFactory?: (name: CRUDResourceName) => ResourceCRUDStore<T>;

  /**
   * Seed each new store with async state from this factory (loading flag, `activeDetail`, etc.).
   */
  defaultState?: () => ResourceCRUDState<T> | null;

  /**
   * Optional guard on successful **response bodies** for {@link ResourceCRUD.create} and {@link ResourceCRUD.detail}
   * (full resource {@link T}, not the {@link Snapshot} DTO). When set, invalid payloads reject before `store.success`.
   *
   * @example
   * ```typescript
   * isResourceResult: (v): v is User =>
   *   typeof v === 'object' && v !== null && typeof (v as User).id === 'string';
   * ```
   */
  isResourceResult?: (value: unknown) => value is T;

  identifiers?: ResourceCRUDIdentifiers;
};

export type ResourceCRUDIdentifiers = {
  INVALIDE_RESOURCE: string;
};

const defaultIdentifiers: ResourceCRUDIdentifiers = {
  INVALIDE_RESOURCE: 'Invalid Resource'
};

/**
 * Wraps a {@link ResourceCRUDInterface} implementation with async store state for UI binding.
 *
 * Each operation (`create`, `detail`, `update`, `remove`) drives its own {@link ResourceCRUDStore}: `start` before the
 * gateway call, `success` / `failed` after. Use {@link getStore} or {@link getStoreInterface} to subscribe from components.
 *
 * @since 3.1.0
 * @typeParam T - Persisted resource shape returned by the API
 * @typeParam Snapshot - DTO / row / locator shape for overloads (defaults to {@link T})
 *
 * @example Wire a gateway and read loading state from the detail store
 * ```typescript
 * const users = new ResourceCRUD(userGateway, {
 *   serviceName: 'users',
 *   isResourceResult: (v): v is User => isUserDTO(v)
 * });
 * const detailStore = users.getStoreInterface('detail');
 * await users.detail('42');
 * ```
 */
export class ResourceCRUD<T, Snapshot = T>
  extends GatewayService<
    T,
    ResourceCRUDStore<T>,
    ResourceCRUDInterface<T, Snapshot>
  >
  implements ResourceCRUDInterface<T, Snapshot>
{
  protected readonly identifiers: {
    INVALIDE_RESOURCE: string;
  };
  protected readonly storeMap: Record<CRUDResourceName, ResourceCRUDStore<T>>;

  private readonly isResourceResult:
    | ((value: unknown) => value is T)
    | undefined;

  /**
   * @param resource - Bare {@link ResourceCRUDInterface} implementation (HTTP, RPC, mock, …)
   * @param options - `serviceName`, logging, custom stores, {@link ResourceCRUDOptions.isResourceResult}, etc.
   */
  constructor(
    resource: ResourceCRUDInterface<T, Snapshot>,
    options?: Partial<ResourceCRUDOptions<T, Snapshot>>
  ) {
    if (!resource) {
      throw new Error(
        'ResourceCRUD requires a resource; pass a resource to the constructor.'
      );
    }
    const serviceName = options?.serviceName ?? 'resourceCRUD';
    const factory =
      options?.createStoreFactory ??
      createDefaultStoreFactory<T>(serviceName, options?.defaultState);
    const storeMap = {
      create: factory('create'),
      detail: factory('detail'),
      update: factory('update'),
      remove: factory('remove')
    };

    super({
      serviceName: serviceName,
      gateway: resource,
      logger: options?.logger,
      store: storeMap.create
    });

    this.identifiers = {
      ...defaultIdentifiers,
      ...options?.identifiers
    };
    this.storeMap = storeMap;
    this.isResourceResult = options?.isResourceResult;
  }

  /**
   * @override
   * @param name - Which operation’s store to return; defaults to `'create'`
   * @returns The {@link ResourceCRUDStore} backing that operation
   */
  public getStore(name: CRUDResourceName = 'create'): ResourceCRUDStore<T> {
    return this.storeMap[name];
  }

  /**
   * Subscribe-friendly view of async state for the given operation (same underlying store as {@link getStore}).
   *
   * @param name - `'create' | 'detail' | 'update' | 'remove'`
   */
  public getStoreInterface(
    name: CRUDResourceName
  ): StoreInterface<AsyncStoreState<T>> {
    return this.getStore(name).getStore();
  }

  /**
   * @override
   * @param payload - Create body ({@link Snapshot} DTO or full {@link T} when shapes align)
   * @param options - Per-call gateway options (e.g. `signal` from {@link ResourceGatewayOptions})
   * @returns Persisted resource from the gateway
   */
  public create(
    payload: T | Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<T> {
    const store = this.getStore('create');

    store.start();

    return this.gateway!.create(payload, options)
      .then((result) => {
        if (this.isResourceResult && !this.isResourceResult(result)) {
          throw new Error(this.identifiers.INVALIDE_RESOURCE, {
            cause: result
          });
        }

        store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} create success,`,
          result
        );

        return result;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(`${String(this.serviceName)} create failed,`, error);
        throw error;
      });
  }

  /**
   * Fetches one resource and updates the `'detail'` async store (`start` → `success` / `failed`).
   *
   * @override
   * @param snapshotOrRef - Scalar id/slug or snapshot/locator per {@link ResourceCRUDInterface}
   * @param options - Per-call gateway options (e.g. abort `signal`)
   */
  public detail(ref: RefType, options?: ResourceGatewayOptions): Promise<T>;
  /**
   * @override
   */
  public detail(
    snapshot: Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<T>;
  /**
   * @override
   */
  public detail(
    snapshotOrRef: RefType | Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<T> {
    const store = this.getStore('detail');

    store.start();

    return this.gateway!.detail(snapshotOrRef as RefType, options)
      .then((result) => {
        if (this.isResourceResult && !this.isResourceResult(result)) {
          throw new Error(this.identifiers.INVALIDE_RESOURCE, {
            cause: result
          });
        }
        store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} detail success,`,
          result
        );
        return result;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(`${String(this.serviceName)} detail failed,`, error);
        throw error;
      });
  }

  /**
   * @override
   */
  public update(
    ref: RefType,
    payload: Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<T>;
  /**
   * @override
   */
  public update(
    snapshot: Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<T>;
  /**
   * Forwards to the inner gateway’s overloads; updates the `'update'` store’s async state.

   * @override
      */
  public update(...args: UpdateArgs<Snapshot>): Promise<T> {
    const store = this.getStore('update');

    store.start();

    return this.gateway!.update(
      args[0] as RefType,
      args[1] as Snapshot,
      args[2] as ResourceGatewayOptions
    )
      .then((result) => {
        if (this.isResourceResult && !this.isResourceResult(result)) {
          throw new Error(this.identifiers.INVALIDE_RESOURCE, {
            cause: result
          });
        }
        store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} update success,`,
          result
        );
        return result;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(`${String(this.serviceName)} update failed,`, error);
        throw error;
      });
  }

  /**
   * @override
   */
  public remove(ref: RefType, options?: ResourceGatewayOptions): Promise<void>;
  /**
   * @override
   */
  public remove(
    snapshot: Snapshot,
    options?: ResourceGatewayOptions
  ): Promise<void>;
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
    snapshots: readonly Snapshot[],
    options?: ResourceGatewayOptions
  ): Promise<void>;
  /**
   * On success commits `null` into the `'remove'` store via `success(null)` (void operation).

   * @override
      */
  public remove(...args: RemoveArgs<Snapshot>): Promise<void> {
    const store = this.getStore('remove');

    store.start();

    return this.gateway!.remove(
      args[0] as RefType,
      args[1] as ResourceGatewayOptions
    )
      .then(() => {
        store.success(null);
        this.logger?.debug(`${String(this.serviceName)} remove success`);
        return;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(`${String(this.serviceName)} remove failed`, error);
        throw error;
      });
  }
}
