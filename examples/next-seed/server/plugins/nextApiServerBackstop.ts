import type { NextSeedServerIocMap } from '@server/BootstrapServer';
import type { BootstrapServerPlugin } from '@qlover/next-kit/server';

export const nextApiServerBackstop: BootstrapServerPlugin<NextSeedServerIocMap> =
  {
    pluginName: 'NextApiServerBackstop',
    onBefore({ parameters: { logger, root, IOC } }) {
      logger.log(`Request id: ${root.uuid} Start`);

      const appConfig = IOC('SeedConfigInterface');

      logger.log(
        `Running in ${appConfig.env} mode, logging level: ${appConfig.logLevel}`
      );
    },

    onError(ctx) {
      const {
        parameters: { logger, root },
        error
      } = ctx;

      logger.error(`Request id: ${root.uuid}`, error);
    },

    onSuccess({ parameters: { logger, root } }) {
      logger.log(`Request id: ${root.uuid} Success`);
    }
  };
