import {
  BootstrapServer as KitBootstrapServer,
  createLogger
} from '@qlover/next-kit/server';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { ServerConfig } from './ServerConfig';
import { createServerIoc } from './serverIoc';

/**
 * Kit generics require `Record<PropertyKey, unknown>`; intersect so the
 * app's concrete IOC map is usable as the type parameter.
 */
export type NextSeedServerIocMap = IOCIdentifierMapServer &
  Record<PropertyKey, unknown>;

export class BootstrapServer extends KitBootstrapServer<NextSeedServerIocMap> {
  constructor(name?: string) {
    const serverConfig = new ServerConfig();
    const serverName = name ?? serverConfig.name;
    const logger = createLogger(serverName, serverConfig);
    const ioc = createServerIoc(logger, serverConfig);

    super({
      name: serverName,
      logger,
      ioc
    });
  }
}
