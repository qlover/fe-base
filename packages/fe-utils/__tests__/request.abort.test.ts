import {
  FetchRequest,
  AbortPlugin,
  FetchRequestError,
  FetchRequestErrorID
} from '../common/request';

function sleep(mock: unknown, ms: number): Promise<unknown> {
  return new Promise((resolve) => setTimeout(() => resolve(mock), ms));
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
    const onAbortMock = jest.fn();

    // mock a fetch implementation that can respond to abort
    fetchMock.mockImplementationOnce((_url, options: RequestInit) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve(new Response('first response'));
        }, 1000);

        options.signal?.addEventListener('abort', (e) => {
          clearTimeout(timeoutId);
          reject(e);
        });
      });
    });

    const firstConfig = {
      url: '/api/test0',
      method: 'GET',
      onAbort: onAbortMock
    } as const;

    const firstRequest = request.request(firstConfig);

    // wait for a while to ensure the request starts
    await sleep(null, 500);

    abortPlugin.abort(firstConfig);

    // verify the request is aborted
    try {
      await firstRequest;
      fail('Request should have been aborted');
    } catch (error: unknown) {
      expect(error).toMatchObject({
        id: FetchRequestErrorID.ABORT_ERROR
      });
      expect(onAbortMock).toHaveBeenCalledTimes(1);
    }
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should not abort different requests', async () => {
    const firstResponse = { data: 'first' };
    const secondResponse = { data: 'second' };

    fetchMock
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify(firstResponse)))
      )
      .mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify(secondResponse)))
      );

    const firstRequest = request.request({
      url: '/api/test1',
      method: 'GET'
    });

    const secondRequest = request.request({
      url: '/api/test2',
      method: 'GET'
    });

    const [first, second] = await Promise.all([firstRequest, secondRequest]);

    expect(await first.json()).toEqual(firstResponse);
    expect(await second.json()).toEqual(secondResponse);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('should auto abort request with same URL', async () => {
    const onAbortMock = jest.fn();

    fetchMock.mockImplementation((_url, options: RequestInit) => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          resolve(new Response('response'));
        }, 1000);

        options.signal?.addEventListener('abort', (e) => {
          clearTimeout(timeoutId);
          reject(e);
        });
      });
    });

    const config = {
      url: '/api/test4',
      method: 'GET',
      onAbort: onAbortMock
    } as const;

    const firstRequest = request.request(config);
    await sleep(null, 100);

    const secondRequest = request.request(config);

    const results = await Promise.allSettled([firstRequest, secondRequest]);

    expect(results[0].status).toBe('rejected');
    if (results[0].status === 'rejected') {
      expect(results[0].reason).toMatchObject({
        id: FetchRequestErrorID.ABORT_ERROR
      });
    }

    expect(results[1].status).toBe('fulfilled');
    if (results[1].status === 'fulfilled') {
      expect(results[1].value).toBeInstanceOf(Response);
    }

    expect(onAbortMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
