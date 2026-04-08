import type {
  GatewayServiceName,
  GatewayServiceOptions
} from '../../gateway-service/impl/GatewayService';
import { GatewayService } from '../../gateway-service/impl/GatewayService';
import type { AsyncStoreState, StoreInterface } from '../../store-state';
import type { ResourceSearchParams } from '../interfaces/ResourceSearchInterface';
import type {
  ResourceInResult,
  ResourceIOInterface,
  ResourceOutResult
} from '../interfaces/ResourceIOInterface';
import type { ResourceCRUDState } from './ResourceCRUDStore';
import { ResourceCRUDStore } from './ResourceCRUDStore';

/** Operation key for {@link ResourceIO} store selection (`importData` | `exportData`). */
export type IOResourceName = 'importData' | 'exportData';

export type ResourceIOIdentifiers = {
  INVALID_IMPORT_RESULT: string;
  INVALID_EXPORT_RESULT: string;
};

const defaultIdentifiers: ResourceIOIdentifiers = {
  INVALID_IMPORT_RESULT: 'Invalid import result',
  INVALID_EXPORT_RESULT: 'Invalid export result'
};

function createDefaultIOStoreFactory(
  resourceBaseName: GatewayServiceName,
  defaultImportState?: () => ResourceCRUDState<ResourceInResult> | null,
  defaultExportState?: () => ResourceCRUDState<ResourceOutResult> | null
): (
  name: IOResourceName
) => ResourceCRUDStore<ResourceInResult> | ResourceCRUDStore<ResourceOutResult> {
  return (name) => {
    if (name === 'importData') {
      return new ResourceCRUDStore<ResourceInResult>(
        `${String(resourceBaseName)}.${name}`,
        { defaultState: defaultImportState }
      );
    }
    return new ResourceCRUDStore<ResourceOutResult>(
      `${String(resourceBaseName)}.${name}`,
      { defaultState: defaultExportState }
    );
  };
}

export type ResourceIOOptions<
  TPayload,
  TCriteria extends ResourceSearchParams
> = Omit<
  GatewayServiceOptions<
    ResourceInResult,
    ResourceIOInterface<TPayload, TCriteria>
  >,
  'store'
> & {
  /**
   * Custom factory for per-operation stores. Defaults to namespaced {@link ResourceCRUDStore} instances per
   * `importData` / `exportData`.
   */
  createStoreFactory?: (
    name: IOResourceName
  ) =>
    | ResourceCRUDStore<ResourceInResult>
    | ResourceCRUDStore<ResourceOutResult>;

  /** Seed the import store’s async state (loading defaults, etc.). */
  defaultImportState?: () => ResourceCRUDState<ResourceInResult> | null;

  /** Seed the export store’s async state. */
  defaultExportState?: () => ResourceCRUDState<ResourceOutResult> | null;

  /**
   * When set, successful **import** responses are validated before `store.success`; invalid bodies reject like bad payloads.
   */
  isImportResult?: (value: unknown) => value is ResourceInResult;

  /**
   * When set, successful **export** responses are validated before `store.success`; invalid bodies reject like bad payloads.
   */
  isExportResult?: (value: unknown) => value is ResourceOutResult;

  identifiers?: ResourceIOIdentifiers;
};

/**
 * Wraps a {@link ResourceIOInterface} implementation with async store state per operation (`importData`, `exportData`).
 *
 * @typeParam TPayload - Import input type (same as {@link ResourceIOInterface})
 * @typeParam TCriteria - Export scope; extends {@link ResourceSearchParams}
 *
 * @since `3.1.0`
 *
 * @example Subscribe to import / export loading state
 * ```typescript
 * const io = new ResourceIO(productGateway, { serviceName: 'products.io' });
 * io.getStoreInterface('importData').subscribe((s) => console.log(s.loading));
 * await io.importData(formData);
 * ```
 */
export class ResourceIO<
  TPayload,
  TCriteria extends ResourceSearchParams = ResourceSearchParams
>
  extends GatewayService<
    ResourceInResult,
    ResourceCRUDStore<ResourceInResult>,
    ResourceIOInterface<TPayload, TCriteria>
  >
  implements ResourceIOInterface<TPayload, TCriteria>
{
  protected readonly identifiers: ResourceIOIdentifiers;
  protected readonly storeMap: {
    importData: ResourceCRUDStore<ResourceInResult>;
    exportData: ResourceCRUDStore<ResourceOutResult>;
  };

  private readonly isImportResult:
    | ((value: unknown) => value is ResourceInResult)
    | undefined;
  private readonly isExportResult:
    | ((value: unknown) => value is ResourceOutResult)
    | undefined;

  /**
   * @param resource - Bare {@link ResourceIOInterface} implementation
   * @param options - `serviceName`, logger, custom stores, optional response guards, etc.
   */
  constructor(
    resource: ResourceIOInterface<TPayload, TCriteria>,
    options?: Partial<ResourceIOOptions<TPayload, TCriteria>>
  ) {
    if (!resource) {
      throw new Error(
        'ResourceIO requires a resource; pass a resource to the constructor.'
      );
    }
    const serviceName = options?.serviceName ?? 'resourceIO';
    const factory =
      options?.createStoreFactory ??
      createDefaultIOStoreFactory(
        serviceName,
        options?.defaultImportState,
        options?.defaultExportState
      );
    const storeMap = {
      importData: factory('importData') as ResourceCRUDStore<ResourceInResult>,
      exportData: factory('exportData') as ResourceCRUDStore<ResourceOutResult>
    };

    super({
      serviceName,
      gateway: resource,
      logger: options?.logger,
      store: storeMap.importData
    });

    this.identifiers = { ...defaultIdentifiers, ...options?.identifiers };
    this.storeMap = storeMap;
    this.isImportResult = options?.isImportResult;
    this.isExportResult = options?.isExportResult;
  }

  /**
   * @override
   *
   * @param name - Which operation’s store to return; defaults to `'importData'` (matches the primary {@link GatewayService} store)
   */
  public override getStore(
    name: IOResourceName = 'importData'
  ):
    | ResourceCRUDStore<ResourceInResult>
    | ResourceCRUDStore<ResourceOutResult> {
    return this.storeMap[name];
  }

  /**
   * Subscribe-friendly view of async state for the given operation.
   *
   * @param name - `'importData'` | `'exportData'`; defaults to `'importData'`
   */
  public getStoreInterface(
    name: IOResourceName = 'importData'
  ):
    | StoreInterface<AsyncStoreState<ResourceInResult>>
    | StoreInterface<AsyncStoreState<ResourceOutResult>> {
    return this.getStore(name).getStore();
  }

  /**
   * @override
   *
   * Runs {@link ResourceIOInterface.importData} and updates the `importData` store (`start` → `success` / `failed`).
   */
  public importData(source: TPayload): Promise<ResourceInResult> {
    const store = this.getStore('importData');
    store.start();

    return this.gateway!.importData(source)
      .then((result) => {
        if (this.isImportResult && !this.isImportResult(result)) {
          throw new Error(this.identifiers.INVALID_IMPORT_RESULT, {
            cause: result
          });
        }
        store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} importData success`,
          result
        );
        return result;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(
          `${String(this.serviceName)} importData failed`,
          error
        );
        throw error;
      });
  }

  /**
   * @override
   *
   * Runs {@link ResourceIOInterface.exportData} and updates the `exportData` store (`start` → `success` / `failed`).
   */
  public exportData(scope: TCriteria): Promise<ResourceOutResult> {
    const store = this.getStore('exportData');
    store.start();

    return this.gateway!.exportData(scope)
      .then((result) => {
        if (this.isExportResult && !this.isExportResult(result)) {
          throw new Error(this.identifiers.INVALID_EXPORT_RESULT, {
            cause: result
          });
        }
        store.success(result);
        this.logger?.debug(
          `${String(this.serviceName)} exportData success`,
          result
        );
        return result;
      })
      .catch((error) => {
        store.failed(error);
        this.logger?.debug(
          `${String(this.serviceName)} exportData failed`,
          error
        );
        throw error;
      });
  }
}
