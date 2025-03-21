import {
  RequestScheduler,
  RequestAdapterConfig,
  RequestAdapterFetch,
  RequestAdapterFetchConfig,
  FetchURLPlugin,
  RequestAdapterResponse
} from '@qlover/fe-utils';
import { StreamResultType } from './StreamProcessor';
import { OpenAIAuthPlugin } from './OpenAIAuthPlugin';
import {
  RequestCommonPlugin,
  RequestCommonPluginConfig
} from '@lib/request-common-plugin';
export interface ApiMessage {
  content: string;
  role: 'user' | 'system' | 'assistant';
}

export interface OpenAIChatParmas {
  model?: string;
  messages: ApiMessage[];
  stream?: boolean;
}

export type OpenAIAargs = {
  commonPluginConfig: RequestCommonPluginConfig;
  models: string[];
};

export type OpenAIClientConfig = Partial<RequestAdapterFetchConfig> &
  OpenAIAargs;

export class OpenAIClient extends RequestScheduler<RequestAdapterConfig> {
  constructor(config: OpenAIClientConfig) {
    const { commonPluginConfig, ...rest } = config;
    super(new RequestAdapterFetch(rest));

    this.usePlugin(new FetchURLPlugin());
    this.usePlugin(new RequestCommonPlugin(commonPluginConfig));
    this.usePlugin(new OpenAIAuthPlugin());
  }

  async completion(
    params: OpenAIChatParmas
  ): Promise<RequestAdapterResponse<StreamResultType>> {
    return this.post('/chat/completions', {
      data: params
    });
  }
}
