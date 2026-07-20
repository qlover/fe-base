/**
 * UserStore test suite — single persist + persistKeys
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { KeyStorage, type StorageInterface } from '@qlover/fe-corekit';
import { UserStore } from '../../src/core/gateway-service/impl/UserStore';
import { AsyncStoreStatus } from '../../src/core/store-state';

interface TestCredential {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface TestUser {
  id: number;
  name: string;
  email: string;
}

class MockStorage<Key = string> implements StorageInterface<Key, unknown> {
  public data = new Map<string, unknown>();
  public shouldFailGetItem = false;
  public shouldFailSetItem = false;
  public calls: {
    setItem: Array<{ key: Key; value: unknown }>;
    getItem: Array<{ key: Key }>;
    removeItem: Array<{ key: Key }>;
    clear: number;
  } = { setItem: [], getItem: [], removeItem: [], clear: 0 };

  public get length(): number {
    return this.data.size;
  }

  public setItem<T>(key: Key, value: T): T {
    if (this.shouldFailSetItem) throw new Error('Storage setItem failed');
    this.calls.setItem.push({ key, value });
    this.data.set(String(key), value);
    return value;
  }

  public getItem<T>(key: Key): T | null {
    if (this.shouldFailGetItem) throw new Error('Storage getItem failed');
    this.calls.getItem.push({ key });
    return (this.data.get(String(key)) ?? null) as T | null;
  }

  public removeItem(key: Key): void {
    this.calls.removeItem.push({ key });
    this.data.delete(String(key));
  }

  public clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  public reset(): void {
    this.data.clear();
    this.shouldFailGetItem = false;
    this.shouldFailSetItem = false;
    this.calls = { setItem: [], getItem: [], removeItem: [], clear: 0 };
  }
}

describe('UserStore', () => {
  let mockStorage: MockStorage<string>;
  let store: UserStore<TestUser, TestCredential, string>;

  const testCredential: TestCredential = {
    token: 'test-token-123',
    refreshToken: 'refresh-token-456',
    expiresIn: 3600
  };

  const testUser: TestUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  };

  const SESSION_KEY = 'auth-session';

  function sessionPersist() {
    return new KeyStorage(SESSION_KEY, mockStorage);
  }

  beforeEach(() => {
    mockStorage = new MockStorage();
    mockStorage.reset();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      store = new UserStore();
      expect(store.getCredential()).toBeNull();
      expect(store.getUser()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should default persistKeys to credential only', () => {
      store = new UserStore({ persist: sessionPersist() });
      store.success(testUser, testCredential);

      const snap = mockStorage.getItem(SESSION_KEY) as {
        credential?: TestCredential;
        result?: TestUser;
      };
      expect(snap.credential).toEqual(testCredential);
      expect(snap.result).toBeUndefined();
    });

    it('should restore credential on init when persist is set', () => {
      mockStorage.setItem(SESSION_KEY, { credential: testCredential });

      store = new UserStore({
        persist: sessionPersist(),
        initRestore: true
      });

      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should skip restore when initRestore is false', () => {
      mockStorage.setItem(SESSION_KEY, { credential: testCredential });

      store = new UserStore({
        persist: sessionPersist(),
        initRestore: false
      });

      expect(store.getCredential()).toBeNull();
    });
  });

  describe('Dual pick (result + credential)', () => {
    beforeEach(() => {
      store = new UserStore({
        persist: sessionPersist(),
        persistKeys: ['result', 'credential']
      });
    });

    it('should persist both fields in one snapshot', () => {
      store.success(testUser, testCredential);

      expect(mockStorage.getItem(SESSION_KEY)).toEqual({
        result: testUser,
        credential: testCredential
      });
    });

    it('should restore both fields', () => {
      mockStorage.setItem(SESSION_KEY, {
        result: testUser,
        credential: testCredential
      });

      const restored = new UserStore({
        persist: sessionPersist(),
        persistKeys: ['result', 'credential'],
        initRestore: true
      });

      expect(restored.getCredential()).toEqual(testCredential);
      expect(restored.getUser()).toEqual(testUser);
      expect(restored.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should clear snapshot when both fields are null', () => {
      store.success(testUser, testCredential);
      store.setCredential(null);
      store.setUser(null);

      expect(mockStorage.getItem(SESSION_KEY)).toBeNull();
    });
  });

  describe('Helpers', () => {
    beforeEach(() => {
      store = new UserStore({ persist: sessionPersist() });
    });

    it('should persist via setCredential', () => {
      store.setCredential(testCredential);
      expect(mockStorage.getItem(SESSION_KEY)).toEqual({
        credential: testCredential
      });
    });

    it('should not persist user when result is not in persistKeys', () => {
      store.setUser(testUser);
      store.setCredential(testCredential);

      const snap = mockStorage.getItem(SESSION_KEY) as {
        credential?: TestCredential;
        result?: TestUser;
      };
      expect(snap.credential).toEqual(testCredential);
      expect(snap.result).toBeUndefined();
      expect(store.getUser()).toEqual(testUser);
    });

    it('should handle storage errors on set', () => {
      mockStorage.shouldFailSetItem = true;
      expect(() => store.setCredential(testCredential)).not.toThrow();
    });
  });
});
