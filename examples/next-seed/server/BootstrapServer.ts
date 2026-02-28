import 'reflect-metadata';
import { LifecycleExecutor } from '@qlover/fe-corekit';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import type { SeedBootstrapInterface } from '@interfaces/SeedBootstrapInterface';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import { logger } from './ServerGlobals';
import { createServerIoc } from './serverIoc';
import type {
  BootstrapServerContext,
  BootstrapServerContextOptions,
  BootstrapServerPlugin,
  ServerInterface
} from './interfaces/ServerInterface';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { ServiceIdentifier } from '@qlover/corekit-bridge/ioc';
import type { ExecutorAsyncTask, ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export class BootstrapServer
  implements SeedBootstrapInterface<BootstrapServerPlugin>, ServerInterface
{
  protected executor: LifecycleExecutor<
    BootstrapServerContext,
    BootstrapServerPlugin
  >;
  protected root: Record<string, unknown> = {};

  protected IOC: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;

  public readonly logger: LoggerInterface;

  constructor() {
    this.executor = new LifecycleExecutor();
    this.IOC = createServerIoc();
    this.logger = logger;
  }

  /**
   * @override
   * @param plugin
   * @returns
   */
  public use(
    plugin:
      | BootstrapServerPlugin
      | BootstrapServerPlugin[]
      | ((
          ioc: IOCFunctionInterface<
            IOCIdentifierMapServer,
            IOCContainerInterface
          >
        ) => BootstrapServerPlugin)
  ): this {
    if (typeof plugin === 'function') {
      plugin = plugin(this.IOC);
    }

    if (Array.isArray(plugin)) {
      plugin.forEach((p) => this.executor.use(p));
      return this;
    }

    this.executor.use(plugin);
    return this;
  }

  /**
   * @override
   */
  public execNoError<Result>(
    task?: ExecutorAsyncTask<Result, BootstrapServerContextOptions>
  ): Promise<Result | ExecutorError> {
    const options = {
      logger: this.logger,
      root: this.root,
      ioc: this.IOC.implemention!,
      IOC: this.IOC
    };

    return this.executor.execNoError(
      options,
      task ?? (() => Promise.resolve(undefined as Result))
    );
  }
  /**
   * @override
   */
  public getIOC(): IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;
  /**
   * @override
   */
  public getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  /**
   * @override
   */
  public getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  /**
   * @override
   */
  public getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier?: T
  ):
    | IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>
    | IOCIdentifierMapServer[T] {
    if (identifier === undefined) {
      return this.IOC;
    }
    return this.IOC(identifier);
  }

  /**
   * @override
   */
  public startup(): Promise<unknown> {
    return Promise.resolve(undefined);
  }

  /**
   * @override
   */
  public getPlugins(_seedConfig: SeedConfigInterface): BootstrapServerPlugin[] {
    return [];
  }
}
