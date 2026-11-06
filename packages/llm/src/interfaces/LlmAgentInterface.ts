import type {
  LlmChatCompletionType,
  LlmChatMessageType,
  LlmChatStreamPartType,
  LlmCompletionsParamsType,
  LlmStreamChatOptionsType
} from '../types/LlmTypes';

/**
 * 通用 LLM Agent 契约（OpenAI 兼容 chat）。
 */
export interface LlmAgentInterface {
  /**
   * 非流式 chat completions。
   */
  completions(
    messages: readonly LlmChatMessageType[],
    params?: LlmCompletionsParamsType
  ): Promise<LlmChatCompletionType>;

  /**
   * 流式 chat：仅正文增量（非累计）。
   */
  streamChatText(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncIterable<string>;

  /**
   * 流式 chat：reasoning / text 分片（非累计）。
   */
  streamChatParts(
    messages: readonly LlmChatMessageType[],
    options?: LlmStreamChatOptionsType
  ): AsyncIterable<LlmChatStreamPartType>;
}
