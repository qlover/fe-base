import { afterEach, describe, expect, it, vi } from 'vitest';
import { LlmError, createLlmAgent } from '../src/index';
import { createLlmExecutor } from '../src/executor';

describe('LlmExecutor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('retries completions on 503 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        text: async () => 'busy'
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        text: async () =>
          JSON.stringify({
            choices: [{ message: { content: 'ok' } }]
          })
      });

    const agent = createLlmAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    const executor = createLlmExecutor({
      agent,
      retry: { maxRetries: 3, retryDelayMs: 0 }
    });

    const result = await executor.completions([
      { role: 'user', content: 'hi' }
    ]);
    expect(result.choices[0]?.message?.content).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry AbortError', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    const agent = createLlmAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    const executor = createLlmExecutor({
      agent,
      retry: { maxRetries: 3, retryDelayMs: 0 }
    });

    await expect(
      executor.completions([{ role: 'user', content: 'hi' }])
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not retry 401 LlmError', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'nope'
    });
    const agent = createLlmAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    const executor = createLlmExecutor({
      agent,
      retry: { maxRetries: 3, retryDelayMs: 0 }
    });

    await expect(
      executor.completions([{ role: 'user', content: 'hi' }])
    ).rejects.toBeInstanceOf(LlmError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('passes merged abort signal into completions fetch', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: 'x' } }]
        })
    });
    const agent = createLlmAgent({
      apiKey: 'k',
      baseUrl: 'https://api.example.com/v1',
      model: 'm',
      fetch: fetchMock as unknown as typeof fetch
    });
    const executor = createLlmExecutor({
      agent,
      retry: false,
      timeoutMs: 5_000
    });
    const external = new AbortController();
    await executor.completions([{ role: 'user', content: 'hi' }], undefined, {
      signal: external.signal
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeDefined();
  });
});
