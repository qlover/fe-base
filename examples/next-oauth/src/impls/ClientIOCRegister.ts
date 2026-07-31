import { CookieStorage } from '@qlover/corekit-bridge';
import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { StorageExecutor } from '@qlover/fe-corekit/storage';
import { LocalStorage } from '@qlover/next-kit/client';
import { StringEncryptor, cookiesConfig } from '@qlover/next-kit/common';
import { I18nService } from '@/impls/I18nService';
import { RouterService } from '@/impls/RouterService';
import { UserService } from '@/impls/UserService';
import { ZustandCounterService } from '@/impls/ZustandCounterService';
import { IOCIdentifier as I } from '@config/ioc-identifiter';
import { AppApiRegister } from './appApi/AppApiRegister';
import { OAuthClientsApi } from './appApi/OAuthClientsApi';
import { dialogHandler, logger, JSON, appConfig } from './globals';
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
    ioc.bind(
      I.CookieStorage,
      new CookieStorage(
        cookiesConfig as ConstructorParameters<typeof CookieStorage>[0]
      )
    );
    ioc.bind(I.I18nServiceInterface, new I18nService());
    ioc.bind(I.RouterServiceInterface, ioc.get(RouterService));
    ioc.bind(I.UserServiceInterface, ioc.get(UserService));
    ioc.bind(I.ZustandCounterServiceInterface, new ZustandCounterService());
    ioc.bind(OAuthClientsApi, ioc.get(OAuthClientsApi));

    new AppApiRegister(JSON).register(ioc);
  }
};
