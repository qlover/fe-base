import {
  type ServiceIdentifier,
  type BootstrapContextValue,
  type BootstrapExecutorPlugin,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type LoggerInterface
} from '@qlover/corekit-bridge';
import {
  AsyncExecutor,
  type ExecutorError,
  type PromiseTask,
  type ExecutorPlugin
} from '@qlover/fe-corekit';
import { I, type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import type { ServerInterface } from '@/base/port/ServerInterface';
import { ServerIOC } from '../serverIoc/ServerIOC';

export interface BootstrapServerResult {
  locale: string;
  messages: Record<string, string>;
}

export interface BootstrapServerContextValue extends BootstrapContextValue {
  locale: string;
  messages: Record<string, string>;
}

interface BootstrapServerContext {
  logger: LoggerInterface;
  root: Record<string, unknown>;
  IOC: IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
}

export class BootstrapServer implements ServerInterface {
  protected executor: AsyncExecutor;
  protected root: Record<string, unknown> = {};
  protected IOC: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;
  readonly logger: LoggerInterface;

  constructor() {
    const serverIOC = ServerIOC.create();
    const ioc = serverIOC.create();
    const logger = ioc(I.Logger);

    this.executor = new AsyncExecutor();
    this.IOC = ioc;
    this.logger = logger;
  }

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  getIOC<T>(serviceIdentifier: ServiceIdentifier<T>): T;
  getIOC<T extends keyof IOCIdentifierMapServer>(
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
  use(
    plugin:
      | BootstrapExecutorPlugin
      | BootstrapExecutorPlugin[]
      | ((
          ioc: IOCFunctionInterface<
            IOCIdentifierMapServer,
            IOCContainerInterface
          >
        ) => BootstrapExecutorPlugin)
  ): this {
    if (typeof plugin === 'function') {
      plugin = plugin(this.IOC);
    }

    this.executor.use(plugin as ExecutorPlugin<unknown>);
    return this;
  }

  execNoError<Result>(
    task?: PromiseTask<Result, BootstrapServerContext>
  ): Promise<Result | ExecutorError> {
    const context = {
      logger: this.logger,
      root: this.root,
      IOC: this.IOC
    };

    return this.executor.execNoError(context, task);
  }
}
