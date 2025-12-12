import 'reflect-metadata';
import { Bootstrap } from '@qlover/corekit-bridge';
import { isObject } from 'lodash';
import type { IocRegisterOptions } from '@/base/port/IOCInterface';
import { browserGlobalsName } from '@config/common';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import * as globals from '../globals';
import type {
  IOCContainerInterface,
  IOCFunctionInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';

export type BootstrapAppArgs = {
  /**
   * 启动的根节点，通常是window
   */
  root: unknown;
  /**
   * 当前路径
   */
  pathname: string;
  /**
   * IOC容器
   */
  IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>;

  register?: IOCRegisterInterface<IOCContainerInterface, IocRegisterOptions>;
};

export class BootstrapClient {
  static lastTime = 0;
  static async main(args: BootstrapAppArgs): Promise<BootstrapAppArgs> {
    const { logger, appConfig } = globals;

    if (BootstrapClient.lastTime) {
      return args;
    }

    const { root, IOC, register } = args;

    if (!isObject(root)) {
      throw new Error('root is not an object');
    }

    const bootstrap = new Bootstrap({
      root,
      logger,
      ioc: {
        manager: IOC,
        register: register
      },
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    try {
      await bootstrap.initialize();

      const bootstrapsRegistry = new BootstrapsRegistry(args);

      await bootstrap.use(bootstrapsRegistry.register()).start();

      BootstrapClient.lastTime = Date.now();

      logger.info('BootstrapClient starup success,', BootstrapClient.lastTime);
    } catch (error) {
      logger.error(`${appConfig.appName} starup error:`, error);
    }

    return args;
  }
}
