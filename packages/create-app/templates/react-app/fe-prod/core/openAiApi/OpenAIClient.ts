import {
  type RequestAdapterConfig,
  type RequestAdapterFetchConfig,
  type RequestAdapterResponse,
  RequestScheduler,
  RequestAdapterFetch,
  FetchURLPlugin
} from '@qlover/fe-corekit';
import {
  type RequestCommonPluginConfig,
  RequestCommonPlugin
} from '../request-plugins';
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
