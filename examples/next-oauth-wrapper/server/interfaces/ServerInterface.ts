import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import type { UserLoginContext } from '@server/interfaces/UserServiceInterface';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface,
  BootstrapPluginOptions
} from '@qlover/corekit-bridge';
import type {
  ExecutorError,
  ExecutorAsyncTask,
  LifecyclePluginInterface,
  ExecutorContextInterface
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export interface BootstrapServerRoot {
  /**
   * server name
   */
  serverName: string;

  /**
   * server uuid
   */
  uuid: string;
}

export interface BootstrapServerContextOptions extends BootstrapPluginOptions {
  IOC: IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  root: BootstrapServerRoot;
  /**
   * User-agent and IP extracted server-side (`loginContextFromRequest`) when NextApiServer is constructed with `NextRequest`.
   */
  ctx?: UserLoginContext;
}

export interface BootstrapServerPlugin extends LifecyclePluginInterface<BootstrapServerContext> {}

export interface BootstrapServerContext extends ExecutorContextInterface<BootstrapServerContextOptions> {}

export interface ServerInterface {
  readonly logger: LoggerInterface;

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;

  use(
    plugin:
      | BootstrapServerPlugin
      | BootstrapServerPlugin[]
      | ((
          ioc: IOCFunctionInterface<
            IOCIdentifierMapServer,
            IOCContainerInterface
          >
        ) => BootstrapServerPlugin)
  ): this;

  execNoError<Result>(
    task?: ExecutorAsyncTask<Result, unknown>
  ): Promise<Result | ExecutorError>;
}
