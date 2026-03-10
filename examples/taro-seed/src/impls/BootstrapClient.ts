import { LifecycleExecutor } from '@qlover/fe-corekit';
import { I, type IOCIdentifierMap } from '@/config/ioc-identifier';
import * as globals from '@/globals';
import { restoreUserService } from '@/utils/restoreUserService';
import { testAppRequester } from '@/utils/testAppRequester';
import type { I18nService } from './I18nService';
import type { ThemeService } from './ThemeService';
import type { SeedBootstrapInterface } from '@interfaces/SeedBootstrapInterface';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  BootstrapPluginOptions,
  IOCContainerInterface
} from '@qlover/corekit-bridge';
import type {
  BootstrapContext,
  BootstrapExecutorPlugin
} from '@qlover/corekit-bridge/bootstrap';
import type {
  IOCFunctionInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge/ioc';

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
    register?: IOCRegisterInterface<IOCContainerInterface>
  ): Promise<BootstrapPluginOptions | undefined> {
    const { logger, seedConfig } = globals;

    const executor = new LifecycleExecutor<BootstrapContext>();

    const context: BootstrapPluginOptions = {
      root: root,
      ioc: this.IOC,
      logger: logger
    };

    if (register) {
      register.register(this.IOC.implemention!, this.IOC);
    }

    const plugins = this.getPlugins(seedConfig);
    if (Array.isArray(plugins) && plugins.length > 0) {
      plugins.forEach((plugin) => {
        executor.use(plugin);
      });

      logger.log(`BootstrapClient Using plugins: ${plugins.length}`);
    }

    return executor
      .exec(context, () => Promise.resolve(context))
      .then((args) => {
        logger.log('BootstrapClient started successfully!');
        return args;
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
    return [
      {
        pluginName: 'app-init',
        onBefore({ parameters: { ioc } }) {
          ioc.get<I18nService>(I.I18nService).init();
          ioc.get<ThemeService>(I.ThemeService).init();
        }
      },
      testAppRequester,
      restoreUserService
    ];
  }
}
