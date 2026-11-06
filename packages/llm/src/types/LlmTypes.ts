/**
 * OpenAI 兼容 chat message（最小字段，便于同构使用）。
 */
export type LlmChatMessageType = {
  readonly role: 'system' | 'user' | 'assistant' | 'tool' | 'developer';
  readonly content: string | null;
  readonly name?: string;
  readonly tool_call_id?: string;
};

/**
 * 非流式 completions 可覆盖参数（不含 messages）。
 */
export type LlmCompletionsParamsType = {
  readonly model?: string;
  readonly temperature?: number;
  readonly max_tokens?: number;
  readonly top_p?: number;
  readonly stop?: string | readonly string[];
} & Readonly<Record<string, unknown>>;

export type LlmStreamChatOptionsType = {
  readonly signal?: AbortSignal;
  readonly params?: LlmCompletionsParamsType;
};

/**
 * 非流式 chat completion 最小响应形状。
 */
export type LlmChatCompletionType = {
  readonly id?: string;
  readonly object?: string;
  readonly created?: number;
  readonly model?: string;
  readonly choices: readonly {
    readonly index?: number;
    readonly message?: {
      readonly role?: string;
      readonly content?: string | null;
      readonly reasoning_content?: string | null;
      readonly reasoning?: string | null;
    };
    readonly finish_reason?: string | null;
  }[];
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
    readonly total_tokens?: number;
  };
};

export const LLM_CHAT_STREAM_PART_KIND = {
  REASONING: 'reasoning',
  TEXT: 'text'
} as const;

export type LlmChatStreamPartKindType =
  (typeof LLM_CHAT_STREAM_PART_KIND)[keyof typeof LLM_CHAT_STREAM_PART_KIND];

export type LlmChatStreamPartType = {
  readonly kind: LlmChatStreamPartKindType;
  readonly text: string;
};

/**
 * Agent 构造选项。凭证由调用方注入，包内不读站点设置 / env。
 */
export type LlmAgentOptionsType = {
  readonly apiKey: string;
  readonly baseUrl: string;
  /** 默认模型；单次调用可被 params.model 覆盖。 */
  readonly model: string;
  /**
   * Authorization 方案。默认 `Bearer`；部分网关用 `token`。
   */
  readonly authScheme?: 'Bearer' | 'token' | string;
  /** 可注入自定义 fetch（浏览器 / 代理 / 测试）。 */
  readonly fetch?: typeof fetch;
};
