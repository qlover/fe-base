import { describe, it, expect } from 'vitest';
import { RequestAdapterFetch } from '../../src/request/adapter/RequestAdapterFetch';

describe('RequestAdapter setConfig', () => {
  it('should update config using setConfig method', () => {
    const adapter = new RequestAdapterFetch({ baseURL: 'https://api1.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api1.com');

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
  });

  it('should merge partial config', () => {
    const adapter = new RequestAdapterFetch({
      baseURL: 'https://api1.com',
      method: 'GET'
    });

    adapter.setConfig({ baseURL: 'https://api2.com' });

    expect(adapter.getConfig().baseURL).toBe('https://api2.com');
    expect(adapter.getConfig().method).toBe('GET');
  });

  it('should allow updating multiple config properties', () => {
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
