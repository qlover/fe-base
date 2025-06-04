import { browserGlobalsName } from '@config/common';
import { BootstrapExecutorPlugin } from '@qlover/corekit-bridge';

export const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',
  onSuccess({ parameters: { logger } }) {
    logger.info(
      'bootstrap success!\n\n' +
        `You can use \`%cwindow.${browserGlobalsName}%c\` to access the globals`,
      'color: #0ff; font-weight: bold;',
      'all: unset;'
    );
  }
};
