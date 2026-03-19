import { LifecycleExecutor } from '@qlover/fe-corekit';
import {
  ConsoleHandler,
  Logger,
  TimestampFormatter,
  type LoggerInterface,
  type TimestampFormatterOptions
} from '@qlover/logger';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { ServerConfig } from './ServerConfig';
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
import type {
  SeedConfigInterface,
  BootstrapInterface
} from '@qlover/corekit-bridge/bootstrap';
import type { ServiceIdentifier } from '@qlover/corekit-bridge/ioc';
import type { ExecutorAsyncTask, ExecutorError } from '@qlover/fe-corekit';

function createLogger(name: string, level: string): LoggerInterface {
  const formater = new TimestampFormatter({
    prefixTemplate: '[({loggerName}) {formattedTimestamp} {level}]',
    localeOptions:
      // 本地电脑的时间格式
      Intl.DateTimeFormat().resolvedOptions() as TimestampFormatterOptions['localeOptions']
  });
  return new Logger({
    name: name,
    handlers: new ConsoleHandler(formater),
    silent: false,
    level: level
  });
}

export class BootstrapServer
  implements BootstrapInterface<BootstrapServerPlugin>, ServerInterface
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

  constructor(protected name: string = '') {
    this.executor = new LifecycleExecutor();
    const serverConfig = new ServerConfig();
    this.logger = createLogger(
      name || serverConfig.name,
      serverConfig.logLevel
    );
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
  public startup<Result>(
    task?: ExecutorAsyncTask<Result, BootstrapServerContextOptions>
  ): Promise<Result | ExecutorError> {
    return this.execNoError(task);
  }

  /**
   * @override
   */
  public getPlugins(_seedConfig: SeedConfigInterface): BootstrapServerPlugin[] {
    return [];
  }
}
