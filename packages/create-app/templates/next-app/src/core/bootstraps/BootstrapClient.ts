import { Bootstrap, createIOCFunction } from '@qlover/corekit-bridge';
import { isObject } from 'lodash';
import { browserGlobalsName } from '@config/common';
import { InversifyContainer } from '@/base/cases/InversifyContainer';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import { ClientIOCRegister } from '../clientIoc/ClientIOCRegister';
import * as globals from '../globals';
import { appConfig } from '../globals';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
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
};

export class BootstrapClient {
  private static _ioc: IOCFunctionInterface<
    IOCIdentifierMap,
    IOCContainerInterface
  > | null = null;

  static createSingletonIOC(): IOCFunctionInterface<
    IOCIdentifierMap,
    IOCContainerInterface
  > {
    if (BootstrapClient._ioc) {
      return BootstrapClient._ioc;
    }

    BootstrapClient._ioc = createIOCFunction<IOCIdentifierMap>(
      /**
       * If not inversify, you can use any IOC container,
       * then replace the InversifyContainer with your own IOC container
       */
      new InversifyContainer()
    );

    new ClientIOCRegister({
      appConfig: appConfig as EnvConfigInterface
    }).register(BootstrapClient._ioc.implemention!, BootstrapClient._ioc);

    return BootstrapClient._ioc;
  }

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
        manager: IOC
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
    } catch (error) {
      logger.error(`${appConfig.appName} starup error:`, error);
    }

    return args;
  }
}
