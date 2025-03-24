import {
  Bootstrap,
  BootstrapExecutorPlugin,
  InjectEnv,
  InjectIOC,
  InjectGlobal,
  IOCContainerInterface
} from '@qlover/fe-prod/core/bootstrap';
import AppConfig from '@/core/AppConfig';
import { envPrefix, browserGlobalsName, envBlackList } from '@config/common';
import { IOC } from './IOC';
import * as globals from '@/core/globals';
import { I18nService } from '@/base/services/I18nService';
import { registerList } from './registers';
import { appBootstrapList } from './bootstraps';
import { GLOBAL_NO_WINDOW } from '@config/ErrorIdentifier';

const printBootstrap: BootstrapExecutorPlugin = {
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

/**
 * Bootstrap
 *
 * 1. inject env config to AppConfig
 * 2. inject IOC to Application
 * 3. inject globals to window
 *
 */
export default function startup({
  window,
  envSource,
  IOCContainer
}: {
  window: unknown;
  envSource: Record<string, unknown>;
  IOCContainer: IOCContainerInterface;
}) {
  if (!(typeof window !== 'undefined' && window instanceof Window)) {
    throw new Error(GLOBAL_NO_WINDOW);
  }

  // use AppIOCContainer to `IOC`
  IOC.implement(IOCContainer);

  const { logger } = globals;

  const bootstrap = new Bootstrap(window, IOCContainer, logger);

  /**
   * bootstrap start list
   *
   * - inject env config to AppConfig
   * - inject IOC to Application
   * - inject globals to window
   * - inject i18n service to Application
   */
  const bootstrapList: BootstrapExecutorPlugin[] = [
    new InjectEnv(AppConfig, envSource, envPrefix, envBlackList),
    new InjectIOC(IOC, registerList),
    new InjectGlobal(globals, browserGlobalsName),
    new I18nService(window.location.pathname),
    ...appBootstrapList
  ];

  if (AppConfig.env !== 'production') {
    bootstrapList.push(printBootstrap);
  }

  try {
    logger.info('bootstrap start...');

    bootstrap.use(bootstrapList).start();
  } catch (error) {
    logger.error(`${AppConfig.appName} starup error:`, error);
  }
}
