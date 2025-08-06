import type {
  BootstrapExecutorPlugin,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';
import { FeApiBootstarp } from '@/base/apis/feApi/FeApiBootstarp';
import { AiApiBootstarp } from '@/base/apis/AiApi';
import { printBootstrap } from './PrintBootstrap';
import { IOCIdentifier } from '@config/IOCIdentifier';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import { IOCIdentifierMap } from '@config/IOCIdentifierMap';
import { IocIdentifierTest } from './IocIdentifierTest';

export class BootstrapsRegistry {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}

  get appConfig(): EnvConfigInterface {
    return this.IOC(IOCIdentifier.AppConfig);
  }

  register(): BootstrapExecutorPlugin[] {
    const IOC = this.IOC;

    const bootstrapList = [
      IOC(IOCIdentifier.I18nServiceInterface),
      new UserApiBootstarp(),
      new FeApiBootstarp(),
      AiApiBootstarp,
      IOC(I18nKeyErrorPlugin)
    ];

    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);
    bootstrapList.push(IOC(IOCIdentifier.ProcesserExecutorInterface));

    return bootstrapList;
  }
}
