import { RequestErrorID, RequestError } from '../../../interface';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FetchURLPlugin, RequestAdapterFetch } from '../..';

describe('RequestError', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('should throw error if no fetcher provided and no global fetch', () => {
    const tempFetch = globalThis.fetch;
    delete (globalThis as Record<string, unknown>).fetch;

    expect(
      () =>
        new RequestAdapterFetch({
          url: '/users',
          baseURL: 'https://api.example.com'
        })
    ).toThrow('ENV_FETCH_NOT_SUPPORT');

    globalThis.fetch = tempFetch;
  });

  it('should throw network error', () => {
    const error = new RequestError('FETCHER_NONE', new Error('Network error'));
    expect(error.message).toBe('Network error');
  });

  it('should create an error with the correct message and original error', () => {
    const error = new RequestError('FETCHER_NONE');
    expect(error.message).toBe('FETCHER_NONE');
  });

  it('should catch ok status', async () => {
    const request = new RequestAdapterFetch({
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.usePlugin(new FetchURLPlugin());

    // create a more complete Response mock
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      body: null,
      bodyUsed: false,
      url: 'https://api.example.com/users',
      type: 'default',
      redirected: false,
      json: () => Promise.resolve({ error: 'Not Found' }),
      text: () => Promise.resolve('Not Found'),
      clone: function () {
        return this;
      }
    } as Response;

    fetchMock.mockResolvedValueOnce(mockResponse);

    await expect(request.request({ url: '/users' })).rejects.toMatchObject({
      message: 'Request failed with status: 404 Not Found',
      id: RequestErrorID.RESPONSE_NOT_OK,
      response: mockResponse
    });
  });
});
