import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import type OpenAI from 'openai';
import type {
  ChatCompletionCreateParamsBase,
  ChatCompletionMessageParam
} from 'openai/resources/chat/completions';

@injectable()
export class AIService {
  constructor(
    @inject(I.AppConfig)
    protected readonly appConfig: SeedServerConfigInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  protected async resolveCredentials(): Promise<{
    apiKey: string;
    baseUrl: string;
  }> {
    const [siteKey, siteBaseUrl] = await Promise.all([
      this.siteSettings.getSecretString(FE_SITE_SETTING_KEYS.OPENAI_API_KEY),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.OPENAI_BASE_URL)
    ]);

    return {
      apiKey: siteKey.trim() || this.appConfig.openaiApiKey,
      baseUrl: siteBaseUrl.trim() || this.appConfig.openaiBaseUrl
    };
  }

  public async completions(
    messages: ChatCompletionMessageParam[],
    params?: Omit<ChatCompletionCreateParamsBase, 'messages'>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    const { apiKey, baseUrl } = await this.resolveCredentials();
    if (!apiKey || !baseUrl) {
      throw new Error('OpenAI API key and base URL are required');
    }

    const url = `${baseUrl.replace(/\/$/, '')}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        ...params,
        messages
      }),
      headers: {
        Authorization: `token ${apiKey}`,
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
