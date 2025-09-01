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
import { serverIOC } from '../serverIoc/ServerIOC';

export interface BootstrapServerResult {
  locale: string;
  messages: Record<string, string>;
}

export interface BootstrapServerContextValue extends BootstrapContextValue {
  locale: string;
  messages: Record<string, string>;
}

export class BootstrapServer extends AsyncExecutor {
  protected ioc: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;
  protected root: Record<string, unknown>;
  protected logger: LoggerInterface;
  protected paramsHandler: ParamsHandlerInterface;

  constructor(params: PageParamsType) {
    super();

    const ioc = serverIOC.create();
    const root = {};
    const logger = ioc(I.Logger);

    this.paramsHandler = new PageParams(params);
    this.root = root;
    this.ioc = ioc;
    this.logger = logger;
  }

  override use(
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
      plugin = plugin(this.ioc);
    }

    super.use(plugin as ExecutorPlugin<unknown>);
    return this;
  }

  getContext(): BootstrapContextValue {
    return {
      ioc: this.ioc,
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
      await this.exec(newContext, () => Promise.resolve(newContext));
    } catch (error) {
      if (errorHandler) {
        await errorHandler(error, newContext);
      }
    }

    return newContext;
  }
}
