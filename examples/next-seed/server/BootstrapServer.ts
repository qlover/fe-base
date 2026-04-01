import { LifecycleExecutor } from '@qlover/fe-corekit';
import { v4 as uuidv4 } from 'uuid';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { ServerConfig } from './ServerConfig';
import { createServerIoc } from './serverIoc';
import { createLogger } from './utils/createLogger';
import type {
  BootstrapServerContext,
  BootstrapServerContextOptions,
  BootstrapServerPlugin,
  BootstrapServerRoot,
  ServerInterface
} from './interfaces/ServerInterface';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type {
  SeedConfigInterface,
  BootstrapInterface
} from '@qlover/corekit-bridge/bootstrap';
import type { ServiceIdentifier } from '@qlover/corekit-bridge/ioc';
import type { ExecutorAsyncTask, ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';

type BootstrapServerIOC = IOCFunctionInterface<
  IOCIdentifierMapServer,
  IOCContainerInterface
>;

export class BootstrapServer
  implements BootstrapInterface<BootstrapServerPlugin>, ServerInterface
{
  protected readonly executor: LifecycleExecutor<
    BootstrapServerContext,
    BootstrapServerPlugin
  >;
  protected readonly root: BootstrapServerRoot;

  protected readonly IOC: BootstrapServerIOC;

  public readonly logger: LoggerInterface;

  constructor(name?: string) {
    const serverConfig = new ServerConfig();
    const serverName = name ?? serverConfig.name;

    this.root = {
      uuid: uuidv4(),
      serverName: serverName
    };

    this.executor = new LifecycleExecutor();

    this.logger = createLogger(serverName, serverConfig);

    this.IOC = createServerIoc(this.logger, serverConfig);
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
      | ((ioc: BootstrapServerIOC) => BootstrapServerPlugin)
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
    task?: ExecutorAsyncTask<TaskReturn, BootstrapServerContextOptions>
  ): Promise<Handled | ExecutorError> {
    const options = this.getContext();

    const plugins = this.getPlugins(this.IOC('SeedConfigInterface'));
    if (plugins.length > 0) {
      this.use(plugins);
    }

    // Inner executor is typed with task return R = TaskReturn; we map to Handled
    // after user task via taskHandler, then assert the promise for callers.
    return this.executor.execNoError<TaskReturn, BootstrapServerContextOptions>(
      options,
      async (ctx) => {
        const result = await task?.(ctx);

        if (result === undefined) {
          return undefined as TaskReturn;
        }

        return this.taskHandler<TaskReturn, Handled>(
          result
        ) as unknown as TaskReturn;
      }
    ) as Promise<Handled | ExecutorError>;
  }

  /**
   * Initial executor parameters. Subclasses may extend (e.g. add `ctx` on {@link NextApiServer}).
   */
  protected getContext(): BootstrapServerContextOptions {
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
  public getIOC(): BootstrapServerIOC;
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
  ): BootstrapServerIOC | IOCIdentifierMapServer[T] {
    if (identifier === undefined) {
      return this.IOC;
    }
    return this.IOC(identifier);
  }

  /**
   * @override
   */
  public startup<TaskReturn, Handled = TaskReturn>(
    task?: ExecutorAsyncTask<TaskReturn, BootstrapServerContextOptions>
  ): Promise<Handled | ExecutorError> {
    return this.execNoError(task);
  }

  /**
   * @override
   */
  public getPlugins(_seedConfig: SeedConfigInterface): BootstrapServerPlugin[] {
    return [];
  }
}
