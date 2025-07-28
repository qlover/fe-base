import { JSONSerializer } from '@qlover/fe-corekit';
import {
  cookieStorage,
  dialogHandler,
  JSON,
  localStorage,
  localStorageEncrypt,
  logger
} from '../globals';
import { IOCRegister } from '@/core/IOC';
import { Logger } from '@qlover/logger';
import { IOCIdentifier } from '@config/IOCIdentifier';

export const RegisterGlobals: IOCRegister = {
  register(container, _, options): void {
    // inject AppConfig to IOC
    container.bind(IOCIdentifier.AppConfig, options!.appConfig);
    container.bind(IOCIdentifier.DialogHandler, dialogHandler);

    container.bind(JSONSerializer, JSON);
    container.bind(IOCIdentifier.JSON, JSON);

    container.bind(Logger, logger);
    container.bind(IOCIdentifier.Logger, logger);

    container.bind(IOCIdentifier.LocalStorage, localStorage);
    container.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
    container.bind(IOCIdentifier.CookieStorage, cookieStorage);
  }
};
