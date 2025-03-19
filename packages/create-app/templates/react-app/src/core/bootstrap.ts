import {
  Bootstrap,
  BootstrapExecutorPlugin,
  InjectEnv,
  InjectIOC,
  InjectGlobal,
  IOCContainerInterface
} from '@lib/bootstrap';
import AppConfig from '@/core/AppConfig';
import { envPrefix, browserGlobalsName, envBlackList } from '@config/common';
import { IOC } from './IOC';
import * as globals from '@/core/globals';
import { I18nService } from '@/services/I18nService';
import { registerList } from './registers';

const printBootstrap: BootstrapExecutorPlugin = {
  pluginName: 'PrintBootstrap',
  onBefore({ parameters: { logger } }) {
    logger.info('bootstrap start...', new Date().toISOString());
  },
  onSuccess({ parameters: { logger } }) {
    logger.info('bootstrap success!', new Date().toISOString());
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
    throw new Error('Not Found Window');
  }

  // use AppIOCContainer to `IOC`
  IOC.implement(IOCContainer);

  const { logger } = globals;

  const bootstrap = new Bootstrap(IOCContainer, logger);

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
    new I18nService(window.location.pathname)
  ];

  if (AppConfig.env !== 'production') {
    bootstrapList.push(printBootstrap);
  }

  try {
    bootstrap.use(bootstrapList).start(window);
  } catch (error) {
    logger.error(`${AppConfig.appName} starup error:`, error);
  }
}
