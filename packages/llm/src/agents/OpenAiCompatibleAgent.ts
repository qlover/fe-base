import { LlmError } from '../errors/LlmError';
import type { LlmAgentInterface } from '../interfaces/LlmAgentInterface';
import {
  LLM_CHAT_STREAM_PART_KIND,
  type LlmAgentOptionsType,
  type LlmChatCompletionType,
  type LlmChatMessageType,
  type LlmChatStreamPartType,
  type LlmCompletionsParamsType,
  type LlmStreamChatOptionsType
} from '../types/LlmTypes';
import { iterateOpenAiChatStreamPartsFromSse } from '../utils/OpenAiChatStreamUtil';

/**
 * OpenAI 兼容 chat 客户端（原生 fetch，浏览器 / Node 通用）。
 * Ollama 的 OpenAI 兼容端点也可直接使用。
 */
export class OpenAiCompatibleAgent implements LlmAgentInterface {
  protected readonly apiKey: string;
  protected readonly baseUrl: string;
  protected readonly model: string;
  protected readonly authScheme: string;
  protected readonly fetchImpl: typeof fetch;

  constructor(options: LlmAgentOptionsType) {
    const apiKey = options.apiKey.trim();
    const baseUrl = options.baseUrl.trim().replace(/\/$/, '');
    const model = options.model.trim();
    if (!apiKey) {
      throw new LlmError('apiKey is required');
    }
    if (!baseUrl) {
      throw new LlmError('baseUrl is required');
    }
    if (!model) {
      throw new LlmError('model is required');
    }
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.authScheme = (options.authScheme ?? 'Bearer').trim() || 'Bearer';
    this.fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  }

  /**
   * @override
   */
  public async completions(
    messages: readonly LlmChatMessageType[],
    params?: LlmCompletionsParamsType
  ): Promise<LlmChatCompletionType> {
    const response = await this.fetchImpl(this.chatCompletionsUrl(), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        ...params,
        messages,
        stream: false
      })
    });
    const text = await response.text();
    if (!response.ok) {
      throw new LlmError(
        `LLM completions failed: ${response.status} ${response.statusText}`,
        { status: response.status, body: text.slice(0, 500) }
      );
    }
    let parsed: LlmChatCompletionType;
    try {
      parsed = JSON.parse(text) as LlmChatCompletionType;
    } catch (cause: unknown) {
      throw new LlmError('LLM completions response is not JSON', {
        status: response.status,
        body: text.slice(0, 500),
        cause
      });
    }
    if (!Array.isArray(parsed.choices)) {
      throw new LlmError('LLM completions missing choices', {
        status: response.status,
        body: text.slice(0, 500)
      });
    }
    return parsed;
  }

  /**
   * @override
   */
  public async *streamChatParts(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<LlmChatStreamPartType, void, void> {
    const response = await this.fetchImpl(this.chatCompletionsUrl(), {
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        model: this.model,
        ...options?.params,
        messages,
        stream: true
      }),
      signal: options?.signal
    });
    if (!response.ok) {
      const text = await response.text();
      throw new LlmError(
        `LLM stream failed: ${response.status} ${response.statusText}`,
        { status: response.status, body: text.slice(0, 500) }
      );
    }
    yield* iterateOpenAiChatStreamPartsFromSse(response.body, options?.signal);
  }

  /**
   * @override
   */
  public async *streamChatText(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncGenerator<string, void, void> {
    for await (const part of this.streamChatParts(messages, options)) {
      if (part.kind === LLM_CHAT_STREAM_PART_KIND.TEXT) {
        yield part.text;
      }
    }
  }

  protected chatCompletionsUrl(): string {
    return `${this.baseUrl}/chat/completions`;
  }

  protected buildHeaders(): Record<string, string> {
    return {
      Authorization: `${this.authScheme} ${this.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    };
  }
}
