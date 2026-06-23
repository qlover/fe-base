import type { BootstrapServerPlugin } from '@server/interfaces/BootstrapServerInterface';

export const printRequestIdPlugin: BootstrapServerPlugin = {
  pluginName: 'print-request-id',
  onBefore({ parameters: { logger, root } }) {
    logger.info('Request id: ' + root.uuid);
  }
};
