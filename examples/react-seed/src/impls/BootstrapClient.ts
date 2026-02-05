import { browserGlobalsName, omitInjectedGlobals } from '@config/react-seed';
import { Bootstrap } from '@qlover/corekit-bridge/bootstrap';
import { omit } from 'lodash-es';
import * as globals from '@/globals';
import { printBootstrap } from '@/utils/PrintBootstrap';
import { I18nService } from './I18nService';
import type { ReactSeedBootstrapInterface } from '@/interfaces/ReactSeedBootstrapInterface';
import type { ReactSeedConfigInterface } from '@/interfaces/ReactSeedConfigInterface';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  BootstrapPluginOptions,
  IOCContainerInterface
} from '@qlover/corekit-bridge';
import type { BootstrapExecutorPlugin } from '@qlover/corekit-bridge/bootstrap';
import type { IOCFunctionInterface } from '@qlover/corekit-bridge/ioc';

export class BootstrapClient implements ReactSeedBootstrapInterface {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}
  /**
   * Start the client
   *
   * @override
   */
  public startup(root?: unknown): Promise<BootstrapPluginOptions> {
    const { logger, seedConfig } = globals;

    const bootstrap = new Bootstrap({
      root: root,
      logger: logger,
      ioc: { manager: this.IOC },
      globalOptions: {
        sources: omit(globals, omitInjectedGlobals),
        target: browserGlobalsName
      }
    });

    return bootstrap.initialize().then(() => {
      const plugins = this.getPlugins(seedConfig);

      if (Array.isArray(plugins) && plugins.length > 0) {
        bootstrap.use(plugins);
        logger.debug(`BootstrapClient Using plugins: ${plugins.length}`);
      }

      return bootstrap.start();
    });
  }

  /**
   * @override
   */
  public getPlugins(
    seedConfig: ReactSeedConfigInterface
  ): BootstrapExecutorPlugin[] {
    const result: BootstrapExecutorPlugin[] = [];

    result.push({
      pluginName: 'I18nService',
      onBefore: ({ parameters: { ioc } }) => {
        ioc.get<I18nService>(I18nService).init();
      }
    });

    if (!seedConfig.isProduction) {
      result.push(printBootstrap);
    }

    return result;
  }
}
