import {
  Bootstrap,
  type InjectGlobalConfig,
  type InjectIOCOptions,
  type IOCContainerInterface,
  type InjectEnvConfig
} from '@qlover/corekit-bridge';
import AppConfig from '@/core/AppConfig';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { IOC } from './IOC';
import * as globals from '@/core/globals';
import { IocRegister } from './registers';
import { BootstrapsRegistry } from './bootstraps';
import { GLOBAL_NO_WINDOW } from '@config/Identifier.Error';

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

  const { logger } = globals;

  const envOptions: InjectEnvConfig = {
    target: AppConfig,
    source: envSource,
    prefix: envPrefix,
    blackList: envBlackList
  };

  const iocOptions: InjectIOCOptions<IOCContainerInterface> = {
    manager: IOC,
    register: new IocRegister({
      pathname: root.location.pathname
    })
  };

  const globalOptions: InjectGlobalConfig = {
    sources: globals,
    target: browserGlobalsName
  };

  const bootstrap = new Bootstrap({
    root,
    logger,
    ioc: iocOptions,
    envOptions,
    globalOptions
  });

  try {
    logger.info('bootstrap start...');

    // init bootstrap
    await bootstrap.initialize();

    const bootstrapsRegistry = new BootstrapsRegistry(IOC);

    await bootstrap.use(bootstrapsRegistry.register()).start();
  } catch (error) {
    logger.error(`${AppConfig.appName} starup error:`, error);
  }
}
