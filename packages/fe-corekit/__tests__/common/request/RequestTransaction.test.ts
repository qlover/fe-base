import { RequestTransaction } from '../../../src/common/request';
import {
  RequestAdapterInterface,
  RequestAdapterConfig,
  RequestAdapterResponse,
  RequestTransactionInterface,
  RequestError
} from '../../../src/common/request';

class MockAdapter implements RequestAdapterInterface<RequestAdapterConfig> {
  readonly config: RequestAdapterConfig;
  private mockResponse: unknown;
  private shouldFail: boolean;

  constructor(mockResponse?: unknown, shouldFail = false) {
    this.mockResponse = mockResponse;
    this.shouldFail = shouldFail;
    this.config = {};
  }

  getConfig(): RequestAdapterConfig {
    return this.config;
  }

  async request<Request, Response>(
    config: RequestAdapterConfig<Request>
  ): Promise<Response> {
    if (this.shouldFail) {
      throw new RequestError('Request failed');
    }

    return {
      status: 200,
      statusText: 'OK',
      headers: {},
      data: this.mockResponse,
      config,
      response: new Response()
    } as Response;
  }
}

describe('RequestTransaction', () => {
  it('should make a basic request successfully', async () => {
    const mockData = { message: 'success' };
    const client = new RequestTransaction<RequestAdapterConfig>(
      new MockAdapter(mockData)
    );

    const response = await client.request({
      url: 'https://api.example.com/test',
      method: 'GET'
    });

    expect(response.data).toEqual(mockData);
    expect(response.status).toBe(200);
  });

  it('should handle generic type definitions', async () => {
    interface CustomResponse {
      items: string[];
    }

    const mockData = { items: ['item1', 'item2'] };
    const client = new RequestTransaction<RequestAdapterConfig>(
      new MockAdapter(mockData)
    );

    const response = await client.request<CustomResponse>({
      url: 'https://api.example.com/items',
      method: 'GET'
    });

    expect((response.data as CustomResponse).items).toHaveLength(2);
    expect(Array.isArray((response.data as CustomResponse).items)).toBe(true);
  });

  it('should work with RequestTransactionInterface', async () => {
    interface CustomConfig extends RequestAdapterConfig {
      customField?: string;
    }

    interface CustomResponse {
      success: boolean;
      data: string[];
    }

    type TestTransaction = RequestTransactionInterface<
      CustomConfig,
      RequestAdapterResponse<unknown, CustomResponse>
    >;

    const mockData = { success: true, data: ['test1', 'test2'] };
    const client = new RequestTransaction<CustomConfig>(
      new MockAdapter(mockData)
    );

    const response = await client.request<TestTransaction>({
      url: 'https://api.example.com/test',
      method: 'GET',
      customField: 'test'
    });

    expect((response.data as CustomResponse).success).toBe(true);
    expect((response.data as CustomResponse).data).toHaveLength(2);
  });

  describe('HTTP Methods', () => {
    it('should handle GET request', async () => {
      const mockData = { data: 'get' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.get('https://api.example.com/test');
      expect(response.data).toEqual(mockData);
    });

    it('should handle POST request with data', async () => {
      const mockData = { data: 'post' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.post('https://api.example.com/test', {
        id: 1
      });
      expect(response.data).toEqual(mockData);
    });

    it('should handle PUT request with data', async () => {
      const mockData = { data: 'put' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.put('https://api.example.com/test', {
        id: 1
      });
      expect(response.data).toEqual(mockData);
    });

    it('should handle DELETE request', async () => {
      const mockData = { data: 'delete' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.delete('https://api.example.com/test');
      expect(response.data).toEqual(mockData);
    });

    it('should handle PATCH request with data', async () => {
      const mockData = { data: 'patch' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.patch('https://api.example.com/test', {
        id: 1
      });
      expect(response.data).toEqual(mockData);
    });
  });

  it('should handle request failures', async () => {
    const client = new RequestTransaction<RequestAdapterConfig>(
      new MockAdapter({}, true)
    );

    await expect(
      client.request({ url: 'https://api.example.com/test', method: 'GET' })
    ).rejects.toThrow('Request failed');
  });
});

describe('RequestTransaction Advanced Tests', () => {
  describe('Generic Type Support with Different Data Structures', () => {
    it('should handle string response', async () => {
      const mockData = 'Hello World';
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<string>({
        url: '/test',
        method: 'GET'
      });

      expect(response.data).toBe('Hello World');
    });

    it('should handle number response', async () => {
      const mockData = 12345;
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<number>({
        url: '/test',
        method: 'GET'
      });

      expect(response.data).toBe(12345);
    });

    it('should handle array response', async () => {
      const mockData = [1, 2, 3, 4, 5];
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<number[]>({
        url: '/test',
        method: 'GET'
      });

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(5);
    });

    it('should handle complex object response', async () => {
      interface ComplexObject {
        id: number;
        name: string;
        tags: string[];
        metadata: { created: Date; updated: Date };
      }

      const mockData: ComplexObject = {
        id: 1,
        name: 'Test Object',
        tags: ['tag1', 'tag2'],
        metadata: { created: new Date(), updated: new Date() }
      };

      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<ComplexObject>({
        url: '/test',
        method: 'GET'
      });

      expect(response.data).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        tags: expect.any(Array),
        metadata: { created: expect.any(Date), updated: expect.any(Date) }
      });
    });
  });

  describe('Documentation Examples Tests', () => {
    it('should work with direct return type declaration', async () => {
      interface CustomResponse {
        list: string[];
      }

      const mockData: CustomResponse = { list: ['item1', 'item2'] };

      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<CustomResponse>({
        url: 'https://api.example.com/data',
        method: 'GET'
      });

      expect(Array.isArray(response.data.list)).toBe(true);
      expect(response.data.list).toHaveLength(2);
    });

    it('should work with extended config type', async () => {
      interface CustomConfig extends RequestAdapterConfig {
        hasCatchError?: boolean;
      }

      const client = new RequestTransaction<CustomConfig>(
        new MockAdapter({ success: true })
      );

      const response = await client.request({
        url: 'https://api.example.com/data',
        method: 'GET',
        hasCatchError: true,
        data: { name: 'John Doe' }
      });

      expect(response.config.hasCatchError).toBe(true);
    });

    it('should work with complete API client implementation', async () => {
      interface CatchPluginConfig {
        hasCatchError?: boolean;
      }

      interface CatchPluginResponseData {
        catchError?: unknown;
      }

      interface ApiClientConfig
        extends RequestAdapterConfig,
          CatchPluginConfig {}

      interface ApiClientResponse<T = unknown>
        extends RequestAdapterResponse<unknown, T>,
          CatchPluginResponseData {}

      interface ApiTestTransaction
        extends RequestTransactionInterface<
          ApiClientConfig,
          ApiClientResponse<{ list: string[] }>
        > {}

      class ApiClient extends RequestTransaction<ApiClientConfig> {
        test(): Promise<ApiTestTransaction['response']> {
          return this.request<ApiTestTransaction>({
            url: 'https://api.example.com/data',
            method: 'GET',
            hasCatchError: true
          });
        }

        test2(
          data: ApiTestTransaction['request']
        ): Promise<ApiTestTransaction['response']> {
          return this.request<ApiTestTransaction>({
            ...data,
            url: 'https://api.example.com/data',
            method: 'GET',
            hasCatchError: true
          });
        }
      }

      const mockData = { list: ['item1', 'item2'] };
      const client = new ApiClient(new MockAdapter(mockData));

      const response = await client.test();
      expect(response.data.list).toHaveLength(2);

      const response2 = await client.test2({
        url: 'https://api.example.com/data',
        method: 'GET'
      });
      expect(response2.data.list).toHaveLength(2);
    });
  });

  describe('Edge Cases and Special Scenarios', () => {
    it('should handle null response', async () => {
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(null)
      );

      const response = await client.request<null>({
        url: '/test',
        method: 'GET'
      });

      expect(response.data).toBeNull();
    });

    it('should handle undefined response', async () => {
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(undefined)
      );

      const response = await client.request({ url: '/test', method: 'GET' });

      expect(response.data).toBeUndefined();
    });

    it('should handle empty object response', async () => {
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter({})
      );

      const response = await client.request<Record<string, never>>({
        url: '/test',
        method: 'GET'
      });

      expect(response.data).toEqual({});
    });

    it('should handle nested array response', async () => {
      const mockData = [
        [1, 2],
        [3, 4],
        [5, 6]
      ];
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request<number[][]>({
        url: '/test',
        method: 'GET'
      });

      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(3);
      expect(response.data[0]).toHaveLength(2);
    });
  });

  describe('Response Structure Tests', () => {
    it('should maintain correct response structure', async () => {
      const mockData = { name: 'test' };
      const client = new RequestTransaction<RequestAdapterConfig>(
        new MockAdapter(mockData)
      );

      const response = await client.request({ url: '/test', method: 'GET' });

      expect(response).toMatchObject({
        status: 200,
        statusText: 'OK',
        headers: {},
        data: { name: 'test' },
        config: expect.any(Object),
        response: expect.any(Response)
      });
    });
  });
});
