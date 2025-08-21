import {
  Bootstrap,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { browserGlobalsName } from '@config/common';
import * as globals from '../globals';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import { isObject } from 'lodash';
import { IocRegisterImpl } from '../IocRegisterImpl';

export type BootstrapAppArgs = {
  /**
   * 启动的根节点，通常是window
   */
  root: unknown;
  /**
   * IOC容器
   */
  IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;
};

export class BootstrapClient {
  static async main(args: BootstrapAppArgs): Promise<BootstrapAppArgs> {
    const { root, IOC } = args;

    if (!isObject(root)) {
      throw new Error('root is not an object');
    }

    const { logger, appConfig } = globals;

    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: new IocRegisterImpl({
          appConfig: appConfig as EnvConfigInterface
        })
      },
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    try {
      await bootstrap.initialize();

      const bootstrapsRegistry = new BootstrapsRegistry(IOC);

      await bootstrap.use(bootstrapsRegistry.register()).start();
    } catch (error) {
      logger.error(`${appConfig.appName} starup error:`, error);
    }

    return args;
  }
}
