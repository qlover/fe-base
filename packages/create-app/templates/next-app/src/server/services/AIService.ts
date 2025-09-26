import { inject, injectable } from 'inversify';
import OpenAI from 'openai';
import type { AppConfig } from '@/base/cases/AppConfig';
import { I } from '@config/IOCIdentifier';

@injectable()
export class AIService {
  protected apiKey: string;
  protected baseUrl: string;
  protected client: OpenAI;

  constructor(@inject(I.AppConfig) appConfig: AppConfig) {
    this.apiKey = appConfig.openaiApiKey;
    this.baseUrl = appConfig.openaiBaseUrl;

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl
    });
  }

  async completions(messages: Record<string, any>[]): Promise<unknown> {
    const completion = await this.client.chat.completions.create({
      messages: messages,
      model: 'gpt-3.5-turbo'
    });

    return completion;
  }
}
