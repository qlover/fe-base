import { FetchAbortPlugin, JSONStorage } from '@qlover/fe-corekit';
import { Logger } from '@qlover/logger';
import {
  InversifyContainer,
  InversifyRegisterInterface,
  IOCIdentifier,
  IocRegisterOptions
} from '@/core/IOC';
import {
  UserToken,
  RequestCommonPlugin,
  ApiMockPlugin,
  ApiCatchPlugin,
  ThemeService,
  IOCManagerInterface
} from '@qlover/corekit-bridge';
import mockDataJson from '@config/feapi.mock.json';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import themeConfig from '@config/theme.json';
import { localJsonStorage, logger } from '../globals';
import { I18nService } from '@/base/services/I18nService';
import { RouteService } from '@/base/services/RouteService';
import { base as baseRoutes } from '@config/app.router.json';

export class RegisterCommon implements InversifyRegisterInterface {
  register(
    container: InversifyContainer,
    _: IOCManagerInterface<InversifyContainer>,
    options: IocRegisterOptions
  ): void {
    const AppConfig = container.get(IOCIdentifier.AppConfig);

    const userToken = new UserToken(
      AppConfig.userTokenStorageKey,
      container.get(JSONStorage)
    );
    const feApiAbort = new FetchAbortPlugin();
    const feApiRequestCommonPlugin = new RequestCommonPlugin({
      tokenPrefix: AppConfig.openAiTokenPrefix,
      requiredToken: true,
      token: () => userToken.getToken()
    });

    container.bind(FetchAbortPlugin, feApiAbort);
    container.bind(UserToken, userToken);

    container.bind(IOCIdentifier.FeApiToken, userToken);
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
        storage: localJsonStorage
      })
    );

    container.bind(
      RouteService,
      new RouteService({
        config: baseRoutes,
        logger
      })
    );

    container.bind(I18nService, new I18nService(options.pathname));
  }
}
