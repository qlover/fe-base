import type {
  BootstrapExecutorPlugin,
  EnvConfigInterface,
  IOCContainerInterface,
  IOCFunctionInterface
} from '@qlover/corekit-bridge';
import { BootstrapApp } from './BootstrapApp';
import { UserApiBootstarp } from '@/base/apis/userApi/UserApiBootstarp';
import { FeApiBootstarp } from '@/base/apis/feApi/FeApiBootstarp';
import { AiApiBootstarp } from '@/base/apis/AiApi';
import { printBootstrap } from './PrintBootstrap';
import { IOCIdentifier, type IOCIdentifierMap } from '../IOC';
import { I18nService } from '@/base/services/I18nService';

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
      IOC(I18nService),
      new UserApiBootstarp(),
      new FeApiBootstarp(),
      AiApiBootstarp,
      new BootstrapApp()
    ];

    if (this.appConfig.env !== 'production') {
      bootstrapList.push(printBootstrap);
    }

    return bootstrapList;
  }
}
