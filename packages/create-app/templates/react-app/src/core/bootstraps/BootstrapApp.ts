import { Bootstrap } from '@qlover/corekit-bridge';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { IOC } from '../IOC';
import * as globals from '../globals';
import { GLOBAL_NO_WINDOW } from '@config/Identifier/common.error';
import { IocRegisterImpl } from '../registers/IocRegisterImpl';
import { BootstrapsRegistry } from './BootstrapsRegistry';

export class BootstrapApp {
  static async main(): Promise<void> {
    const root = window;

    if (!(typeof root !== 'undefined' && root instanceof Window)) {
      throw new Error(GLOBAL_NO_WINDOW);
    }

    const { logger, appConfig } = globals;
    const { pathname } = root.location;

    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: new IocRegisterImpl({ pathname, appConfig })
      },
      envOptions: {
        target: appConfig,
        source: {
          ...import.meta.env,
          [envPrefix + 'BOOT_HREF']: root.location.href
        },
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
}
