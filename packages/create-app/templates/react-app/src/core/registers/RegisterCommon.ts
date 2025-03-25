import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';
import { FetchAbortPlugin, JSONStorage, Logger } from '@qlover/fe-corekit';
import AppConfig from '@/core/AppConfig';
import { IOCIdentifier } from '@/core/IOC';
import {
  UserToken,
  RequestCommonPlugin,
  ApiMockPlugin,
  ApiCatchPlugin,
  ThemeService
} from '@qlover/corekit-bridge';
import mockDataJson from '@config/feapi.mock.json';
import { RequestStatusCatcher } from '@/base/cases/RequestStatusCatcher';
import { override as themeOverride } from '@config/theme.json';
import { localJsonStorage } from '../globals';

export class RegisterCommon implements InversifyRegisterInterface {
  register(container: InversifyRegisterContainer): void {
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

    container.bind(FetchAbortPlugin).toConstantValue(feApiAbort);
    container.bind(UserToken).toConstantValue(userToken);

    container.bind(IOCIdentifier.FeApiToken).toConstantValue(userToken);
    container
      .bind(IOCIdentifier.FeApiCommonPlugin)
      .toConstantValue(feApiRequestCommonPlugin);
    container
      .bind(IOCIdentifier.ApiMockPlugin)
      .toConstantValue(new ApiMockPlugin(mockDataJson, container.get(Logger)));
    container
      .bind(IOCIdentifier.ApiCatchPlugin)
      .toConstantValue(
        new ApiCatchPlugin(
          container.get(Logger),
          container.get(RequestStatusCatcher)
        )
      );

    container.bind(ThemeService).toConstantValue(
      new ThemeService({
        ...themeOverride,
        storage: localJsonStorage
      })
    );
  }
}
