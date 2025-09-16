import { I, IOCIdentifier } from '@config/IOCIdentifier';
import { AppUserApiBootstrap } from '@/base/services/appApi/AppUserApiBootstrap';
import { IocIdentifierTest } from './IocIdentifierTest';
import { printBootstrap } from './PrintBootstrap';
import type { BootstrapAppArgs } from './BootstrapClient';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import type {
  BootstrapExecutorPlugin,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

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
      i18nService,
      new AppUserApiBootstrap(IOC(I.JSONSerializer))
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
