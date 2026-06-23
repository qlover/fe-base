import type { BootstrapServerPlugin } from '@server/interfaces/BootstrapServerInterface';

export const nextApiServerBackstop: BootstrapServerPlugin = {
  pluginName: 'NextApiServerBackstop',
  onBefore({ parameters: { logger, root, IOC } }) {
    logger.log(`Request id: ${root.uuid} Start`);

    const appConfig = IOC('SeedConfigInterface');

    logger.log(`appConfig: ${JSON.stringify(appConfig)}`);
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
