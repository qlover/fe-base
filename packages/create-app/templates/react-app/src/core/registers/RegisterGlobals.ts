import { JSONSerializer, JSONStorage } from '@qlover/fe-corekit';
import type { IOCManagerInterface } from '@qlover/corekit-bridge';
import { dialogHandler, JSON, localJsonStorage, logger } from '../globals';
import {
  type InversifyContainer,
  type InversifyRegisterInterface,
  IOCIdentifier,
  IocRegisterOptions
} from '@/core/IOC';
import { Logger } from '@qlover/logger';

export class RegisterGlobals implements InversifyRegisterInterface {
  register(
    container: InversifyContainer,
    _: IOCManagerInterface<InversifyContainer>,
    options: IocRegisterOptions
  ): void {
    // inject AppConfig to IOC
    container.bind(IOCIdentifier.AppConfig, options.appConfig);
    container.bind(IOCIdentifier.DialogHandler, dialogHandler);

    container.bind(JSONSerializer, JSON);
    container.bind(IOCIdentifier.JSON, JSON);

    container.bind(Logger, logger);
    container.bind(IOCIdentifier.Logger, logger);

    container.bind(JSONStorage, localJsonStorage);
    container.bind(IOCIdentifier.JSONStorage, localJsonStorage);
  }
}
