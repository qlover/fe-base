import { LifecycleExecutor } from '@qlover/fe-corekit';
import { v4 as uuidv4 } from 'uuid';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { printRequestIdPlugin } from './plugins/printRequestIdPlugin';
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

    this.logger = createLogger(this.root.serverName, serverConfig);

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
  public execNoError<Result>(
    task?: ExecutorAsyncTask<Result, BootstrapServerContextOptions>
  ): Promise<Result | ExecutorError> {
    const options: BootstrapServerContextOptions = {
      logger: this.logger,
      root: this.root,
      ioc: this.IOC.implemention!,
      IOC: this.IOC
    };

    const plugins = this.getPlugins(this.IOC('SeedConfigInterface'));
    if (plugins.length > 0) {
      this.use(plugins);
    }

    return this.executor.execNoError(
      options,
      task ?? (() => Promise.resolve(undefined as Result))
    );
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
  public startup<Result>(
    task?: ExecutorAsyncTask<Result, BootstrapServerContextOptions>
  ): Promise<Result | ExecutorError> {
    return this.execNoError(task);
  }

  /**
   * @override
   */
  public getPlugins(_seedConfig: SeedConfigInterface): BootstrapServerPlugin[] {
    return [printRequestIdPlugin];
  }
}
