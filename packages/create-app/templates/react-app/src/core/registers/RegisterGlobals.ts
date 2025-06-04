import { JSONSerializer, JSONStorage } from '@qlover/fe-corekit';
import type { EnvConfigInterface } from '@qlover/corekit-bridge';
import { JSON, localJsonStorage, logger } from '../globals';
import {
  type InversifyContainer,
  type InversifyRegisterInterface,
  IOCIdentifier
} from '@/core/IOC';
import { Logger } from '@qlover/logger';

export class RegisterGlobals implements InversifyRegisterInterface {
  constructor(private appConfig: EnvConfigInterface) {}

  register(container: InversifyContainer): void {
    // inject AppConfig to IOC
    container.bind(IOCIdentifier.AppConfig, this.appConfig);

    container.bind(JSONSerializer, JSON);
    container.bind(IOCIdentifier.JSON, JSON);

    container.bind(Logger, logger);
    container.bind(IOCIdentifier.Logger, logger);

    container.bind(JSONStorage, localJsonStorage);
    container.bind(IOCIdentifier.JSONStorage, localJsonStorage);
  }
}
