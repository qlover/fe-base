import { RequestAdapterFetch, RequestError } from '../../src/request';

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
});
