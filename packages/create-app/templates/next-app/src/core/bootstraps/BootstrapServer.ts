import {
  Bootstrap,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type LoggerInterface
} from '@qlover/corekit-bridge';
import { I, type IOCIdentifierMapServer } from '@config/IOCIdentifier';
import { PageParams, type PageParamsType } from '@/base/cases/PageParams';
import type { ParamsHandlerInterface } from '@/base/port/ParamsHandlerInterface';
import { serverIOC } from '../serverIoc/ServerIOC';

export type BootstrapAppArgs = {
  params?: Promise<PageParamsType>;
};

export interface BootstrapServerResult {
  locale: string;
  messages: Record<string, string>;
}

export class BootstrapServer extends Bootstrap {
  protected ioc: IOCFunctionInterface<
    IOCIdentifierMapServer,
    IOCContainerInterface
  >;

  constructor() {
    const ioc = serverIOC.create();

    super({
      root: {},
      logger: ioc(I.Logger)
    });

    this.ioc = ioc;
  }

  get logger(): LoggerInterface {
    return this.ioc(I.Logger);
  }

  async main(args: BootstrapAppArgs): Promise<BootstrapServerResult> {
    const { params } = args;

    if (!params) {
      throw new Error('params is required');
    }

    const paramsHandler: ParamsHandlerInterface = new PageParams(await params);
    const locale = paramsHandler.getI18nWithNotFound();
    const messages = await paramsHandler.getI18nMessages();

    const result = { locale, messages };

    await this.exec(async () => {
      return result;
    });

    return result;
  }
}
