import { createLlmAgent } from './createLlmAgent';
import type {
  LlmAgentOptionsType,
  LlmChatMessageType,
  LlmChatStreamPartType,
  LlmStreamChatOptionsType
} from './types/LlmTypes';

export type StreamChatPartsInputType = LlmAgentOptionsType & {
  readonly messages: readonly LlmChatMessageType[];
  readonly signal?: AbortSignal;
  readonly params?: LlmStreamChatOptionsType['params'];
};

/**
 * 一次性流式分片（函数入口）。
 */
export async function* streamChatParts(
  input: StreamChatPartsInputType
): AsyncGenerator<LlmChatStreamPartType, void, void> {
  const { messages, signal, params, ...options } = input;
  yield* createLlmAgent(options).streamChatParts(messages, {
    signal,
    params
  });
}
