import { IOCIdentifier } from '@config/IOCIdentifier';
import { type BootstrapExecutorPlugin } from '@qlover/corekit-bridge';
import {
  ExecutorContextInterface,
  LifecycleExecutor,
  RequestAdapterFetch,
  RequestAdapterFetchConfig,
  RequestExecutor,
  RequestPlugin
} from '@qlover/fe-corekit';
import { RequestLogger } from '../cases/RequestLogger';
import type { AppConfig } from '../cases/AppConfig';

const apiApiAdapter = new RequestAdapterFetch({
  responseType: 'json'
});

// 使用 RequestScheduler
const apiApi = new RequestExecutor(apiApiAdapter, new LifecycleExecutor<ExecutorContextInterface<RequestAdapterFetchConfig, unknown>>());

// 直接使用 adapter
// const apiApi = apiApiAdapter;

export const AiApiBootstarp: BootstrapExecutorPlugin = {
  pluginName: 'AiApiBootstarp',
  onBefore({ parameters: { ioc } }) {
    const appConfig = ioc.get<AppConfig>(IOCIdentifier.AppConfig);

    // dynamic set baseURL
    apiApiAdapter.config.baseURL = appConfig.aiApiBaseUrl;

    apiApi.use(
      new RequestPlugin({
        tokenPrefix: appConfig.aiApiTokenPrefix,
        token: appConfig.aiApiToken
      })
    );
    apiApi.use(ioc.get(IOCIdentifier.ApiMockPlugin));
    apiApi.use(ioc.get(RequestLogger));
  }
};

export function aiHello(data: {
  messages: { role: string; content: string }[];
}) {
  return apiApi.request<
    {
      id: string;
      object: string;
      created: number;
      choices: { message: { role: string; content: string } }[];
    },
    typeof data
  >({
    url: '/chat/completions',
    method: 'POST',
    data
  });
}
