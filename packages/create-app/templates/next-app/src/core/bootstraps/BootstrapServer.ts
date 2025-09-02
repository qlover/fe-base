import {
  type BootstrapContextValue,
  type BootstrapExecutorPlugin,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type LoggerInterface
} from '@qlover/corekit-bridge';
import { AsyncExecutor, type ExecutorPlugin } from '@qlover/fe-corekit';
import { I, type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import { PageParams, type PageParamsType } from '@/base/cases/PageParams';
import type { ParamsHandlerInterface } from '@/base/port/ParamsHandlerInterface';
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

export class BootstrapServer implements ServerInterface {
  protected executor: AsyncExecutor;
  protected root: Record<string, unknown> = {};
  protected IOC: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;
  protected logger: LoggerInterface;
  protected paramsHandler: ParamsHandlerInterface;

  constructor(params: PageParamsType) {
    const serverIOC = new ServerIOC();
    const ioc = serverIOC.create();
    const logger = ioc(I.Logger);

    this.executor = new AsyncExecutor();
    this.paramsHandler = new PageParams(params);
    this.IOC = ioc;
    this.logger = logger;
  }

  getIOC(): IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>;
  getIOC<T extends keyof IOCIdentifierMapServer>(
    identifier: T
  ): IOCIdentifierMapServer[T];
  getIOC(
    identifier?: keyof IOCIdentifierMapServer
  ):
    | IOCFunctionInterface<IOCIdentifierMapServer, IOCContainerInterface>
    | IOCIdentifierMapServer[keyof IOCIdentifierMapServer] {
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

  getContext(): BootstrapContextValue {
    return {
      ioc: this.IOC,
      root: this.root,
      logger: this.logger
    };
  }

  async main(
    errorHandler?: (
      error: unknown,
      context: BootstrapServerContextValue
    ) => Promise<void>
  ): Promise<BootstrapServerResult> {
    const locale = this.paramsHandler.getI18nWithNotFound();
    const messages = await this.paramsHandler.getI18nMessages();
    const ctx = { locale, messages };
    const context = this.getContext();
    const newContext = Object.assign(context, ctx);

    try {
      await this.executor.exec(newContext, () => Promise.resolve(newContext));
    } catch (error) {
      if (errorHandler) {
        await errorHandler(error, newContext);
      }
    }

    return newContext;
  }
}
