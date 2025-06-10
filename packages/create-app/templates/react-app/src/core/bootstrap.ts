import { Bootstrap } from '@qlover/corekit-bridge';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { IOC } from './IOC';
import * as globals from '@/core/globals';
import { IocRegister } from './registers';
import { BootstrapsRegistry } from './bootstraps';
import { GLOBAL_NO_WINDOW } from '@config/Identifier/Error';

export default async function startup({
  root,
  envSource
}: {
  root: unknown;
  envSource: Record<string, unknown>;
}) {
  if (!(typeof root !== 'undefined' && root instanceof Window)) {
    throw new Error(GLOBAL_NO_WINDOW);
  }

  const { logger, appConfig } = globals;

  const iocRegister = new IocRegister({
    pathname: root.location.pathname,
    appConfig
  });

  const bootstrap = new Bootstrap({
    root,
    logger,
    ioc: {
      manager: IOC,
      register: iocRegister
    },
    envOptions: {
      target: appConfig,
      source: envSource,
      prefix: envPrefix,
      blackList: envBlackList
    },
    globalOptions: {
      sources: globals,
      target: browserGlobalsName
    }
  });

  try {
    logger.info('bootstrap start...');

    // init bootstrap
    await bootstrap.initialize();

    const bootstrapsRegistry = new BootstrapsRegistry(IOC);

    await bootstrap.use(bootstrapsRegistry.register()).start();
  } catch (error) {
    logger.error(`${appConfig.appName} starup error:`, error);
  }
}
