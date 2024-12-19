import {
  RequestScheduler,
  RequestAdpaterConfig,
  RequestAdapterFetch,
  RequestAdapterFetchConfig
} from '@qlover/fe-utils';

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
  message: string;
  history?: ApiMessage[];
}

export interface OpenAIGenerateKeysParams {
  messages: ApiMessage[];
}

export class OpenAIClient extends RequestScheduler<RequestAdpaterConfig> {
  constructor(config?: Partial<RequestAdapterFetchConfig>) {
    super(new RequestAdapterFetch(config));
  }

  async completion(params: OpenAIChatParmas) {
    return this.request({
      url: '/chat/completions',
      data: params
    });
  }
}
