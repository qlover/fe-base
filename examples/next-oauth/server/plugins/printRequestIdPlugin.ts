import type { BootstrapServerPlugin } from '@server/interfaces/ServerInterface';

export const printRequestIdPlugin: BootstrapServerPlugin = {
  pluginName: 'print-request-id',
  onBefore({ parameters: { logger, root } }) {
    logger.info('Request id: ' + root.uuid);
  }
};
