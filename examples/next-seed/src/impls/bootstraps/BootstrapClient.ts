import { Bootstrap } from '@qlover/corekit-bridge';
import { browserGlobalsName } from '@config/common';
import { I, type IOCIdentifierMap } from '@config/ioc-identifiter';
import type { SeedBootstrapInterface } from '@interfaces/SeedBootstrapInterface';
import type { SeedConfigInterface } from '@interfaces/SeedConfigInterface';
import * as globals from '../globals';
import { IocIdentifierTest } from './IocIdentifierTest';
import { printBootstrap } from './PrintBootstrap';
import { restoreUserService } from './RestoreUserService';
import { AppUserApiBootstrap } from '../appApi/AppUserApiBootstrap';
import type {
  BootstrapExecutorPlugin,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export class BootstrapClient implements SeedBootstrapInterface<BootstrapExecutorPlugin> {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}
  /**
   * @override
   */
  public startup(root?: unknown, pathname?: string): Promise<unknown> {
    const { logger, appConfig } = globals;

    const bootstrap = new Bootstrap({
      root,
      logger: logger,
      ioc: { manager: this.IOC },
      globalOptions: {
        sources: globals,
        target: browserGlobalsName
      }
    });

    return bootstrap
      .initialize()
      .then(() => {
        const plugins = this.getPlugins(appConfig, pathname);

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
    appConfig: SeedConfigInterface,
    pathname?: string
  ): BootstrapExecutorPlugin[] {
    const i18nService = this.IOC(I.I18nServiceInterface);
    i18nService.setPathname(pathname ?? '');

    const bootstrapList: BootstrapExecutorPlugin[] = [
      i18nService,
      new AppUserApiBootstrap(this.IOC(I.JSONSerializer)),
      restoreUserService
    ];

    if (!appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);

    return bootstrapList;
  }
}
