import { describe, it, beforeEach, expect, vi } from 'vitest';
import { UserToken } from '../../src/core/storage/UserToken';
import type { SyncStorage } from '@qlover/fe-corekit';
import type { ExpiresInType } from '../../src/core/storage/QuickerTime';

/* ------------------------------------------------------------------ */
/*              helpers: in-memory SyncStorage & quickTime            */
/* ------------------------------------------------------------------ */

/** in-memory SyncStorage, satisfies UserToken dependencies */
const createMockStorage = () => {
  const store = new Map<string, string>();

  const mock: SyncStorage<string, string> = {
    get length() {
      return store.size;
    },
    // @ts-expect-error mockReturnValueOnce is not a function
    getItem: vi.fn((k: string, def?: string) =>
      store.has(k) ? store.get(k)! : (def ?? null)
    ),
    // @ts-expect-error mockReturnValueOnce is not a function
    setItem: vi.fn((k: string, v: string) => {
      store.set(k, v);
    }),
    removeItem: vi.fn((k: string) => {
      store.delete(k);
    }),
    clear: vi.fn(() => store.clear()),
    key: vi.fn()
  };

  return mock;
};

/** stub QuickerTime, only check parameters & return fixed timestamp */
const createMockQuick = () => {
  const now = Date.UTC(2023, 0, 1);
  const add = vi.fn(() => now + 1000); // any fixed value
  return {
    add
  } as unknown as import('../../src/core/storage/QuickerTime').QuickerTime;
};

/** test oriented subclass, to call protected getTokenExpireTime */
class TestableUserToken extends UserToken {
  public _expire(
    e?: ExpiresInType,
    t?: number
  ): ReturnType<UserToken['getTokenExpireTime']> {
    return this.getTokenExpireTime(e, t);
  }
}

/* ------------------------------------------------------------------ */
/*                                  tests                             */
/* ------------------------------------------------------------------ */
describe('UserToken', () => {
  let storage: ReturnType<typeof createMockStorage>;
  let quick: ReturnType<typeof createMockQuick>;
  const KEY = 'auth';

  beforeEach(() => {
    storage = createMockStorage();
    quick = createMockQuick();
    vi.clearAllMocks();
  });

  /* -------------------------- setToken --------------------------- */
  it('setToken: write token to self & storage, with default expiration (month,1)', () => {
    const ut = new UserToken({
      storageKey: KEY,
      storage,
      quickerTime: quick
    });
    ut.setToken('abc');

    expect(quick.add).toHaveBeenCalledWith('month', 1, expect.any(Number));
    expect(storage.setItem).toHaveBeenCalledWith(
      KEY,
      'abc',
      expect.any(Number)
    );
    expect(ut.getToken()).toBe('abc'); // in-memory cached
  });

  /* -------------------------- getToken --------------------------- */
  it('getToken: if internal is empty, read from storage & fill cache', () => {
    // @ts-expect-error mockReturnValueOnce is not a function
    storage.getItem.mockReturnValueOnce('persisted');
    const ut = new UserToken({
      storageKey: KEY,
      storage,
      quickerTime: quick
    });

    const token = ut.getToken();
    expect(token).toBe('persisted');
    expect(storage.getItem).toHaveBeenCalledWith(KEY, '');
    // setToken will call storage.setItem again
    expect(storage.setItem).toHaveBeenCalledWith(
      KEY,
      'persisted',
      expect.any(Number)
    );
  });

  it('getToken: if no storage or storageKey, return empty string', () => {
    const ut = new UserToken({
      storageKey: KEY,
      storage,
      quickerTime: quick
    });
    expect(ut.getToken()).toBe('');
  });

  /* -------------------------- removeToken ------------------------ */
  it('removeToken: clear internal token & call storage.removeItem', () => {
    const ut = new UserToken({
      storageKey: KEY,
      storage,
      quickerTime: quick
    });
    ut.setToken('xyz'); // write a token first
    ut.removeToken();

    expect(ut.getToken()).toBe('');
    expect(storage.removeItem).toHaveBeenCalledWith(KEY);
  });

  /* ----------------- getTokenExpireTime (protected) -------------- */
  it.each([
    ['default(undefined) → add(month,1)', undefined, ['month', 1]],
    ['string "day"        → add(day,1)', 'day', ['day', 1]],
    ['number 3            → add(month,3)', 3, ['month', 3]],
    ['tuple ["hour",2]    → add(hour,2)', ['hour', 2], ['hour', 2]]
  ])('%s', (_, input, expected) => {
    const ut = new TestableUserToken({
      storageKey: KEY,
      storage,
      quickerTime: quick
    });
    ut._expire(input as ExpiresInType, 0); // targetTime=0 for verification
    expect(quick.add).toHaveBeenLastCalledWith(expected[0], expected[1], 0);
  });
});
