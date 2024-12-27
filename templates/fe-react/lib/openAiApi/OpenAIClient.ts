import {
  RequestScheduler,
  RequestAdapterConfig,
  RequestAdapterFetch,
  RequestAdapterFetchConfig,
  FetchURLPlugin,
  RequestAdapterResponse
} from '@qlover/fe-utils';
import {
  ApiCommonPlugin,
  ApiCommonPluginConfig
} from '../plugins/ApiCommonPlugin';
import { StreamResultType } from './StreamProcessor';
import { OpenAIAuthPlugin } from './OpenAIAuthPlugin';

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
  apiCommon: ApiCommonPluginConfig;
};

export type OpenAIClientConfig = Partial<RequestAdapterFetchConfig> &
  OpenAIAargs;

export class OpenAIClient extends RequestScheduler<RequestAdapterConfig> {
  constructor(config: OpenAIClientConfig) {
    const { apiCommon, ...rest } = config;
    super(new RequestAdapterFetch(rest));

    this.usePlugin(new FetchURLPlugin());
    this.usePlugin(new ApiCommonPlugin(apiCommon));
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
