import { RequestErrorID, RequestAdapterFetch } from '../../../src/request';

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

  describe('RequestAdapterFetch - Request execution', () => {
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

      const adapter = new RequestAdapterFetch({
        url: '/users',
        baseURL: 'https://api.example.com',
        fetcher: configFetcher
      });

      const responseData = { id: 1 };
      const mockResponse = new Response(JSON.stringify(responseData));
      requestFetcher.mockResolvedValue(mockResponse);

      const result = await adapter.request<Request, Response>({
        url: '/users',
        fetcher: requestFetcher
      });

      expect(requestFetcher).toHaveBeenCalled();
      expect(configFetcher).not.toHaveBeenCalled();
      await expect(result.data.json()).resolves.toEqual(responseData);
    });

    it('should execute request with correct method', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: 'https://api.example.com/users',
        method: 'POST'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('POST');
    });

    it('should handle request body data', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ success: true }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      const requestData = JSON.stringify({ name: 'John' });
      await adapter.request({
        url: 'https://api.example.com/users',
        method: 'POST',
        data: requestData as any
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.method).toBe('POST');
      expect(callArg.url).toBe('https://api.example.com/users');
    });

    it('should return response with correct structure', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const responseData = { id: 1, name: 'test' };
      const mockResponse = new Response(JSON.stringify(responseData), {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await adapter.request({
        url: 'http://localhost:3000/users'
      });

      expect(result.status).toBe(200);
      expect(result.statusText).toBe('OK');
      expect(result.headers).toHaveProperty('content-type');
      expect(result.data).toBeInstanceOf(Response);
      expect(result.config.url).toBe('http://localhost:3000/users');
      expect(result.response).toBe(mockResponse);
    });

    it('should handle URL error', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const networkError = new Error('Network error');
      fetchMock.mockRejectedValueOnce(networkError);

      await expect(
        adapter.request({
          url: '/users'
        })
      ).rejects.toThrow('Failed to parse URL from /users');
    });

    it('should merge default config with request config', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        method: 'GET',
        headers: { Authorization: 'Bearer token' },
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: '/users',
        headers: { 'X-Custom': 'value' }
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.url).toBe('https://api.example.com/users');
      expect(callArg.headers.get('Authorization')).toBe('Bearer token');
      expect(callArg.headers.get('X-Custom')).toBe('value');
    });

    it('should handle different HTTP methods', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const methods = [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'HEAD',
        'OPTIONS'
      ];

      for (const method of methods) {
        const mockResponse = new Response(JSON.stringify({ success: true }));
        fetchMock.mockResolvedValueOnce(mockResponse);

        await adapter.request({
          url: 'http://localhost:3000/test',
          method
        });

        expect(fetchMock).toHaveBeenCalled();
        const callArg = fetchMock.mock.calls[0][0];
        expect(callArg).toBeInstanceOf(Request);
        expect(callArg.method).toBe(method.toUpperCase());

        fetchMock.mockClear();
      }
    });

    it('should extract response headers correctly', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }), {
        headers: {
          'Content-Type': 'application/json',
          'X-Custom-Header': 'custom-value',
          'Cache-Control': 'no-cache'
        }
      });
      fetchMock.mockResolvedValueOnce(mockResponse);

      const result = await adapter.request({
        url: 'http://localhost:3000/users'
      });

      expect(result.headers).toEqual({
        'content-type': 'application/json',
        'x-custom-header': 'custom-value',
        'cache-control': 'no-cache'
      });
    });

    it('should handle fetch options correctly', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: 'https://api.example.com/users',
        credentials: 'include',
        cache: 'no-cache',
        mode: 'cors',
        redirect: 'follow'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.credentials).toBe('include');
      expect(callArg.cache).toBe('no-cache');
      expect(callArg.mode).toBe('cors');
      expect(callArg.redirect).toBe('follow');
    });

    it('should combine baseURL with relative URL', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: '/users'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.url).toBe('https://api.example.com/users');
    });

    it('should handle baseURL with trailing slash', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com/',
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: '/users'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.url).toBe('https://api.example.com/users');
    });

    it('should use absolute URL directly when provided', async () => {
      const adapter = new RequestAdapterFetch({
        baseURL: 'https://api.example.com',
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: 'https://another-api.com/data'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.url).toBe('https://another-api.com/data');
    });

    it('should handle URL without baseURL', async () => {
      const adapter = new RequestAdapterFetch({
        fetcher: fetchMock
      });

      const mockResponse = new Response(JSON.stringify({ id: 1 }));
      fetchMock.mockResolvedValueOnce(mockResponse);

      await adapter.request({
        url: 'https://api.example.com/users'
      });

      expect(fetchMock).toHaveBeenCalled();
      const callArg = fetchMock.mock.calls[0][0];
      expect(callArg).toBeInstanceOf(Request);
      expect(callArg.url).toBe('https://api.example.com/users');
    });
  });
});
