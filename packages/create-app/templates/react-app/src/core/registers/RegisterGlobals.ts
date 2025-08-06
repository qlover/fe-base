import * as globals from '../globals';
import { IOCRegister } from '@/core/IOC';
import { IOCIdentifier } from '@config/IOCIdentifier';

export const RegisterGlobals: IOCRegister = {
  register(container, _, options): void {
    const { dialogHandler, localStorageEncrypt } = globals;

    container.bind(IOCIdentifier.JSONSerializer, globals.JSON);
    container.bind(IOCIdentifier.JSON, globals.JSON);

    container.bind(IOCIdentifier.LoggerInterface, globals.logger);
    container.bind(IOCIdentifier.Logger, globals.logger);

    container.bind(IOCIdentifier.AppConfig, options!.appConfig);
    container.bind(IOCIdentifier.DialogHandler, dialogHandler);
    container.bind(IOCIdentifier.InteractionHubInterface, dialogHandler);
    container.bind(IOCIdentifier.AntdStaticApiInterface, dialogHandler);

    container.bind(IOCIdentifier.LocalStorage, globals.localStorage);
    container.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
    container.bind(IOCIdentifier.CookieStorage, globals.cookieStorage);
  }
};
