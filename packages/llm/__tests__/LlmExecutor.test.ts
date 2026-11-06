import { afterEach, describe, expect, it, vi } from 'vitest';
import { LlmError, createLlmAgent } from '../src/index';
import {
  LlmRetryPlugin,
  LlmTimeoutPlugin,
  createLlmExecutor
} from '../src/executor';

describe('LlmExecutor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('without plugins just runs agent once', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: 'ok' } }]
        })
    });
    const executor = createLlmExecutor({
      agent: createLlmAgent({
        apiKey: 'k',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        fetch: fetchMock as unknown as typeof fetch
      })
    });
    const result = await executor.completions([
      { role: 'user', content: 'hi' }
    ]);
    expect(result.choices[0]?.message?.content).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('retries via LlmRetryPlugin on 503', async () => {
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

    const executor = createLlmExecutor({
      agent: createLlmAgent({
        apiKey: 'k',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        fetch: fetchMock as unknown as typeof fetch
      })
    }).use(new LlmRetryPlugin({ maxRetries: 3, retryDelayMs: 0 }));

    const result = await executor.completions([
      { role: 'user', content: 'hi' }
    ]);
    expect(result.choices[0]?.message?.content).toBe('ok');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('LlmRetryPlugin does not retry AbortError', async () => {
    const fetchMock = vi.fn().mockImplementation(() => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    });
    const executor = createLlmExecutor({
      agent: createLlmAgent({
        apiKey: 'k',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        fetch: fetchMock as unknown as typeof fetch
      })
    }).use(new LlmRetryPlugin({ maxRetries: 3, retryDelayMs: 0 }));

    await expect(
      executor.completions([{ role: 'user', content: 'hi' }])
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('LlmRetryPlugin does not retry 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => 'nope'
    });
    const executor = createLlmExecutor({
      agent: createLlmAgent({
        apiKey: 'k',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        fetch: fetchMock as unknown as typeof fetch
      })
    }).use(new LlmRetryPlugin({ maxRetries: 3, retryDelayMs: 0 }));

    await expect(
      executor.completions([{ role: 'user', content: 'hi' }])
    ).rejects.toBeInstanceOf(LlmError);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('LlmTimeoutPlugin merges signal when used', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      text: async () =>
        JSON.stringify({
          choices: [{ message: { content: 'x' } }]
        })
    });
    const executor = createLlmExecutor({
      agent: createLlmAgent({
        apiKey: 'k',
        baseUrl: 'https://api.example.com/v1',
        model: 'm',
        fetch: fetchMock as unknown as typeof fetch
      }),
      plugins: [new LlmTimeoutPlugin()]
    });
    const external = new AbortController();
    await executor.completions([{ role: 'user', content: 'hi' }], undefined, {
      signal: external.signal,
      timeoutMs: 5_000
    });
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBeDefined();
  });
});
