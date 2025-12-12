import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import type { AppConfig } from '@/base/cases/AppConfig';
import { I } from '@config/IOCIdentifier';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

@injectable()
export class AIService {
  protected apiKey: string;
  protected baseUrl: string;
  protected client: OpenAI;

  constructor(@inject(I.AppConfig) appConfig: AppConfig) {
    this.apiKey = appConfig.openaiApiKey;
    this.baseUrl = appConfig.openaiBaseUrl;

    console.log(this.apiKey, this.baseUrl);
    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl
    });
  }

  public async completions(
    messages: ChatCompletionMessageParam[]
  ): Promise<unknown> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        messages: messages,
        model: 'claude-sonnet-4-20250514'
      }),
      headers: {
        Authorization: `token ${this.apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      mode: 'cors'
    });

    return await response.json();
  }
}
