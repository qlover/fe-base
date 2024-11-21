import {
  FetchRequest,
  FetchRequestError,
  FetchRequestErrorID,
  FetchURLPlugin
} from '../common/request';

describe('FetchURLPlugin', () => {
  let plugin: FetchURLPlugin;

  beforeEach(() => {
    plugin = new FetchURLPlugin();
  });

  describe('isFullURL', () => {
    it('should correctly identify full URLs', () => {
      expect(plugin.isFullURL('http://example.com')).toBe(true);
      expect(plugin.isFullURL('https://example.com')).toBe(true);
      expect(plugin.isFullURL('/api/users')).toBe(false);
      expect(plugin.isFullURL('api/users')).toBe(false);
    });
  });

  describe('appendQueryParams', () => {
    it('should correctly append query parameters', () => {
      const url = 'https://api.example.com/users';
      const params = { id: '1', name: 'test' };
      const result = plugin.appendQueryParams(url, params);
      const resultUrl = new URL(result);
      expect(resultUrl.origin + resultUrl.pathname).toBe(
        'https://api.example.com/users'
      );
      expect(resultUrl.searchParams.get('id')).toBe('1');
      expect(resultUrl.searchParams.get('name')).toBe('test');
    });

    it('should merge existing query parameters', () => {
      const url = 'https://api.example.com/users?page=1';
      const params = { size: '10' };
      const result = plugin.appendQueryParams(url, params);
      const resultUrl = new URL(result);
      expect(resultUrl.origin + resultUrl.pathname).toBe(
        'https://api.example.com/users'
      );
      expect(resultUrl.searchParams.get('page')).toBe('1');
      expect(resultUrl.searchParams.get('size')).toBe('10');
    });
  });

  describe('buildUrl', () => {
    it('should correctly build URL with baseURL', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com'
      };
      const result = plugin.buildUrl(config);
      expect(result).toBe('https://api.example.com/users');
    });

    it('should handle slashes in baseURL and path', () => {
      const config = {
        url: '/users/',
        baseURL: 'https://api.example.com/'
      };
      const result = plugin.buildUrl(config);
      expect(result.replace(/\/$/, '')).toBe('https://api.example.com/users');
    });

    it('should preserve full URLs', () => {
      const config = {
        url: 'https://other.example.com/api',
        baseURL: 'https://api.example.com'
      };
      const result = plugin.buildUrl(config);
      expect(result).toBe('https://other.example.com/api');
    });

    it('should add query parameters', () => {
      const config = {
        url: '/users',
        baseURL: 'https://api.example.com',
        params: { id: '1', name: 'test' }
      };
      const result = plugin.buildUrl(config);
      const resultUrl = new URL(result);
      expect(resultUrl.origin + resultUrl.pathname).toBe(
        'https://api.example.com/users'
      );
      expect(resultUrl.searchParams.get('id')).toBe('1');
      expect(resultUrl.searchParams.get('name')).toBe('test');
    });
  });
});

describe('FetchRequest', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should merge config fetcher with request fetcher', async () => {
    const configFetcher = jest.fn();
    const requestFetcher = jest.fn();

    const request = new FetchRequest({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: configFetcher
    });

    request.executor.use(new FetchURLPlugin());

    const responseData = { id: 1 };
    const mockResponse = new Response(JSON.stringify(responseData));
    requestFetcher.mockResolvedValue(mockResponse);

    const response = await request.request({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: requestFetcher
    });

    expect(requestFetcher).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        signal: undefined
      })
    );
    expect(configFetcher).not.toHaveBeenCalled();
    const result = await response.json();
    expect(result).toEqual(responseData);
  });

  it('should execute request with correct URL', async () => {
    const request = new FetchRequest({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.executor.use(new FetchURLPlugin());

    const mockResponse = new Response(JSON.stringify({ id: 1 }));
    fetchMock.mockResolvedValueOnce(mockResponse);

    await request.request({
      url: '/users',
      baseURL: 'https://api.example.com'
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({
        signal: undefined
      })
    );
  });

  it('should handle query parameters', async () => {
    const request = new FetchRequest({
      url: '/users',
      baseURL: 'https://api.example.com',
      params: { id: '1' },
      fetcher: fetchMock
    });

    request.executor.use(new FetchURLPlugin());

    const mockResponse = new Response(JSON.stringify({ id: 1 }));
    fetchMock.mockResolvedValueOnce(mockResponse);

    await request.request({
      url: '/users',
      baseURL: 'https://api.example.com',
      params: { id: '1' }
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users?id=1',
      expect.objectContaining({
        signal: undefined
      })
    );
  });

  it('should parse JSON response automatically', async () => {
    const request = new FetchRequest({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.executor.use(new FetchURLPlugin());

    const responseData = { id: 1, name: 'test' };
    const mockResponse = new Response(JSON.stringify(responseData));
    fetchMock.mockResolvedValueOnce(mockResponse);

    const response = await request.request({
      url: '/users',
      baseURL: 'https://api.example.com'
    });

    expect(response).toBeInstanceOf(Response);
    const result = await response.json();
    expect(result).toEqual(responseData);
  });

  it('should handle request errors', async () => {
    const request = new FetchRequest({
      url: '/users',
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.executor.use(new FetchURLPlugin());

    const networkError = new Error('Network error');
    fetchMock.mockRejectedValueOnce(networkError);

    await expect(
      request.request({
        url: '/users',
        baseURL: 'https://api.example.com'
      })
    ).rejects.toMatchObject({
      message: 'Network error',
      originalError: networkError
    });
  });
});

describe('FetchRequestError', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  it('should throw error if no fetcher provided and no global fetch', () => {
    const tempFetch = global.fetch;
    delete (global as any).fetch;

    expect(
      () =>
        new FetchRequest({
          url: '/users',
          baseURL: 'https://api.example.com'
        })
    ).toThrow('ENV_FETCH_NOT_SUPPORT');

    global.fetch = tempFetch;
  });

  it('should throw network error', () => {
    const error = new FetchRequestError(
      'FETCHER_NONE',
      new Error('Network error')
    );
    expect(error.message).toBe('Network error');
  });

  it('should create an error with the correct message and original error', () => {
    const error = new FetchRequestError('FETCHER_NONE');
    expect(error.message).toBe('FETCHER_NONE');
  });

  it('should catch ok status', async () => {
    const request = new FetchRequest({
      baseURL: 'https://api.example.com',
      fetcher: fetchMock
    });

    request.executor.use(new FetchURLPlugin());

    // 创建一个更完整的 Response mock
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      headers: new Headers(),
      body: null,
      bodyUsed: false,
      url: 'https://api.example.com/users',
      type: 'default' as ResponseType,
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
      id: FetchRequestErrorID.RESPONSE_NOT_OK,
      response: mockResponse
    });
  });
});
