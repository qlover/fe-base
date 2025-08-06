import {
  Bootstrap,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import * as globals from '../globals';
import { IocRegisterImpl } from '../registers/IocRegisterImpl';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import { isObject } from 'lodash';
import { IOCIdentifierMap } from '@config/IOCIdentifierMap';

export type BootstrapAppArgs = {
  /**
   * 启动的根节点，通常是window
   */
  root: unknown;
  /**
   * 启动的web地址
   */
  bootHref: string;
  /**
   * IOC容器
   */
  IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
};

export class BootstrapApp {
  static async main(args: BootstrapAppArgs): Promise<BootstrapAppArgs> {
    const { root, bootHref, IOC } = args;

    if (!isObject(root)) {
      throw new Error('root is not an object');
    }

    const { logger, appConfig } = globals;

    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: new IocRegisterImpl({ pathname: bootHref, appConfig })
      },
      envOptions: {
        target: appConfig,
        source: {
          ...import.meta.env,
          [envPrefix + 'BOOT_HREF']: bootHref
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
      console.log(error);
      logger.error(`${appConfig.appName} starup error:`, error);
    }

    return args;
  }
}
