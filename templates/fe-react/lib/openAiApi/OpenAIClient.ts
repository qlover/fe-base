import {
  RequestScheduler,
  RequestAdpaterConfig,
  RequestAdapterFetch,
  RequestAdapterFetchConfig,
  FetchURLPlugin,
  // FetchResponseTypePlugin
} from '@qlover/fe-utils';
import { OpenAIAuthPlugin } from './OpenAIAuthPlugin';
import { FetchResponseTypePlugin } from './FetchResponseTypePlugin';
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

export type OpenAIAargs = Pick<OpenAIChatParmas, 'model' | 'stream'> & {
  apiKey: string;
};

export class OpenAIClient extends RequestScheduler<RequestAdpaterConfig> {
  constructor(config: Partial<RequestAdapterFetchConfig> & OpenAIAargs) {
    const { apiKey, model, stream, ...rest } = config;
    super(new RequestAdapterFetch(rest));

    if (!apiKey) {
      throw new Error('openai api key is required');
    }

    this.usePlugin(new FetchURLPlugin());
    // this.usePlugin(new FetchResponseTypePlugin());
    this.usePlugin(new OpenAIAuthPlugin({ apiKey, model, stream }));
  }

  async completion(params: OpenAIChatParmas) {
    return this.post({
      url: '/chat/completions',
      data: params,
      responseType: 'json'
    });
  }
}
