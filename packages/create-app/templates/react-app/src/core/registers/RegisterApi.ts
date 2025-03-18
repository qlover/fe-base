import { RequestLogger } from '@/uikit/utils/RequestLogger';
import { localJsonStorage } from '../globals';
import { FetchAbortPlugin, FetchURLPlugin } from '@qlover/fe-utils';
import { FeApiMockPlugin } from '@/base/apis/feApi';
import { OpenAIClient } from '@lib/openAiApi';
import { FeApi } from '@/base/apis/feApi';
import { RequestCommonPlugin } from '@lib/request-common-plugin';
import mockDataJson from '@config/feapi.mock.json';
import { Container } from 'inversify';
import type { IOCRegisterInterface } from '@/base/port/IOCContainerInterface';
import AppConfig from '@/core/AppConfig';

export class RegisterApi implements IOCRegisterInterface<Container> {
  register(container: Container): void {
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
        baseURL: 'https://api.example.com/'
      }
    })
      .usePlugin(new FetchURLPlugin())
      .usePlugin(
        new RequestCommonPlugin({
          tokenPrefix: AppConfig.openAiTokenPrefix,
          requiredToken: true,
          token: () => localJsonStorage.getItem('fe_user_token')
        })
      )
      .usePlugin(new FeApiMockPlugin(mockDataJson))
      .usePlugin(container.get(RequestLogger))
      .usePlugin(abortPlugin);

    container.bind(OpenAIClient).toConstantValue(openAiApi);
    container.bind(FeApi).toConstantValue(feApi);
  }
}
