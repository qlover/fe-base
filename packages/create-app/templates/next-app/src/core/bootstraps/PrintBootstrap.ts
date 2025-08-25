import { browserGlobalsName } from '@config/common';
import { AppConfig } from '@/base/cases/AppConfig';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',
  onSuccess({ parameters: { logger, ioc } }) {
    const appConfig = ioc.get<AppConfig>(AppConfig);
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
