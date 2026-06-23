import {
  createIOCFunction,
  ReflectionIOCContainer,
  type IOCContainerInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
// import { BrainUserOAuthProvider } from './providers/BrainUserOAuthProvider';
import { SupabaseOAuthProvider } from './providers/SupabaseOAuthProvider';
import { ServerContext } from './utils/ServerContext';
import type { LoggerInterface } from '@qlover/logger';

type ServerIocOptions = {
  logger: LoggerInterface;
  config: SeedServerConfigInterface;
};

/**
 * Builds a fresh server IOC bound to the given logger.
 * Not a process singleton: each {@link BootstrapServer} / {@link NextApiServer}
 * instance must use the same logger for plugins and for `I.Logger` in services.
 */
export function createServerIoc(
  logger: LoggerInterface,
  config: SeedServerConfigInterface
) {
  const ioc = createIOCFunction<IOCIdentifierMapServer>(
    new ReflectionIOCContainer()
  );

  ServerIocRegister.register(ioc.implemention!, ioc, {
    logger,
    config
  });

  logger.debug('Server Ioc created');

  return ioc;
}

const ServerIocRegister: IOCRegisterInterface<
  IOCContainerInterface,
  ServerIocOptions
> = {
  register(ioc, _, options) {
    const { logger, config: serverConfig } = options!;

    ioc.bind(I.Logger, logger);
    ioc.bind(I.AppConfig, serverConfig);
    ioc.bind(I.ServerContextInterface, ioc.get(ServerContext));

    // ioc.bind(I.OAuthWrapperProviderInterface, ioc.get(BrainUserOAuthProvider));
    ioc.bind(I.OAuthWrapperProviderInterface, ioc.get(SupabaseOAuthProvider));
  }
};
