import { describe, expect, it } from 'vitest';
import {
  LLM_CHAT_STREAM_PART_KIND,
  extractChatMessageReasoning,
  readOpenAiChatDeltaParts
} from '../src/index';

describe('OpenAiChatStreamUtil', () => {
  it('readOpenAiChatDeltaParts extracts reasoning and text', () => {
    const parts = readOpenAiChatDeltaParts({
      reasoning_content: 'think',
      content: 'hello'
    });
    expect(parts).toEqual([
      { kind: LLM_CHAT_STREAM_PART_KIND.REASONING, text: 'think' },
      { kind: LLM_CHAT_STREAM_PART_KIND.TEXT, text: 'hello' }
    ]);
  });

  it('readOpenAiChatDeltaParts supports reasoning field', () => {
    const parts = readOpenAiChatDeltaParts({ reasoning: 'r', content: 'c' });
    expect(parts[0]).toEqual({
      kind: LLM_CHAT_STREAM_PART_KIND.REASONING,
      text: 'r'
    });
  });

  it('extractChatMessageReasoning prefers reasoning_content', () => {
    expect(
      extractChatMessageReasoning({
        reasoning_content: ' a ',
        reasoning: 'b'
      })
    ).toBe('a');
  });
});
