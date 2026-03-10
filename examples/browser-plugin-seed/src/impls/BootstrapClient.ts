import * as globals from '@/impls/globals';
import type { IOCIdentifierMap } from '@config/ioc-identifier';
import type { SeedBootstrapInterface } from '@interfaces/SeedBootstrapInterface';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  BootstrapExecutorPlugin,
  BootstrapPluginOptions,
  IOCContainerInterface,
  IOCFunctionInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';
import { Bootstrap } from '@qlover/corekit-bridge/bootstrap';
import { I18nService } from './I18nService';

export class BootstrapClient implements SeedBootstrapInterface {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}
  /**
   * Start the client
   *
   * @override
   */
  public startup(
    root?: unknown,
    /**
     * IOC注册器对象，用于注册IOC容器
     *
     * 可能在ioc create 中已经注册，这里可以额外注册
     */
    iocRegister?: IOCRegisterInterface<IOCContainerInterface>
  ): Promise<BootstrapPluginOptions | undefined> {
    const { logger, seedConfig } = globals;

    const bootstrap = new Bootstrap({
      root: root,
      logger: logger,
      ioc: { manager: this.IOC, register: iocRegister }
      // globalOptions: {
      //   sources: omit(globals, omitInjectedGlobals),
      //   target: browserGlobalsName
      // }
    });

    return bootstrap
      .initialize()
      .then(() => {
        const plugins = this.getPlugins(seedConfig);

        if (Array.isArray(plugins) && plugins.length > 0) {
          bootstrap.use(plugins);
          logger.debug(`BootstrapClient Using plugins: ${plugins.length}`);
        }

        return bootstrap.start();
      })
      .catch((error) => {
        logger.error('BootstrapClient startup failed!', error);
        return undefined;
      });
  }

  /**
   * @override
   */
  public getPlugins(
    _seedConfig: SeedConfigInterface
  ): BootstrapExecutorPlugin[] {
    const result: BootstrapExecutorPlugin[] = [];

    result.push({
      pluginName: 'init',
      onBefore({ parameters: { ioc } }) {
        ioc.get<I18nService>(I18nService).init();
      }
    });

    return result;
  }
}
