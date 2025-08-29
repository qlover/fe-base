import { IOCIdentifier as I } from '@config/IOCIdentifier';
import type { IocRegisterOptions } from '@/base/port/IOCInterface';
import { I18nService } from '@/base/services/I18nService';
import { UserService } from '@/base/services/UserService';
import type {
  IOCContainerInterface,
  IOCManagerInterface,
  IOCRegisterInterface
} from '@qlover/corekit-bridge';

export class ServerIOCRegister
  implements IOCRegisterInterface<IOCContainerInterface, IocRegisterOptions>
{
  constructor(protected options: IocRegisterOptions) {}

  /**
   * Register globals
   *
   * 一般用于注册全局
   *
   * @param ioc - IOC container
   */
  protected registerGlobals(ioc: IOCContainerInterface): void {
    const { appConfig } = this.options;
    // ioc.bind(I.JSONSerializer, JSON);
    // ioc.bind(I.Logger, logger);
    ioc.bind(I.AppConfig, appConfig);
    // ioc.bind(I.EnvConfigInterface, appConfig);
    // ioc.bind(I.DialogHandler, dialogHandler);
    // ioc.bind(I.UIDialogInterface, dialogHandler);
    // ioc.bind(I.AntdStaticApiInterface, dialogHandler);
    // ioc.bind(I.LocalStorage, globals.localStorage);
    // ioc.bind(I.LocalStorageEncrypt, localStorageEncrypt);
    // ioc.bind(I.CookieStorage, globals.cookieStorage);
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
  protected registerImplement(ioc: IOCContainerInterface): void {
    ioc.bind(I.I18nServiceInterface, new I18nService());
    // ioc.bind(
    //   I.RouteServiceInterface,
    //   new RouteService(
    //     ioc.get(NavigateBridge),
    //     ioc.get(I.I18nServiceInterface),
    //     {
    //       routes: useLocaleRoutes ? baseRoutes : baseNoLocaleRoutes,
    //       logger: ioc.get(I.Logger),
    //       hasLocalRoutes: useLocaleRoutes
    //     }
    //   )
    // );
    // ioc.bind(
    //   I.ThemeService,
    //   new ThemeService({
    //     ...themeConfig,
    //     storage: ioc.get<SyncStorageInterface<string, string>>(I.LocalStorage)
    //   })
    // );
    // ioc.bind(I.I18nKeyErrorPlugin, ioc.get(I18nKeyErrorPlugin));
    // ioc.bind(I.ProcesserExecutorInterface, ioc.get(ProcesserExecutor));
    ioc.bind(I.UserServiceInterface, ioc.get(UserService));
    // ioc.bind(I.RequestCatcherInterface, ioc.get(RequestStatusCatcher));
    // ioc.bind(I.ExecutorPageBridgeInterface, ioc.get(ExecutorPageBridge));
    // ioc.bind(I.JSONStoragePageInterface, ioc.get(JSONStoragePageBridge));
    // ioc.bind(I.RequestPageBridgeInterface, ioc.get(RequestPageBridge));
  }

  protected registerCommon(_ioc: IOCContainerInterface): void {
    // const { appConfig } = this.options;
    // const logger = ioc.get(I.Logger);
    // const feApiRequestCommonPlugin = new RequestCommonPlugin({
    //   tokenPrefix: appConfig.openAiTokenPrefix,
    //   requiredToken: true,
    //   token: () => ioc.get(UserService).getToken()
    // });
    // const apiMockPlugin = new ApiMockPlugin(mockDataJson, logger);
    // const apiCatchPlugin = new ApiCatchPlugin(
    //   logger,
    //   ioc.get(RequestStatusCatcher)
    // );
    // ioc.bind(I.FeApiCommonPlugin, feApiRequestCommonPlugin);
    // ioc.bind(I.ApiMockPlugin, apiMockPlugin);
    // ioc.bind(I.ApiCatchPlugin, apiCatchPlugin);
  }

  /**
   * @override
   */
  register(
    ioc: IOCContainerInterface,
    _manager: IOCManagerInterface<IOCContainerInterface>
  ): void {
    this.registerGlobals(ioc);
    this.registerCommon(ioc);
    this.registerImplement(ioc);
  }
}
