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
import { IOCIdentifier, IOCIdentifierMap } from '@config/IOCIdentifier';
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
      IOC(IOCIdentifier.I18nKeyErrorPlugin)
    ];

    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);
    // TODO: 需要使用到
    bootstrapList.push(IOC(IOCIdentifier.ProcesserExecutorInterface));

    return bootstrapList;
  }
}
