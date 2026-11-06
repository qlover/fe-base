import { OpenAiCompatibleAgent } from './agents/OpenAiCompatibleAgent';
import type { LlmAgentInterface } from './interfaces/LlmAgentInterface';
import type { LlmAgentOptionsType } from './types/LlmTypes';

/**
 * 工厂：创建 OpenAI 兼容 Agent（class 入口的函数糖）。
 */
export function createLlmAgent(
  options: LlmAgentOptionsType
): LlmAgentInterface {
  return new OpenAiCompatibleAgent(options);
}
