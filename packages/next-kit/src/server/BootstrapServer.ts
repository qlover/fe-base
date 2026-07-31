import { LifecycleExecutor } from '@qlover/fe-corekit/executor';
import { v4 as uuidv4 } from 'uuid';
import type {
  BootstrapServerContext,
  BootstrapServerContextOptions,
  BootstrapServerPlugin,
  BootstrapServerRoot,
  BootstrapServerInterface
} from './interfaces/BootstrapServerInterface';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type {
  SeedConfigInterface,
  BootstrapInterface
} from '@qlover/corekit-bridge/bootstrap';
import type { ServiceIdentifier } from '@qlover/corekit-bridge/ioc';
import type {
  ExecutorAsyncTask,
  ExecutorError
} from '@qlover/fe-corekit/executor';
import type { LoggerInterface } from '@qlover/logger';

export type BootstrapServerDeps<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
> = {
  /** Logical server / API name. */
  name: string;
  logger: LoggerInterface;
  ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
};

type BootstrapServerIOC<
  IOCIdentifierMap extends Record<PropertyKey, unknown>
> = IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;

/**
 * Server bootstrap executor. Apps supply logger + IOC (from their ServerConfig /
 * serverIoc); this class does not construct app-specific config.
 */
export class BootstrapServer<
  IOCIdentifierMap extends Record<PropertyKey, unknown> = Record<
    PropertyKey,
    unknown
  >
>
  implements
    BootstrapInterface<BootstrapServerPlugin<IOCIdentifierMap>>,
    BootstrapServerInterface<IOCIdentifierMap>
{
  protected readonly executor: LifecycleExecutor<
    BootstrapServerContext<IOCIdentifierMap>,
    BootstrapServerPlugin<IOCIdentifierMap>
  >;
  protected readonly root: BootstrapServerRoot;
  protected readonly IOC: BootstrapServerIOC<IOCIdentifierMap>;
  public readonly logger: LoggerInterface;

  public get requestId(): string {
    return this.root.uuid;
  }

  constructor(deps: BootstrapServerDeps<IOCIdentifierMap>) {
    this.root = {
      uuid: uuidv4(),
      serverName: deps.name
    };
    this.executor = new LifecycleExecutor();
    this.logger = deps.logger;
    this.IOC = deps.ioc;
  }

  /**
   * @override
   */
  public use(
    plugin:
      | BootstrapServerPlugin<IOCIdentifierMap>
      | BootstrapServerPlugin<IOCIdentifierMap>[]
      | ((
          ioc: BootstrapServerIOC<IOCIdentifierMap>
        ) => BootstrapServerPlugin<IOCIdentifierMap>)
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
  public execNoError<TaskReturn, Handled = TaskReturn>(
    task?: ExecutorAsyncTask<
      TaskReturn,
      BootstrapServerContextOptions<IOCIdentifierMap>
    >
  ): Promise<Handled | ExecutorError> {
    const options = this.getContext();

    const seedConfig = this.IOC(
      'SeedConfigInterface' as never
    ) as SeedConfigInterface;
    const plugins = this.getPlugins(seedConfig);
    if (plugins.length > 0) {
      this.use(plugins);
    }

    return this.executor.execNoError<
      TaskReturn,
      BootstrapServerContextOptions<IOCIdentifierMap>
    >(options, async (ctx) => {
      const result = await task?.(ctx);

      if (result === undefined) {
        return undefined as TaskReturn;
      }

      return this.taskHandler<TaskReturn, Handled>(
        result
      ) as unknown as TaskReturn;
    }) as Promise<Handled | ExecutorError>;
  }

  protected getContext(): BootstrapServerContextOptions<IOCIdentifierMap> {
    return {
      logger: this.logger,
      root: this.root,
      ioc: this.IOC.implemention!,
      IOC: this.IOC
    };
  }

  protected taskHandler<TaskReturn, Handled = TaskReturn>(
    result: TaskReturn
  ): Handled {
    return result as unknown as Handled;
  }

  /**
   * @override
   */
  public getIOC(): BootstrapServerIOC<IOCIdentifierMap>;
  /**
   * @override
   */
  public getIOC<T extends keyof IOCIdentifierMap>(
    identifier: T
  ): IOCIdentifierMap[T];
  /**
   * @override
   */
  public getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  /**
   * @override
   */
  public getIOC<T extends keyof IOCIdentifierMap>(
    identifier?: T
  ): BootstrapServerIOC<IOCIdentifierMap> | IOCIdentifierMap[T] {
    if (identifier === undefined) {
      return this.IOC;
    }
    return this.IOC(identifier);
  }

  /**
   * @override
   */
  public startup<TaskReturn, Handled = TaskReturn>(
    task?: ExecutorAsyncTask<
      TaskReturn,
      BootstrapServerContextOptions<IOCIdentifierMap>
    >
  ): Promise<Handled | ExecutorError> {
    return this.execNoError(task);
  }

  /**
   * @override
   */
  public getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin<IOCIdentifierMap>[] {
    return [];
  }
}
