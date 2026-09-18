import {
  createIOCFunction,
  ReflectionIOCContainer,
  type IOCContainerInterface,
  type IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';
import { RequestLogsRepository, SupabaseRepo } from '@qlover/next-kit/server';
import { createAdminClient, createServerClient } from '@shared/supabase/server';
import { oauthUpstreamProviders } from '@config/common';
import { FeTables } from '@config/feTables';
import type { IOCIdentifierMapServer } from '@config/ioc-identifiter';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { BrainUserOAuthProvider } from './providers/BrainUserOAuthProvider';
import { SupabaseOAuthProvider } from './providers/SupabaseOAuthProvider';
import { FeSupabaseRepo } from './repositorys/FeSupabaseRepo';
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

    const supabaseDeps = {
      logger,
      getUserClient: createServerClient,
      getAdminClient: createAdminClient
    };

    // Same instance for both tokens so `@inject(SupabaseRepo)` also gets
    // FeSupabaseRepo throwIfError remap (Auth / non-builder paths).
    const feSupabaseRepo = new FeSupabaseRepo('', supabaseDeps);
    ioc.bind(FeSupabaseRepo, feSupabaseRepo);
    ioc.bind(SupabaseRepo, feSupabaseRepo);
    ioc.bind(
      RequestLogsRepository,
      new RequestLogsRepository({
        ...supabaseDeps,
        serverContext: ioc.get(I.ServerContextInterface),
        tableName: FeTables.requestLogs
      })
    );

    // 默认路径与历史 next-oauth 一致：SupabaseOAuthProvider。
    // 仅当 NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER=brain-user 时启用 BrainUser。
    if (
      serverConfig.oauthUpstreamProvider === oauthUpstreamProviders.brainUser
    ) {
      ioc.bind(
        I.OAuthWrapperProviderInterface,
        ioc.get(BrainUserOAuthProvider)
      );
    } else {
      ioc.bind(I.OAuthWrapperProviderInterface, ioc.get(SupabaseOAuthProvider));
    }
  }
};
