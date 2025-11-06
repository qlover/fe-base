import { Bootstrap, IOCContainerInterface } from '@qlover/corekit-bridge';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import * as globals from '../globals';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import { isObject } from 'lodash';
import { IOCInterface } from '@/base/port/IOCInterface';

export type BootstrapClientArgs = {
  /**
   * 启动的根节点，通常是window
   */
  root: unknown;
  /**
   * 启动的web地址
   */
  bootHref: string;

  /**
   * IOC容器对象
   */
  ioc: IOCInterface<IOCIdentifierMap, IOCContainerInterface>;
};

export class BootstrapClient {
  static async main(args: BootstrapClientArgs): Promise<void> {
    const { root, bootHref, ioc } = args;

    if (!isObject(root)) {
      throw new Error('root is not an object');
    }

    const { logger, appConfig } = globals;

    const IOC = ioc.create({
      pathname: bootHref,
      appConfig: appConfig
    });

    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
      },
      envOptions: {
        target: appConfig,
        source: Object.assign({}, import.meta.env, {
          [envPrefix + 'BOOT_HREF']: bootHref
        }),
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
