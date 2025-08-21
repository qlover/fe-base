import type {
  BootstrapContextValue,
  BootstrapExecutorPlugin,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { printBootstrap } from './PrintBootstrap';
import { IOCIdentifier, IOCIdentifierMap } from '@config/IOCIdentifier';
import { IocIdentifierTest } from './IocIdentifierTest';
import { BootstrapAppArgs } from './BootstrapClient';

export class BootstrapsRegistry {
  constructor(protected args: BootstrapAppArgs) {}

  get IOC(): IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface> {
    return this.args.IOC;
  }

  get appConfig(): EnvConfigInterface {
    return this.IOC(IOCIdentifier.AppConfig);
  }

  register(): BootstrapExecutorPlugin[] {
    const IOC = this.IOC;

    const i18nService = IOC(IOCIdentifier.I18nServiceInterface);
    i18nService.setPathname(this.args.pathname);

    const bootstrapList: BootstrapExecutorPlugin[] = [
      i18nService
      // new UserApiBootstarp(),
      // new FeApiBootstarp(),
      // AiApiBootstarp,
      // IOC(IOCIdentifier.I18nKeyErrorPlugin)
    ];

    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);
    // TODO: 需要使用到

    return bootstrapList;
  }
}
