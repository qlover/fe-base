import { CookieStorage } from '@qlover/corekit-bridge';
import { Base64Serializer, StorageExecutor } from '@qlover/fe-corekit';
import { I18nService } from '@/impls/I18nService';
import { RouterService } from '@/impls/RouterService';
import { UserService } from '@/impls/UserService';
import { ZustandCounterService } from '@/impls/ZustandCounterService';
import { StringEncryptor } from '@shared/StringEncryptor';
import { cookiesConfig } from '@config/cookies';
import { IOCIdentifier as I } from '@config/ioc-identifiter';
import { AppApiRegister } from './appApi/AppApiRegister';
import { dialogHandler, logger, JSON, appConfig } from './globals';
import { LocalStorage } from './LocalStorage';
import type {
  IOCContainerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';

export const ClientIOCRegister: IOCRegisterInterface<IOCContainerInterface> = {
  /**
   * @override
   */
  register(ioc: IOCContainerInterface): void {
    const localStorage = new LocalStorage();
    const localStorageEncrypt = new StorageExecutor([
      JSON,
      new StringEncryptor(appConfig.stringEncryptorKey, new Base64Serializer()),
      localStorage
    ]);

    ioc.bind(I.JSONSerializer, JSON);
    ioc.bind(I.Logger, logger);
    ioc.bind(I.AppConfig, appConfig);
    ioc.bind(I.DialogHandler, dialogHandler);
    ioc.bind(I.LocalStorage, new StorageExecutor([JSON, localStorage]));
    ioc.bind(I.LocalStorageEncrypt, localStorageEncrypt);
    ioc.bind(I.CookieStorage, new CookieStorage(cookiesConfig));
    ioc.bind(I.I18nServiceInterface, new I18nService());
    ioc.bind(I.RouterServiceInterface, ioc.get(RouterService));
    ioc.bind(I.UserServiceInterface, ioc.get(UserService));
    ioc.bind(I.ZustandCounterServiceInterface, new ZustandCounterService());

    new AppApiRegister(JSON).register(ioc);
  }
};
