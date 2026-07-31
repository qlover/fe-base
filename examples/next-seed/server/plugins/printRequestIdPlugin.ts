import type { NextSeedServerIocMap } from '@server/BootstrapServer';
import type { BootstrapServerPlugin } from '@qlover/next-kit/server';

export const printRequestIdPlugin: BootstrapServerPlugin<NextSeedServerIocMap> =
  {
    pluginName: 'print-request-id',
    onBefore({ parameters: { logger, root } }) {
      logger.info('Request id: ' + root.uuid);
    }
  };
