import { RequestAdapterAxios } from '../../../src/request/adapter/RequestAdapterAxios';
import axios, { AxiosStatic } from 'axios';

vi.mock('axios');

describe('RequestAdapterAxios', () => {
  let axiosMock: AxiosStatic & {
    create: ReturnType<typeof vi.fn>;
    request: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    axiosMock = axios as typeof axiosMock;
    axiosMock.create = vi.fn().mockReturnThis();
  });

  it('should create an axios instance with given config', () => {
    const config = { baseURL: 'https://api.example.com' };
    const adapter = new RequestAdapterAxios(axios, config);

    expect(axiosMock.create).toHaveBeenCalledWith(config);
    expect(adapter.getConfig()).toEqual(config);
  });

  it('should return the correct config', () => {
    const config = { baseURL: 'https://api.example.com' };
    const adapter = new RequestAdapterAxios(axios, config);

    expect(adapter.getConfig()).toEqual(config);
  });

  it('should make a request and return a response', async () => {
    const responseData = { data: { id: 1 } };
    axiosMock.request = vi.fn().mockResolvedValue(responseData);

    const adapter = new RequestAdapterAxios(axios);
    const response = await adapter.request({ url: '/users' });

    expect(axiosMock.request).toHaveBeenCalledWith({ url: '/users' });
    expect(response).toEqual(responseData);
  });

  it('should handle request errors', async () => {
    const error = new Error('Network Error');
    axiosMock.request = vi.fn().mockRejectedValue(error);

    const adapter = new RequestAdapterAxios(axios);

    await expect(adapter.request({ url: '/users' })).rejects.toThrow(
      'Network Error'
    );
  });

  it('should update config using setConfig method', () => {
    const adapter = new RequestAdapterAxios(axios, {
      baseURL: 'https://api1.com'
    });

    expect(adapter.getConfig().baseURL).toBe('https://api1.com');

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
  });

  it('should merge partial config with setConfig', () => {
    const adapter = new RequestAdapterAxios(axios, {
      baseURL: 'https://api1.com',
      timeout: 5000
    });

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
    expect(adapter.getConfig().timeout).toBe(5000);
  });

  it('should allow updating multiple config properties with setConfig', () => {
    const adapter = new RequestAdapterAxios(axios, {
      baseURL: 'https://api1.com',
      timeout: 5000
    });

    adapter.setConfig({
      baseURL: 'https://api2.com',
      timeout: 10000
    });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
    expect(adapter.getConfig().timeout).toBe(10000);
  });
});
