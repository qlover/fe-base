import {
  ApiServer,
  createLogger,
  isApiServerContext,
  type ApiServerContext,
  type BootstrapServerPlugin
} from '@qlover/next-kit/server';
import { type NextRequest } from 'next/server';
import { I } from '@config/ioc-identifiter';
import { nextApiServerBackstop } from './plugins/nextApiServerBackstop';
import { ServerConfig } from './ServerConfig';
import { createServerIoc } from './serverIoc';
import type { NextSeedServerIocMap } from './BootstrapServer';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';
import type { ServerContextInterface } from '@qlover/next-kit/server';

export type NextApiServerContext = ApiServerContext;

/**
 * App Next.js API server: wires ServerConfig + IOC, resolves ServerContext,
 * and registers nextApiServerBackstop.
 */
export class NextApiServer extends ApiServer<NextSeedServerIocMap> {
  constructor(name?: string, nextRequest?: NextRequest);
  constructor(context?: Partial<NextApiServerContext>);

  constructor(
    nameOrContext?: string | Partial<NextApiServerContext>,
    nextRequest?: NextRequest
  ) {
    const serverConfig = new ServerConfig();

    if (isApiServerContext(nameOrContext)) {
      const name = nameOrContext.name ?? serverConfig.name;
      const logger = createLogger(name, serverConfig);
      const ioc = createServerIoc(logger, serverConfig);

      super({
        name,
        logger,
        ioc,
        nextRequest: nameOrContext.nextRequest,
        event_type: nameOrContext.event_type ?? 'http.request'
      });
      return;
    }

    const name = nameOrContext ?? serverConfig.name;
    const logger = createLogger(name, serverConfig);
    const ioc = createServerIoc(logger, serverConfig);

    super({
      name,
      logger,
      ioc,
      nextRequest,
      event_type: 'http.request'
    });
  }

  /**
   * @override
   */
  protected resolveServerContext(): ServerContextInterface {
    return this.IOC(I.ServerContextInterface);
  }

  public getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapServerPlugin<NextSeedServerIocMap>[] {
    const plugins = super.getPlugins(_seedConfig);
    return [...plugins, nextApiServerBackstop];
  }
}
