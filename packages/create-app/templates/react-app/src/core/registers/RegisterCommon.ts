import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';

import { FetchAbortPlugin, JSONStorage } from '@qlover/fe-corekit';
import AppConfig from '@/core/AppConfig';
import { IOCIdentifier } from '@/core/IOC';
import { RequestCommonPlugin } from '@qlover/fe-prod/core/request-common-plugin';
import { UserToken } from '@qlover/fe-prod/core';

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
  }
}
