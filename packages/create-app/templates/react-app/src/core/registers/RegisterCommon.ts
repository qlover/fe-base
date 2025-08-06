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
import { ProcesserExecutor } from '@/base/services/ProcesserExecutor';
import { AppConfig } from '@/base/cases/AppConfig';
import { I18nKeyErrorPlugin } from '@/base/cases/I18nKeyErrorPlugin';

const interfaceRegister: IOCRegister = {
  register(c): void {
    c.bind(IOCIdentifier.EnvConfigInterface, AppConfig);
    c.bind(IOCIdentifier.RequestCatcherInterface, c.get(RequestStatusCatcher));
    c.bind(IOCIdentifier.I18nServiceInterface, c.get(I18nService));
    c.bind(IOCIdentifier.ProcesserExecutorInterface, c.get(ProcesserExecutor));
    c.bind(IOCIdentifier.RouteServiceInterface, c.get(RouteService));
    c.bind(IOCIdentifier.UserServiceInterface, c.get(UserService));
    c.bind(IOCIdentifier.I18nKeyErrorPlugin, c.get(I18nKeyErrorPlugin));
  }
};

export const RegisterCommon: IOCRegister = {
  register(container, _, options): void {
    const AppConfig = container.get(IOCIdentifier.AppConfig);

    const feApiToken = new TokenStorage(AppConfig.userTokenStorageKey, {
      storage: container.get(IOCIdentifier.LocalStorageEncrypt)
    });
    const feApiAbort = new FetchAbortPlugin();
    const feApiRequestCommonPlugin = new RequestCommonPlugin({
      tokenPrefix: AppConfig.openAiTokenPrefix,
      requiredToken: true,
      token: () => container.get(UserService).getToken()
    });
    const apiMockPlugin = new ApiMockPlugin(
      mockDataJson,
      container.get(Logger)
    );
    const apiCatchPlugin = new ApiCatchPlugin(
      container.get(Logger),
      container.get(RequestStatusCatcher)
    );
    const themeService = new ThemeService({
      ...themeConfig,
      storage: localStorage as SyncStorageInterface<string, string>
    });
    const routeService = new RouteService({
      routes: useLocaleRoutes ? baseRoutes : baseNoLocaleRoutes,
      logger,
      hasLocalRoutes: useLocaleRoutes
    });

    container.bind(RouteService, routeService);
    container.bind(FetchAbortPlugin, feApiAbort);
    container.bind(IOCIdentifier.FeApiToken, feApiToken);
    container.bind(IOCIdentifier.FeApiCommonPlugin, feApiRequestCommonPlugin);
    container.bind(IOCIdentifier.ApiMockPlugin, apiMockPlugin);
    container.bind(IOCIdentifier.ApiCatchPlugin, apiCatchPlugin);
    container.bind(ThemeService, themeService);
    container.bind(I18nService, new I18nService(options!.pathname));
    // alias register
    interfaceRegister.register(container, _, options);
  }
};
