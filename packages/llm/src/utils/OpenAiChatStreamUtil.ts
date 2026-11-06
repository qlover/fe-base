import {
  LLM_CHAT_STREAM_PART_KIND,
  type LlmChatStreamPartType
} from '../types/LlmTypes';

type OpenAiChatDeltaLikeType = {
  readonly content?: string | null;
  readonly reasoning_content?: string | null;
  readonly reasoning?: string | null;
};

/**
 * 从单条 delta 抽出 reasoning / text 增量（非累计）。
 */
export function readOpenAiChatDeltaParts(
  delta: unknown
): readonly LlmChatStreamPartType[] {
  if (delta === null || typeof delta !== 'object') {
    return [];
  }
  const record = delta as OpenAiChatDeltaLikeType;
  const parts: LlmChatStreamPartType[] = [];

  const reasoning =
    typeof record.reasoning_content === 'string'
      ? record.reasoning_content
      : typeof record.reasoning === 'string'
        ? record.reasoning
        : '';
  if (reasoning.length > 0) {
    parts.push({
      kind: LLM_CHAT_STREAM_PART_KIND.REASONING,
      text: reasoning
    });
  }

  if (typeof record.content === 'string' && record.content.length > 0) {
    parts.push({
      kind: LLM_CHAT_STREAM_PART_KIND.TEXT,
      text: record.content
    });
  }

  return parts;
}

/**
 * 从非流式 message 抽出原生思考正文（若有）。
 */
export function extractChatMessageReasoning(message: unknown): string {
  if (message === null || typeof message !== 'object') {
    return '';
  }
  const record = message as {
    readonly reasoning_content?: unknown;
    readonly reasoning?: unknown;
  };
  if (
    typeof record.reasoning_content === 'string' &&
    record.reasoning_content.trim().length > 0
  ) {
    return record.reasoning_content.trim();
  }
  if (
    typeof record.reasoning === 'string' &&
    record.reasoning.trim().length > 0
  ) {
    return record.reasoning.trim();
  }
  return '';
}

/**
 * 解析 OpenAI 兼容 SSE 文本流，产出 delta 对象。
 */
export async function* iterateOpenAiSseDeltas(
  body: ReadableStream<Uint8Array> | null,
  signal?: AbortSignal
): AsyncGenerator<unknown, void, void> {
  if (body == null) {
    return;
  }
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  try {
    while (true) {
      if (signal?.aborted) {
        break;
      }
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() ?? '';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) {
          continue;
        }
        const payload = trimmed.slice(5).trim();
        if (!payload || payload === '[DONE]') {
          if (payload === '[DONE]') {
            return;
          }
          continue;
        }
        try {
          yield JSON.parse(payload) as unknown;
        } catch {
          // 忽略非整行 JSON 碎片
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * 从 SSE chunk 流抽出 chat 分片。
 */
export async function* iterateOpenAiChatStreamPartsFromSse(
  body: ReadableStream<Uint8Array> | null,
  signal?: AbortSignal
): AsyncGenerator<LlmChatStreamPartType, void, void> {
  for await (const chunk of iterateOpenAiSseDeltas(body, signal)) {
    if (chunk === null || typeof chunk !== 'object') {
      continue;
    }
    const delta = (
      chunk as {
        readonly choices?: readonly { readonly delta?: unknown }[];
      }
    ).choices?.[0]?.delta;
    for (const part of readOpenAiChatDeltaParts(delta)) {
      yield part;
    }
  }
}
