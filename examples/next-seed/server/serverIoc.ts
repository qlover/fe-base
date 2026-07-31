import {
  createIOCFunction,
  ReflectionIOCContainer,
  type IOCContainerInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import { SupabaseRepo } from '@qlover/next-kit/server';
import { createAdminClient, createServerClient } from '@shared/supabase/server';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SupabaseAuthProvider } from './providers/SupabaseAuthProvider';
import { ServerContext } from './utils/ServerContext';
import type { LoggerInterface } from '@qlover/logger';

type ServerIocOptions = {
  logger: LoggerInterface;
  config: SeedServerConfigInterface;
};

/**
 * 构建绑定了当前 logger 的全新 server IOC。
 * 非进程单例：每个 BootstrapServer / NextApiServer 实例应使用同一套 logger 与 I.Logger。
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

    ioc.bind(
      SupabaseRepo,
      new SupabaseRepo('', {
        logger,
        getUserClient: createServerClient,
        getAdminClient: createAdminClient
      })
    );

    ioc.bind(I.AuthProviderInterface, ioc.get(SupabaseAuthProvider));
  }
};
