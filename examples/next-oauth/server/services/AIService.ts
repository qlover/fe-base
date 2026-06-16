import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type OpenAI from 'openai';
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions';

@injectable()
export class AIService {
  protected apiKey: string;
  protected baseUrl: string;

  constructor(@inject(I.AppConfig) appConfig: SeedServerConfigInterface) {
    if (!appConfig.openaiApiKey || !appConfig.openaiBaseUrl) {
      throw new Error('OpenAI API key and base URL are required');
    }

    this.apiKey = appConfig.openaiApiKey;
    this.baseUrl = appConfig.openaiBaseUrl;
  }

  public async completions(
    messages: ChatCompletionMessageParam[],
    params?: Omit<ChatCompletionCreateParamsBase, 'messages'>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        ...params,
        messages
      }),
      headers: {
        Authorization: `token ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `AI completions failed: ${response.status} ${response.statusText} - ${text}`
      );
    }

    return (await response.json()) as OpenAI.Chat.Completions.ChatCompletion;
  }
}
