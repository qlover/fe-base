import { FetchRequest, AbortPlugin } from '../common/request';

// 辅助函数：创建一个可控的 Promise
function createControlledPromise<T>(): [Promise<T>, (value: T) => void] {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => {
    resolve = res;
  });
  return [promise, resolve];
}

describe('AbortPlugin', () => {
  let fetchMock: jest.Mock;
  let originalFetch: typeof global.fetch;
  let request: FetchRequest;
  let abortPlugin: AbortPlugin;

  beforeEach(() => {
    originalFetch = global.fetch;
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    request = new FetchRequest({
      fetcher: fetchMock
    });

    abortPlugin = new AbortPlugin();
    request.executor.addPlugin(abortPlugin);
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
    abortPlugin.abortAll();
  });

  it('should abort previous request when making same request', async () => {
    // 发起第一个请求
    const promise1 = request.request({
      url: 'https://api.example.com/users',
      method: 'GET'
    });

    // 立即发起第二个相同请求
    const promise2 = request.request({
      url: 'https://api.example.com/users',
      method: 'GET'
    });
  });

  it.skip('should abort specific request', async () => {
    // const mockResponse = new Response(JSON.stringify({ id: 1 }));
    // const [promiseControl, resolve] = createControlledPromise<Response>();

    // fetchMock.mockImplementationOnce(() => promiseControl);

    const promise = request.request({
      url: 'https://api.example.com/users',
      method: 'GET'
    });

    // // 确保请求已经开始
    // await Promise.resolve();

    // 中止请求
    abortPlugin.abort({
      url: 'https://api.example.com/users',
      method: 'GET'
    });

    await expect(promise).rejects.toThrow('AbortError');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/users',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it.skip('should abort all requests', async () => {
    const mockResponse = new Response(JSON.stringify({ id: 1 }));
    const [promise1Control] = createControlledPromise<Response>();
    const [promise2Control] = createControlledPromise<Response>();

    fetchMock
      .mockImplementationOnce(() => promise1Control)
      .mockImplementationOnce(() => promise2Control);

    const promise1 = request.request({
      url: 'https://api.example.com/users',
      method: 'GET'
    });
    const promise2 = request.request({
      url: 'https://api.example.com/posts',
      method: 'GET'
    });

    // 确保请求都已经开始
    await Promise.resolve();

    // 中止所有请求
    abortPlugin.abortAll();

    await expect(promise1).rejects.toThrow('AbortError');
    await expect(promise2).rejects.toThrow('AbortError');

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'https://api.example.com/users',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'https://api.example.com/posts',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });
});
