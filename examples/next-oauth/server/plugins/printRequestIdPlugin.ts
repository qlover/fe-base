import type { NextOAuthServerIocMap } from '@server/BootstrapServer';
import type { BootstrapServerPlugin } from '@qlover/next-kit/server';

export const printRequestIdPlugin: BootstrapServerPlugin<NextOAuthServerIocMap> =
  {
    pluginName: 'print-request-id',
    onBefore({ parameters: { logger, root } }) {
      logger.info('Request id: ' + root.uuid);
    }
  };
