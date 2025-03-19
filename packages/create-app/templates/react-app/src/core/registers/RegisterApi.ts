import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';
import type { AppIOCContainer } from '../AppIOCContainer';

import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { FeApiMockPlugin } from '@/base/apis/feApi';
import { OpenAIClient } from '@lib/openAiApi';
import { FeApi } from '@/base/apis/feApi';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
import AppConfig from '@/core/AppConfig';
import { IOCIdentifier } from '@/base/consts/IOCIdentifier';

export class RegisterApi implements InversifyRegisterInterface {
  register(
    container: InversifyRegisterContainer,
    thisArgs: AppIOCContainer
  ): void {
    const openAiApi = new OpenAIClient({
      baseURL: AppConfig.openAiBaseUrl,
      models: AppConfig.openAiModels,
      commonPluginConfig: {
        tokenPrefix: AppConfig.openAiTokenPrefix,
        token: AppConfig.openAiToken,
        defaultHeaders: {
          'Content-Type': 'application/json'
        },
        defaultRequestData: {
          model: AppConfig.openAiModels[0],
          stream: true
        },
        requiredToken: true,
        requestDataSerializer: (data) => JSON.stringify(data)
      }
    }).usePlugin(container.get(RequestLogger));

    const abortPlugin = container.get(FetchAbortPlugin);

    const feApi = new FeApi({
      abortPlugin,
      config: {
        responseType: 'json',
        baseURL: AppConfig.feApiBaseUrl
      }
    })
      .usePlugin(new FetchURLPlugin())
      .usePlugin(
        new RequestCommonPlugin({
          tokenPrefix: AppConfig.openAiTokenPrefix,
          requiredToken: true,
          token: () => thisArgs.get(IOCIdentifier.FeApiToken).getToken()
        })
      )
      .usePlugin(thisArgs.get(FeApiMockPlugin))
      .usePlugin(container.get(RequestLogger))
      .usePlugin(abortPlugin);

    container.bind(OpenAIClient).toConstantValue(openAiApi);
    container.bind(FeApi).toConstantValue(feApi);
  }
}
