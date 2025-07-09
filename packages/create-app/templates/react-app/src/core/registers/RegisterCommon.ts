import { FetchAbortPlugin } from '@qlover/fe-corekit';
import { Logger } from '@qlover/logger';
import {
  InversifyContainer,
  InversifyRegisterInterface,
  IOCIdentifier,
  IocRegisterOptions
} from '@/core/IOC';
import {
  RequestCommonPlugin,
  ApiMockPlugin,
  ApiCatchPlugin,
  ThemeService,
  IOCManagerInterface,
  TokenStorage
} from '@qlover/corekit-bridge';
import mockDataJson from '@config/feapi.mock.json';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import { themeConfig } from '@config/theme';
import { localStorage, logger } from '../globals';
import { I18nService } from '@/base/services/I18nService';
import { RouteService } from '@/base/services/RouteService';
import { baseRoutes } from '@config/app.router';
import { UserService } from '@/base/services/UserService';

export class RegisterCommon implements InversifyRegisterInterface {
  register(
    container: InversifyContainer,
    _: IOCManagerInterface<InversifyContainer>,
    options: IocRegisterOptions
  ): void {
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
        storage: localStorage
      })
    );

    container.bind(
      RouteService,
      new RouteService({
        routes: baseRoutes,
        logger
      })
    );

    container.bind(I18nService, new I18nService(options.pathname));
  }
}
