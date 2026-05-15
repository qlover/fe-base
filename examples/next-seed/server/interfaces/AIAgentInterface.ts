import type OpenAI from 'openai';
import type { ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions.mjs';
import type { EmbeddingCreateParams } from 'openai/resources/embeddings.mjs';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

export interface AIAgentInterface {
  completions(
    messages: ChatCompletionMessageParam[],
    params?: Omit<ChatCompletionCreateParamsBase, 'messages'>
  ): Promise<OpenAI.Chat.Completions.ChatCompletion>;

  embeddings(
    params: EmbeddingCreateParams
  ): Promise<OpenAI.Embeddings.CreateEmbeddingResponse>;
}
