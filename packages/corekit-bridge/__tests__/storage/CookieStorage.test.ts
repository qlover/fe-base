/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * CookieStorage test-suite
 *
 * Coverage:
 * 1. length            – cookie count
 * 2. getItem           – get / default fallback
 * 3. setItem           – write & attr-merge
 * 4. removeItem        – delete & attr-merge
 * 5. clear             – wipe all
 * 6. key               – retrieve key by index
 */

import { describe, beforeEach, it, expect, vi } from 'vitest';
import { CookieStorage } from '../../src/core/storage/CookieStorage';

/* ------------------------------------------------------------------ */
/*                     js-cookie mock (self-contained)                */
/* ------------------------------------------------------------------ */
vi.mock('js-cookie', () => {
  let store: Record<string, string> = {};

  const get = vi.fn((key?: string) => {
    if (typeof key === 'string') return store[key];
    return { ...store };
  });

  const set = vi.fn((key: string, value: string) => {
    store[key] = value;
  });

  const remove = vi.fn((key: string) => {
    delete store[key];
  });

  /** allow tests to reset the fake store */
  const __resetStore = () => {
    store = {};
  };

  return {
    default: { get, set, remove, __resetStore }
  };
});

/* mock 必须在 import 之上完成，因此放在其后引入 */
import Cookies from 'js-cookie';

/* ------------------------------ Hooks ----------------------------- */
beforeEach(() => {
  // 清理内部假数据
  (Cookies as any).__resetStore();
  vi.clearAllMocks();
});

/* ------------------------------ Tests ----------------------------- */
describe('CookieStorage', () => {
  it('should be defined', () => {
    expect(CookieStorage).toBeDefined();
  });

  it('setItem / getItem basic read/write', () => {
    const storage = new CookieStorage();
    storage.setItem('foo', 'bar');

    expect(Cookies.set).toHaveBeenCalledWith('foo', 'bar', {});
    expect(storage.getItem('foo')).toBe('bar');
  });

  it('getItem supports defaultValue & returns null when missing', () => {
    const storage = new CookieStorage();

    expect(storage.getItem('unknown', 'fallback')).toBe('fallback');
    expect(storage.getItem('unknown')).toBeNull();
  });

  it('length correctly counts cookies', () => {
    const storage = new CookieStorage();
    storage.setItem('a', '1');
    storage.setItem('b', '2');
    expect(storage.length).toBe(2);
  });

  it('removeItem deletes the specified key', () => {
    const storage = new CookieStorage();
    storage.setItem('del', 'me');
    storage.removeItem('del');

    expect(Cookies.remove).toHaveBeenCalledWith('del', {});
    expect(storage.getItem('del')).toBeNull();
    expect(storage.length).toBe(0);
  });

  it('clear removes all cookies', () => {
    const storage = new CookieStorage();
    storage.setItem('a', '1');
    storage.setItem('b', '2');

    storage.clear();

    expect(Cookies.remove).toHaveBeenCalledTimes(2);
    expect(storage.length).toBe(0);
  });

  it('key(index) returns correct cookie name', () => {
    const storage = new CookieStorage();
    storage.setItem('first', '1');

    expect(storage.key(0)).toBe('first');
    expect(storage.key(1)).toBeNull();
  });

  it('default CookieAttributes merge with per-call options', () => {
    const defaultAttrs = { expires: 7, path: '/' };
    const storage = new CookieStorage(defaultAttrs);

    storage.setItem('merge', 'yes', { secure: true });
    expect(Cookies.set).toHaveBeenLastCalledWith('merge', 'yes', {
      ...defaultAttrs,
      secure: true
    });

    storage.removeItem('merge', { secure: true });
    expect(Cookies.remove).toHaveBeenLastCalledWith('merge', {
      ...defaultAttrs,
      secure: true
    });
  });
});
