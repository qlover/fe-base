import {
  RequestScheduler,
  RequestAdpaterConfig,
  RequestAdapterFetch,
  RequestAdapterFetchConfig,
  FetchURLPlugin,
  RequestAdapterResponse
} from 'packages/fe-utils/common';
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

export interface OpenAIError extends Error {
  response?: {
    status: number;
  };
}

export interface OpenAIChatParmas {
  model?: string;
  messages: ApiMessage[];
  stream?: boolean;
}

export type OpenAIAargs = {
  apiCommon: ApiCommonPluginConfig;
};

export class OpenAIClient extends RequestScheduler<RequestAdpaterConfig> {
  constructor(config: Partial<RequestAdapterFetchConfig> & OpenAIAargs) {
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
