import type {
  InversifyRegisterInterface,
  InversifyRegisterContainer
} from '@/base/port/InversifyIocInterface';
import type { AppIOCContainer } from '../AppIOCContainer';

import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { ApiMockPlugin } from '@/base/cases/apisPlugins/ApiMockPlugin';
import { OpenAIClient } from '@lib/openAiApi';
import { FeApi } from '@/base/apis/feApi/FeApi';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
import AppConfig from '@/core/AppConfig';
import { IOCIdentifier } from '@/core/IOC';
import { ApiCatchPlugin } from '@/base/cases/apisPlugins/ApiCatchPlugin';

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
      .usePlugin(thisArgs.get(ApiMockPlugin))
      .usePlugin(container.get(RequestLogger))
      .usePlugin(abortPlugin)
      .usePlugin(container.get(ApiCatchPlugin));

    container.bind(OpenAIClient).toConstantValue(openAiApi);
    container.bind(FeApi).toConstantValue(feApi);
  }
}
