import {
  createIOCFunction,
  ReflectionIOCContainer,
  type IOCContainerInterface,
  type IOCFunctionInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SupabaseBridge } from './SupabaseBridge';
import type { LoggerInterface } from '@qlover/logger';

let ServerIoc: IOCFunctionInterface<
  IOCIdentifierMapServer,
  IOCContainerInterface
> | null = null;

type ServerIocOptions = {
  logger: LoggerInterface;
  config: SeedServerConfigInterface;
};

export function createServerIoc(
  logger: LoggerInterface,
  config: SeedServerConfigInterface
) {
  if (ServerIoc) {
    return ServerIoc;
  }

  ServerIoc = createIOCFunction(new ReflectionIOCContainer());
  // ServerIoc = createIOCFunction(new ReflectionIOCContainer(logger));

  ServerIocRegister.register(ServerIoc.implemention!, ServerIoc, {
    logger,
    config
  });

  logger.debug('Server Ioc created');

  return ServerIoc;
}

const ServerIocRegister: IOCRegisterInterface<
  IOCContainerInterface,
  ServerIocOptions
> = {
  register(ioc, _, options) {
    const { logger, config: serverConfig } = options!;

    ioc.bind(I.AppConfig, serverConfig);
    ioc.bind(I.Logger, logger);

    ioc.bind(I.DBBridgeInterface, ioc.get(SupabaseBridge));
  }
};
