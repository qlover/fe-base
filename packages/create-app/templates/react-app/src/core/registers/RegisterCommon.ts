import {
  FetchAbortPlugin,
  type SyncStorageInterface
} from '@qlover/fe-corekit';
import { Logger } from '@qlover/logger';
import {
  RequestCommonPlugin,
  ApiMockPlugin,
  ApiCatchPlugin,
  ThemeService,
  TokenStorage
} from '@qlover/corekit-bridge';
import mockDataJson from '@config/feapi.mock.json';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import { themeConfig } from '@config/theme';
import { localStorage, logger } from '../globals';
import { I18nService } from '@/base/services/I18nService';
import { RouteService } from '@/base/services/RouteService';
import { baseRoutes, baseNoLocaleRoutes } from '@config/app.router';
import { useLocaleRoutes } from '@config/common';
import { UserService } from '@/base/services/UserService';
import { IOCRegister } from '../IOC';
import { IOCIdentifier } from '@config/IOCIdentifier';

export const RegisterCommon: IOCRegister = {
  register(container, _, options): void {
    const AppConfig = container.get(IOCIdentifier.AppConfig);

    container.bind(IOCIdentifier.EnvConfigInterface, AppConfig);

    // container.bind(
    //   IOCIdentifier.RequestCatcherInterface,
    //   new ApiCatchPlugin(
    //     container.get(Logger),
    //     container.get(RequestStatusCatcher)
    //   )
    // );

    // [IOCIdentifier.I18nServiceInterface]: I18nService;
    // [IOCIdentifier.ProcesserExecutorInterface]: ProcesserExecutor;
    // [IOCIdentifier.RouteServiceInterface]: RouteService;
    // [IOCIdentifier.UserServiceInterface]: UserService;

    // [IOCIdentifier.FeApiToken]: CorekitBridge.TokenStorage<string>;
    // [IOCIdentifier.FeApiCommonPlugin]: CorekitBridge.RequestCommonPlugin;
    // [IOCIdentifier.ApiMockPlugin]: CorekitBridge.ApiMockPlugin;
    // [IOCIdentifier.ApiCatchPlugin]: CorekitBridge.ApiCatchPlugin;

    const feApiToken = new TokenStorage(AppConfig.userTokenStorageKey, {
      storage: container.get(IOCIdentifier.LocalStorageEncrypt)
    });
    const feApiAbort = new FetchAbortPlugin();
    const feApiRequestCommonPlugin = new RequestCommonPlugin({
      tokenPrefix: AppConfig.openAiTokenPrefix,
      requiredToken: true,
      token: () => container.get(UserService).getToken()
    });

    container.bind(FetchAbortPlugin, feApiAbort);

    container.bind(IOCIdentifier.FeApiToken, feApiToken);
    container.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);
    container.bind(
      IOCIdentifier.ApiMockPlugin,
      new ApiMockPlugin(mockDataJson, container.get(Logger))
    );
    container.bind(
      IOCIdentifier.ApiCatchPlugin,
      new ApiCatchPlugin(
        container.get(Logger),
        container.get(RequestStatusCatcher)
      )
    );

    container.bind(
      ThemeService,
      new ThemeService({
        ...themeConfig,
        storage: localStorage as SyncStorageInterface<string, string>
      })
    );

    container.bind(
      RouteService,
      new RouteService({
        routes: useLocaleRoutes ? baseRoutes : baseNoLocaleRoutes,
        logger,
        hasLocalRoutes: useLocaleRoutes
      })
    );

    container.bind(I18nService, new I18nService(options!.pathname));
  }
};
