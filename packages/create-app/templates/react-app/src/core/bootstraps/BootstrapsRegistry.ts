import { I } from '@config/IOCIdentifier';
import { AiApiBootstarp } from '@/base/apis/AiApi';
import { FeApiBootstarp } from '@/base/apis/feApi/FeApiBootstarp';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';
import type { IOCIdentifierMap } from '@config/IOCIdentifier';
import { IocIdentifierTest } from './IocIdentifierTest';
import { printBootstrap } from './PrintBootstrap';
import { saveAppInfo } from './SaveAppInfo';
import type {
  BootstrapExecutorPlugin,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';

export interface BootstrapsRegistryInterface {
  register(
    ioc: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ): BootstrapExecutorPlugin[];
}

export class BootstrapsRegistry implements BootstrapsRegistryInterface {
  constructor(
    protected IOC: IOCFunctionInterface<IOCIdentifierMap, IOCContainerInterface>
  ) {}

  public get appConfig(): EnvConfigInterface {
    return this.IOC(I.AppConfig);
  }

  public register(): BootstrapExecutorPlugin[] {
    const IOC = this.IOC;

    const bootstrapList = [
      IOC(I.I18nServiceInterface),
      new UserApiBootstarp(),
      new FeApiBootstarp(),
      AiApiBootstarp,
      saveAppInfo,
      IOC(I.I18nKeyErrorPlugin)
    ];

    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    bootstrapList.push(IocIdentifierTest);

    return bootstrapList;
  }
}
