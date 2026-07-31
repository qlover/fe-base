import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type {
  BootstrapPluginOptions,
  SeedConfigInterface
} from '@qlover/corekit-bridge/bootstrap';
import type {
  ExecutorError,
  ExecutorAsyncTask,
  LifecyclePluginInterface,
  ExecutorContextInterface
} from '@qlover/fe-corekit/executor';
import type { LoggerInterface } from '@qlover/logger';
import type { UserLoginContext } from './UserLoginContext';

export interface BootstrapServerRoot {
  serverName: string;
  uuid: string;
}

/**
 * Generic over the app's server IOC identifier map.
 */
export interface BootstrapServerContextOptions<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> extends BootstrapPluginOptions {
  IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
  root: BootstrapServerRoot;
  /**
   * User-agent and IP extracted server-side when constructed with `NextRequest`.
   */
  ctx?: UserLoginContext;
}

export interface BootstrapServerPlugin<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> extends LifecyclePluginInterface<
  BootstrapServerContext<IOCIdentifierMap>
> {}

export interface BootstrapServerContext<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> extends ExecutorContextInterface<
  BootstrapServerContextOptions<IOCIdentifierMap>
> {}

export interface BootstrapServerInterface<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> {
  readonly logger: LoggerInterface;

  getIOC(): IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMap>(
    identifier: T
  ): IOCIdentifierMap[T];
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;

  use(
    plugin:
      | BootstrapServerPlugin<IOCIdentifierMap>
      | BootstrapServerPlugin<IOCIdentifierMap>[]
      | ((
          ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
        ) => BootstrapServerPlugin<IOCIdentifierMap>)
  ): this;

  execNoError<Result>(
    task?: ExecutorAsyncTask<Result, unknown>
  ): Promise<Result | ExecutorError>;

  getPlugins?(
    seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin<IOCIdentifierMap>[];
}
