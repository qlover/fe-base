import { envBlackList, envPrefix, browserGlobalsName } from '@config/common';
import { Bootstrap } from '@qlover/corekit-bridge';
import { isObject } from 'lodash';
import type { IOCInterface, IOCRegister } from '@/base/port/IOCInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import * as globals from '../globals';
import { BootstrapsRegistry } from './BootstrapsRegistry';
import type { BootstrapsRegistryInterface } from './BootstrapsRegistry';
import type {
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

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

  /**
   * IOC注册器对象，用于注册IOC容器
   *
   * 可能在ioc create 中已经注册，这里可以额外注册
   */
  iocRegister?: IOCRegister;

  /**
   * 注册器类，用于注册注册器
   */
  RegistryClass?: new (
    ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) => BootstrapsRegistryInterface;
};

export class BootstrapClient {
  static async main(args: BootstrapClientArgs): Promise<BootstrapClientArgs> {
    const {
      root,
      bootHref,
      ioc,
      iocRegister,
      RegistryClass = BootstrapsRegistry
    } = args;

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
        register: iocRegister
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

      const bootstrapsRegistry = new RegistryClass(IOC);

      await bootstrap.use(bootstrapsRegistry.register(IOC)).start();
    } catch (error) {
      logger.error(`${appConfig.appName} starup error:`, error);
    }

    return args;
  }
}
