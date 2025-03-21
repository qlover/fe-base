import type { EnvConfigInterface } from '@fe-prod/core';
import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { JSON, localJsonStorage, logger } from '../globals';
import { JSONSerializer, JSONStorage, Logger } from '@qlover/fe-corekit';
import { IOCIdentifier } from '@/core/IOC';

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
