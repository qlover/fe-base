import { JSONSerializer, JSONStorage } from '@qlover/fe-corekit';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';
import { JSON, localJsonStorage, logger } from '../globals';
import { IOCIdentifier } from '@/core/IOC';
import { Logger } from '@qlover/logger';

export class RegisterGlobals implements InversifyRegisterInterface {
  constructor(private appConfig: EnvConfigInterface) {}

  register(container: InversifyRegisterContainer): void {
    // inject AppConfig to IOC
    container.bind(IOCIdentifier.AppConfig).toConstantValue(this.appConfig);

    container.bind(JSONSerializer).toConstantValue(JSON);
    container.bind(IOCIdentifier.JSON).toConstantValue(JSON);

    container.bind(Logger).toConstantValue(logger);
    container.bind(IOCIdentifier.Logger).toConstantValue(logger);

    container.bind(JSONStorage).toConstantValue(localJsonStorage);
    container.bind(IOCIdentifier.JSONStorage).toConstantValue(localJsonStorage);
  }
}
