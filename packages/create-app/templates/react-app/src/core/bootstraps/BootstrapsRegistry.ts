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
import { I18nService } from '@/base/services/I18nService';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import { IOCIdentifierMap } from '../IOC';

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
      IOC(I18nKeyErrorPlugin)
    ];

    if (!this.appConfig.isProduction) {
      bootstrapList.push(printBootstrap);
    }

    return bootstrapList;
  }
}
