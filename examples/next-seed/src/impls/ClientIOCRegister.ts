import { CookieStorage } from '@qlover/corekit-bridge';
import { I18nService } from '@/impls/I18nService';
import { RouterService } from '@/impls/RouterService';
import { UserService } from '@/impls/UserService';
import { cookiesConfig } from '@config/cookies';
import { IOCIdentifier as I } from '@config/ioc-identifiter';
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
    ioc.bind(I.JSONSerializer, JSON);
    ioc.bind(I.Logger, logger);
    ioc.bind(I.AppConfig, appConfig);
    ioc.bind(I.DialogHandler, dialogHandler);
    ioc.bind(I.CookieStorage, new CookieStorage(cookiesConfig));
    ioc.bind(I.I18nServiceInterface, new I18nService());
    ioc.bind(I.RouterServiceInterface, ioc.get(RouterService));
    ioc.bind(I.UserServiceInterface, ioc.get(UserService));
  }
};
