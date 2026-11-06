import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LlmError,
  OpenAiCompatibleAgent,
  chatCompletion,
  createLlmAgent
} from '../src/index';

describe('OpenAiCompatibleAgent', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rejects empty credentials', () => {
    expect(
      () =>
        new OpenAiCompatibleAgent({
          apiKey: ' ',
          baseUrl: 'https://api.example.com/v1',
          model: 'm'
        })
    ).toThrow(LlmError);
  });

  it('completions posts JSON and returns choices', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          choices: [{ message: { role: 'assistant', content: 'hi' } }]
        })
    });
    vi.stubGlobal('fetch', fetchMock);

    const agent = createLlmAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1/',
      model: 'gpt-test'
    });
    const result = await agent.completions([{ role: 'user', content: 'ping' }]);
    expect(result.choices[0]?.message?.content).toBe('hi');
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/v1/chat/completions');
    expect(String((init.headers as Record<string, string>).Authorization)).toBe(
      'Bearer k'
    );
    const body = JSON.parse(String(init.body)) as {
      model: string;
      stream: boolean;
    };
    expect(body.model).toBe('gpt-test');
    expect(body.stream).toBe(false);
  });

  it('supports token auth scheme', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: 'ok' } }]
        })
    });
    const result = await chatCompletion({
      apiKey: 'secret',
      baseUrl: 'https://gw.example/v1',
      model: 'm',
      authScheme: 'token',
      fetch: fetchMock as unknown as typeof fetch,
      messages: [{ role: 'user', content: 'x' }]
    });
    expect(result.choices[0]?.message?.content).toBe('ok');
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(String((init.headers as Record<string, string>).Authorization)).toBe(
      'token secret'
    );
  });

  it('throws LlmError on HTTP failure', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'nope'
    });
    const agent = new OpenAiCompatibleAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    await expect(
      agent.completions([{ role: 'user', content: 'x' }])
    ).rejects.toBeInstanceOf(LlmError);
  });

  it('streamChatParts parses SSE deltas', async () => {
    const sse = [
      'data: {"choices":[{"delta":{"reasoning_content":"r1"}}]}',
      '',
      'data: {"choices":[{"delta":{"content":"hello"}}]}',
      '',
      'data: [DONE]',
      ''
    ].join('\n');
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(sse));
        controller.close();
      }
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      body: stream
    });
    const agent = new OpenAiCompatibleAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    const parts: Array<{ kind: string; text: string }> = [];
    for await (const part of agent.streamChatParts([
      { role: 'user', content: 'hi' }
    ])) {
      parts.push(part);
    }
    expect(parts).toEqual([
      { kind: 'reasoning', text: 'r1' },
      { kind: 'text', text: 'hello' }
    ]);
  });
});
