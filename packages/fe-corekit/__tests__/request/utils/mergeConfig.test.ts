import { describe, it, expect } from 'vitest';
import {
  headersToRecord,
  mergeConfig,
  mergeHeaders,
  pickKeys,
  shallowClone
} from '../../../src/request/utils/mergeConfig';

describe('shallowClone', () => {
  it('should return primitives as-is', () => {
    expect(shallowClone(null)).toBe(null);
    expect(shallowClone(undefined)).toBe(undefined);
    expect(shallowClone(42)).toBe(42);
    expect(shallowClone('hello')).toBe('hello');
    expect(shallowClone(true)).toBe(true);
  });

  it('should shallow-copy arrays without sharing the array reference', () => {
    const nested = { a: 1 };
    const source = [1, nested];
    const cloned = shallowClone(source);

    expect(cloned).toEqual(source);
    expect(cloned).not.toBe(source);
    expect(cloned[1]).toBe(nested);
  });

  it('should shallow-copy plain objects', () => {
    const nested = { b: 2 };
    const source = { a: 1, nested };
    const cloned = shallowClone(source);

    expect(cloned).toEqual(source);
    expect(cloned).not.toBe(source);
    expect(cloned.nested).toBe(nested);
    expect(Object.getPrototypeOf(cloned)).toBe(Object.prototype);
  });

  it('should preserve class instance prototype and methods', () => {
    class CustomConfig {
      public baseURL = 'https://api.example.com';
      public method = 'GET';

      public getAuth(): string {
        return 'Bearer token';
      }
    }

    const source = new CustomConfig();
    const cloned = shallowClone(source);

    expect(cloned).not.toBe(source);
    expect(cloned).toBeInstanceOf(CustomConfig);
    expect(Object.getPrototypeOf(cloned)).toBe(CustomConfig.prototype);
    expect(cloned.baseURL).toBe('https://api.example.com');
    expect(cloned.getAuth()).toBe('Bearer token');

    cloned.method = 'POST';
    expect(source.method).toBe('GET');
  });

  it('should not mutate the original object when overlaying properties', () => {
    class CustomConfig {
      public url = '/users';
      public timeout = 1000;
    }

    const source = new CustomConfig();
    const merged = Object.assign(shallowClone(source), { timeout: 5000 });

    expect(merged).toBeInstanceOf(CustomConfig);
    expect(merged.timeout).toBe(5000);
    expect(source.timeout).toBe(1000);
  });
});

describe('mergeHeaders', () => {
  it('should return undefined when both sides are empty', () => {
    expect(mergeHeaders()).toBeUndefined();
    expect(mergeHeaders(undefined, undefined)).toBeUndefined();
  });

  it('should keep base headers when override is missing', () => {
    expect(mergeHeaders({ Authorization: 'Bearer a' })).toEqual({
      authorization: 'Bearer a'
    });
  });

  it('should merge headers with override winning on collision', () => {
    expect(
      mergeHeaders(
        { Authorization: 'Bearer a', Accept: 'application/json' },
        { Authorization: 'Bearer b', 'X-Custom': '1' }
      )
    ).toEqual({
      authorization: 'Bearer b',
      accept: 'application/json',
      'x-custom': '1'
    });
  });

  it('should accept Headers instances', () => {
    const base = new Headers({ Authorization: 'Bearer a' });
    const override = new Headers({ 'X-Custom': '1' });

    expect(mergeHeaders(base, override)).toEqual({
      authorization: 'Bearer a',
      'x-custom': '1'
    });
  });
});

describe('headersToRecord', () => {
  it('should convert HeadersInit to a plain record', () => {
    expect(headersToRecord({ 'Content-Type': 'application/json' })).toEqual({
      'content-type': 'application/json'
    });
  });

  it('should return undefined for nullish input', () => {
    expect(headersToRecord()).toBeUndefined();
    expect(headersToRecord(undefined)).toBeUndefined();
  });
});

describe('mergeConfig', () => {
  type TestConfig = {
    baseURL?: string;
    method?: string;
    timeout?: number;
    headers?: Record<string, string>;
    params?: Record<string, string | number>;
  };

  it('should shallow-merge top-level fields with override winning', () => {
    const merged = mergeConfig<TestConfig>(
      { baseURL: 'https://api.example.com', method: 'GET', timeout: 1000 },
      { method: 'POST', timeout: 2000 }
    );

    expect(merged).toEqual({
      baseURL: 'https://api.example.com',
      method: 'POST',
      timeout: 2000
    });
  });

  it('should merge headers one level deep', () => {
    const merged = mergeConfig<TestConfig>(
      {
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer token', Accept: 'application/json' }
      },
      {
        headers: { 'X-Custom': 'value', Accept: 'text/plain' }
      }
    );

    expect(merged.baseURL).toBe('https://api.example.com');
    expect(merged.headers).toEqual({
      authorization: 'Bearer token',
      accept: 'text/plain',
      'x-custom': 'value'
    });
  });

  it('should merge params one level deep', () => {
    const merged = mergeConfig<TestConfig>(
      { params: { page: 1, size: 10 } },
      { params: { size: 20, q: 'test' } }
    );

    expect(merged.params).toEqual({
      page: 1,
      size: 20,
      q: 'test'
    });
  });

  it('should replace params when only one side provides them', () => {
    expect(
      mergeConfig<TestConfig>({ method: 'GET' }, { params: { page: 1 } }).params
    ).toEqual({ page: 1 });
    expect(
      mergeConfig<TestConfig>({ params: { page: 1 } }, { method: 'POST' }).params
    ).toEqual({ page: 1 });
  });

  it('should not mutate the default config object', () => {
    const defaults: TestConfig = {
      method: 'GET',
      headers: { Authorization: 'Bearer a' },
      params: { page: 1 }
    };
    const snapshot = structuredClone(defaults);

    mergeConfig(defaults, {
      method: 'POST',
      headers: { 'X-Custom': '1' },
      params: { size: 10 }
    });

    expect(defaults).toEqual(snapshot);
  });
});

describe('pickKeys', () => {
  it('should pick only requested own keys', () => {
    const source = {
      cache: 'no-cache' as RequestCache,
      credentials: 'include' as RequestCredentials,
      headers: { a: '1' },
      url: '/users',
      method: 'GET'
    };

    expect(pickKeys(source, ['cache', 'credentials', 'headers'] as const)).toEqual({
      cache: 'no-cache',
      credentials: 'include',
      headers: { a: '1' }
    });
  });

  it('should skip missing keys', () => {
    const source: { cache?: RequestCache; mode?: RequestMode } = {
      cache: 'reload'
    };

    expect(pickKeys(source, ['cache', 'mode'] as const)).toEqual({
      cache: 'reload'
    });
  });
});
