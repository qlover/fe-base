import { createLlmAgent } from './createLlmAgent';
import type {
  LlmAgentOptionsType,
  LlmChatCompletionType,
  LlmChatMessageType,
  LlmCompletionsParamsType
} from './types/LlmTypes';

export type ChatCompletionInputType = LlmAgentOptionsType & {
  readonly messages: readonly LlmChatMessageType[];
  readonly params?: LlmCompletionsParamsType;
};

/**
 * 一次性非流式补全（函数入口；内部创建短生命周期 Agent）。
 */
export async function chatCompletion(
  input: ChatCompletionInputType
): Promise<LlmChatCompletionType> {
  const { messages, params, ...options } = input;
  return createLlmAgent(options).completions(messages, params);
}
