import 'reflect-metadata';
import { LifecycleExecutor } from '@qlover/fe-corekit';
import type { ServerInterface } from '@/server/port/ServerInterface';
import { I, type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import { ServerIOC } from '../serverIoc/ServerIOC';
import type {
  ServiceIdentifier,
  IOCContainerInterface,
  IOCFunctionInterface,
  BootstrapPluginOptions
} from '@qlover/corekit-bridge';
import type {
  ExecutorError,
  ExecutorAsyncTask,
  ExecutorContextInterface,
  LifecyclePluginInterface
} from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

export interface BootstrapServerContextOptions extends BootstrapPluginOptions {
  IOC: IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
}

export interface BootstrapServerPlugin extends LifecyclePluginInterface<BootstrapServerContext> {}

export interface BootstrapServerContext extends ExecutorContextInterface<BootstrapServerContextOptions> {}

export class BootstrapServer implements ServerInterface {
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
    const serverIOC = ServerIOC.create();
    const ioc = serverIOC.create();
    const logger = ioc(I.Logger);

    this.executor = new LifecycleExecutor();
    this.IOC = ioc;
    this.logger = logger;
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
}

export const bootstrapServer = new BootstrapServer();
