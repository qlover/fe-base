import type { IOCContainer, IOCRegister, IocRegisterOptions } from './IOC';
import {
  ApiCatchPlugin,
  ApiMockPlugin,
  RequestCommonPlugin,
  ThemeService,
  type IOCManagerInterface
} from '@qlover/corekit-bridge';
import * as globals from './globals';
import { IOCIdentifier } from '@config/IOCIdentifier';
import mockDataJson from '@config/feapi.mock.json';
import { I18nService } from '@/base/services/I18nService';
import { themeConfig } from '@config/theme';
import { useLocaleRoutes } from '@config/common';
import { baseNoLocaleRoutes, baseRoutes } from '@config/app.router';
import { SyncStorageInterface } from '@qlover/fe-corekit';
import { RouteService } from '@/base/services/RouteService';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import { UserService } from '@/base/services/UserService';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { NavigateBridge } from '@/uikit/bridges/NavigateBridge';

export class IocRegisterImpl implements IOCRegister {
  constructor(protected options: IocRegisterOptions) {}

  /**
   * Register globals
   *
   * 一般用于注册全局
   *
   * @param ioc - IOC container
   */
  protected registerGlobals(ioc: IOCContainer): void {
    const { appConfig } = this.options;
    const { dialogHandler, localStorageEncrypt, JSON, logger } = globals;

    ioc.bind(IOCIdentifier.JSONSerializer, JSON);
    ioc.bind(IOCIdentifier.Logger, logger);
    ioc.bind(IOCIdentifier.AppConfig, appConfig);
    ioc.bind(IOCIdentifier.EnvConfigInterface, appConfig);
    ioc.bind(IOCIdentifier.DialogHandler, dialogHandler);
    ioc.bind(IOCIdentifier.InteractionHubInterface, dialogHandler);
    ioc.bind(IOCIdentifier.AntdStaticApiInterface, dialogHandler);
    ioc.bind(IOCIdentifier.LocalStorage, globals.localStorage);
    ioc.bind(IOCIdentifier.LocalStorageEncrypt, localStorageEncrypt);
    ioc.bind(IOCIdentifier.CookieStorage, globals.cookieStorage);
  }

  /**
   * 一般用于注册没有其他复杂依赖的项目实现类
   *
   * 比如:
   * - 路由服务
   * - 国际化服务
   * - 主题服务
   *
   * @param ioc
   */
  protected registerImplement(ioc: IOCContainer): void {
    ioc.bind(
      IOCIdentifier.RouteServiceInterface,
      new RouteService(ioc.get(NavigateBridge), {
        routes: useLocaleRoutes ? baseRoutes : baseNoLocaleRoutes,
        logger: ioc.get(IOCIdentifier.Logger),
        hasLocalRoutes: useLocaleRoutes
      })
    );

    ioc.bind(
      IOCIdentifier.I18nServiceInterface,
      new I18nService(this.options.pathname)
    );

    ioc.bind(
      IOCIdentifier.ThemeService,
      new ThemeService({
        ...themeConfig,
        storage: ioc.get<SyncStorageInterface<string, string>>(
          IOCIdentifier.LocalStorage
        )
      })
    );

    ioc.bind(IOCIdentifier.I18nKeyErrorPlugin, ioc.get(I18nKeyErrorPlugin));
    ioc.bind(
      IOCIdentifier.ProcesserExecutorInterface,
      ioc.get(ProcesserExecutor)
    );

    ioc.bind(IOCIdentifier.UserServiceInterface, ioc.get(UserService));
  }

  protected registerCommon(ioc: IOCContainer): void {
    const { appConfig } = this.options;
    const logger = ioc.get(IOCIdentifier.Logger);

    // const feApiToken = new TokenStorage(appConfig.userTokenStorageKey, {
    //   storage: ioc.get(IOCIdentifier.LocalStorageEncrypt)
    // });

    const feApiRequestCommonPlugin = new RequestCommonPlugin({
      tokenPrefix: appConfig.openAiTokenPrefix,
      requiredToken: true,
      token: () => ioc.get(UserService).getToken()
    });
    const apiMockPlugin = new ApiMockPlugin(mockDataJson, logger);
    const apiCatchPlugin = new ApiCatchPlugin(
      logger,
      ioc.get(RequestStatusCatcher)
    );

    ioc.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);
    ioc.bind(IOCIdentifier.ApiMockPlugin, apiMockPlugin);
    ioc.bind(IOCIdentifier.ApiCatchPlugin, apiCatchPlugin);
  }

  /**
   * @override
   */
  register(
    ioc: IOCContainer,
    _manager: IOCManagerInterface<IOCContainer>
  ): void {
    this.registerGlobals(ioc);
    this.registerCommon(ioc);
    this.registerImplement(ioc);
  }
}
