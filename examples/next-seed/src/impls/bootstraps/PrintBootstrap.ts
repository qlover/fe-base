import { AppConfig } from '@/impls/AppConfig';
import { browserGlobalsName } from '@config/common';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import type { SeedConfigInterface } from '@qlover/corekit-bridge/bootstrap';

export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',
  onSuccess({ parameters: { logger, ioc } }) {
    const appConfig = ioc.get<SeedConfigInterface>(AppConfig);
    logger.info(
      'bootstrap in(' +
        appConfig.env +
        ')success!\n\n' +
        `You can use \`%cwindow.${browserGlobalsName}%c\` to access the globals`,
      'color: #0ff; font-weight: bold;',
      'all: unset;'
    );
  }
};
