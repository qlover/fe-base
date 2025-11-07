import { baseNoLocaleRoutes, baseRoutes } from '@config/app.router';
import { useLocaleRoutes } from '@config/common';
import { I } from '@config/IOCIdentifier';
import { themeConfig } from '@config/theme';
import { ThemeService } from '@qlover/corekit-bridge';
import type { IocRegisterOptions } from '@/base/port/IOCInterface';
import { I18nService } from '@/base/services/I18nService';
import { RouteService } from '@/base/services/RouteService';
import * as globals from '@/core/globals';
import { NavigateBridge } from '@/uikit/bridges/NavigateBridge';
import type {
  IOCContainerInterface,
  IOCManagerInterface,
  IOCRegisterInterface,
  ThemeServiceProps
} from '@qlover/corekit-bridge';

/**
 * TestIOCRegister - Register mock services for testing
 */
export class TestIOCRegister
  implements IOCRegisterInterface<IOCContainerInterface, IocRegisterOptions>
{
  protected registerGlobals(ioc: IOCContainerInterface): void {
    const { appConfig, dialogHandler, localStorageEncrypt, JSON, logger } =
      globals;

    ioc.bind(I.JSONSerializer, JSON);
    ioc.bind(I.Logger, logger);
    ioc.bind(I.AppConfig, appConfig);
    ioc.bind(I.EnvConfigInterface, appConfig);
    ioc.bind(I.DialogHandler, dialogHandler);
    ioc.bind(I.UIDialogInterface, dialogHandler);
    ioc.bind(I.AntdStaticApiInterface, dialogHandler);
    ioc.bind(I.LocalStorage, globals.localStorage);
    ioc.bind(I.LocalStorageEncrypt, localStorageEncrypt);
    ioc.bind(I.CookieStorage, globals.cookieStorage);
  }

  register(
    ioc: IOCContainerInterface,
    _manager: IOCManagerInterface<IOCContainerInterface>
  ): void {
    this.registerGlobals(ioc);

    ioc.bind(I.I18nServiceInterface, new I18nService('/en/test-mock'));
    ioc.bind(
      I.RouteServiceInterface,
      new RouteService(
        ioc.get(NavigateBridge),
        ioc.get(I.I18nServiceInterface),
        {
          routes: useLocaleRoutes ? baseRoutes : baseNoLocaleRoutes,
          logger: ioc.get(I.Logger),
          hasLocalRoutes: useLocaleRoutes
        }
      )
    );
    ioc.bind(
      I.ThemeService,
      new ThemeService({
        ...(themeConfig as unknown as ThemeServiceProps),
        storage: ioc.get(I.LocalStorage)
      })
    );
  }
}
