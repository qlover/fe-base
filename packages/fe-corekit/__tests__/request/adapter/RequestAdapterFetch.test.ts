import {
  RequestErrorID,
  RequestAdapterFetch,
  FetchURLPlugin
} from '../../../src/request';

describe('create a base requestAdapterFetch', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    fetchMock = vi.fn();
    fetchMock.mockReturnValue(
      new Response('Mock Response', { status: 200, statusText: 'OK' })
    );
    globalThis.fetch = fetchMock;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.clearAllMocks();
  });

  it('should create a and use native fetch', () => {
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api.example.com'
    });

    expect(adapter.getConfig().fetcher).toBe(fetchMock);
    expect(adapter.getConfig().baseURL).toBe('https://api.example.com');
  });

  it('should get the adapterResponse type', async () => {
    const adapter = new RequestAdapterFetch();

    const result = await adapter.request({
      url: 'https://api.example.com/users'
    });

    expect(result).toMatchObject({
      status: 200,
      statusText: 'OK',
      config: {
        url: 'https://api.example.com/users'
      }
    });
  });

  it('should parse the response data', async () => {
    const adapter = new RequestAdapterFetch();

    const result = await adapter.request({
      url: 'https://api.example.com/users'
    });

    const text = await (result.data as Response).text();

    expect(text).toBe('Mock Response');
  });

  it('should throw error when fetcher is not a function', () => {
    try {
      new RequestAdapterFetch({
        fetcher: null as unknown as typeof globalThis.fetch
      });
    } catch (error) {
      expect(error).toMatchObject({
        id: RequestErrorID.ENV_FETCH_NOT_SUPPORT
      });
    }
  });

  it('should update config using setConfig method', () => {
    const adapter = new RequestAdapterFetch({ baseURL: 'https://api1.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api1.com');

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
  });

  it('should merge partial config with setConfig', () => {
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api1.com',
      method: 'GET'
    });

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
    expect(adapter.getConfig().method).toBe('GET');
  });

  it('should allow updating multiple config properties with setConfig', () => {
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api1.com',
      method: 'GET'
    });

    adapter.setConfig({
      baseURL: 'https://api2.com',
      method: 'POST'
    });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
    expect(adapter.getConfig().method).toBe('POST');
  });
});

describe('RequestAdapterFetch', () => {
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

  it('should merge config fetcher with request fetcher', async () => {
    const configFetcher = vi.fn();
    const requestFetcher = vi.fn();

    const request = new RequestAdapterFetch({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: configFetcher
    });

    request.usePlugin(new FetchURLPlugin());

    const responseData = { id: 1 };
    const mockResponse = new Response(JSON.stringify(responseData));
    requestFetcher.mockResolvedValue(mockResponse);

    const result = await request.request<Request, Response>({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: requestFetcher
    });
    expect(requestFetcher).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users'
      })
    );
    expect(configFetcher).not.toHaveBeenCalled();
    await expect(result.data.json()).resolves.toEqual(responseData);
  });

  it('should execute request with correct URL', async () => {
    const request = new RequestAdapterFetch({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.usePlugin(new FetchURLPlugin());

    const mockResponse = new Response(JSON.stringify({ id: 1 }));
    fetchMock.mockResolvedValueOnce(mockResponse);

    await request.request({
      url: '/users',
      baseURL: 'https://api.example.com'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users'
      })
    );
  });

  it('should handle query parameters', async () => {
    const request = new RequestAdapterFetch({
      url: '/users',
      baseURL: 'https://api.example.com',
      params: { id: '1' },
      fetcher: fetchMock
    });

    request.usePlugin(new FetchURLPlugin());

    const mockResponse = new Response(JSON.stringify({ id: 1 }));
    fetchMock.mockResolvedValueOnce(mockResponse);

    await request.request({
      url: '/users',
      baseURL: 'https://api.example.com',
      params: { id: '1' }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'https://api.example.com/users?id=1'
      })
    );
  });

  it('should parse JSON response automatically', async () => {
    const request = new RequestAdapterFetch({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.usePlugin(new FetchURLPlugin());

    const responseData = { id: 1, name: 'test' };
    const mockResponse = new Response(JSON.stringify(responseData));
    fetchMock.mockResolvedValueOnce(mockResponse);

    const result = await request.request<Response, Record<string, unknown>>({
      url: '/users',
      baseURL: 'https://api.example.com'
    });

    expect(result.data).toBeInstanceOf(Response);
  });

  it('should handle request errors', async () => {
    const request = new RequestAdapterFetch({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.usePlugin(new FetchURLPlugin());

    const networkError = new Error('Network error');
    fetchMock.mockRejectedValueOnce(networkError);

    await expect(
      request.request({
        url: '/users',
        baseURL: 'https://api.example.com'
      })
    ).rejects.toMatchObject({
      message: networkError.message,
      id: RequestErrorID.REQUEST_ERROR
    });
  });
});
