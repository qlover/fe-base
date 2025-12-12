/**
 * PersistentStoreInterface test suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests with various configurations
 * 2. getStorage        – Storage instance retrieval tests
 * 3. emit              – State emission with automatic persistence tests
 * 4. restore           – State restoration from storage tests
 * 5. persist           – State persistence to storage tests
 * 6. edge cases        – Error handling and boundary tests
 * 7. integration       – Complete persistence flow tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import {
  StoreStateInterface,
  PersistentStore
} from '../../src/core/store-state';

/**
 * Mock storage implementation for testing
 *
 * Tracks all storage operations and allows direct data manipulation
 * for testing purposes
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();
  public calls: {
    setItem: Array<{ key: Key; value: unknown; options?: unknown }>;
    getItem: Array<{ key: Key; defaultValue?: unknown; options?: unknown }>;
    removeItem: Array<{ key: Key; options?: unknown }>;
    clear: number;
  } = {
    setItem: [],
    getItem: [],
    removeItem: [],
    clear: 0
  };

  public shouldFailSetItem = false;
  public shouldFailGetItem = false;

  public get length(): number {
    return this.data.size;
  }

  public setItem<T>(key: Key, value: T, options?: unknown): T {
    this.calls.setItem.push({ key, value, options });
    if (this.shouldFailSetItem) {
      throw new Error('Storage setItem failed');
    }
    this.data.set(String(key), value);
    return value;
  }

  public getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    if (this.shouldFailGetItem) {
      throw new Error('Storage getItem failed');
    }
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  public removeItem(key: Key, options?: unknown): void {
    this.calls.removeItem.push({ key, options });
    this.data.delete(String(key));
  }

  public clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  public reset(): void {
    this.data.clear();
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
    this.shouldFailSetItem = false;
    this.shouldFailGetItem = false;
  }

  // Helper method to directly set data (simulating existing storage)
  public directSet(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}

/**
 * Test state implementation
 *
 * Note: This test state includes an optional `expires` field to test expiration functionality.
 * In real usage, state interfaces can choose whether to include expiration support or not.
 */
class TestState implements StoreStateInterface {
  public data: string = '';
  public count: number = 0;
  public expires?: number | Date | null;
}

/**
 * Concrete implementation of PersistentStoreInterface for testing
 */
class TestPersistentStore extends PersistentStore<TestState, string> {
  private readonly storageKey = 'test-state';

  constructor(
    storage: SyncStorageInterface<string> | null = null,
    initRestore: boolean = true
  ) {
    // Don't auto-restore in super() to avoid initialization order issues
    // Call restore() manually after storageKey is initialized
    super(() => new TestState(), storage, false);
    if (initRestore) {
      // Now storageKey is initialized, safe to call restore()
      this.restore();
    }
  }

  public restore<R = TestState>(): R | null {
    if (!this.storage) return null;
    try {
      const stored = this.storage.getItem(
        this.storageKey
      ) as Partial<TestState> | null;
      if (stored !== null && stored !== undefined) {
        // Check expiration if present
        if (stored.expires !== undefined && stored.expires !== null) {
          const expiresAt =
            typeof stored.expires === 'number'
              ? stored.expires
              : stored.expires instanceof Date
                ? stored.expires.getTime()
                : null;
          if (expiresAt !== null && Date.now() > expiresAt) {
            // State expired, remove from storage
            this.storage.removeItem(this.storageKey);
            return null;
          }
        }

        // Create new state instance and copy all properties
        const restoredState = new TestState();
        // Copy all properties from stored data
        Object.assign(restoredState, stored);
        // Update state without triggering persist
        this.emit(restoredState, { persist: false });
        return restoredState as R;
      }
    } catch {
      return null;
    }
    return null;
  }

  public persist(state?: TestState): void {
    if (!this.storage) return;
    const stateToPersist = state ?? this.state;
    this.storage.setItem(this.storageKey, stateToPersist);
  }
}

describe('PersistentStoreInterface', () => {
  let mockStorage: MockStorage<string>;
  let store: TestPersistentStore;

  beforeEach(() => {
    mockStorage = new MockStorage();
    store = new TestPersistentStore(mockStorage);
  });

  afterEach(() => {
    mockStorage.reset();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with storage and auto-restore enabled', () => {
      const testStorage = new MockStorage();
      testStorage.directSet('test-state', {
        data: 'restored',
        count: 42
      });

      const testStore = new TestPersistentStore(testStorage, true);
      expect(testStore.getStorage()).toBe(testStorage);
      expect(testStore.state.data).toBe('restored');
      expect(testStore.state.count).toBe(42);
    });

    it('should create instance with storage and auto-restore disabled', () => {
      const testStorage = new MockStorage();
      testStorage.directSet('test-state', {
        data: 'restored',
        count: 42
      });

      const testStore = new TestPersistentStore(testStorage, false);
      expect(testStore.getStorage()).toBe(testStorage);
      // State should not be restored when initRestore is false
      expect(testStore.state.data).toBe('');
      expect(testStore.state.count).toBe(0);
    });

    it('should create instance without storage', () => {
      const testStore = new TestPersistentStore(null);
      expect(testStore.getStorage()).toBeNull();
      expect(testStore.state.data).toBe('');
      expect(testStore.state.count).toBe(0);
    });

    it('should initialize with default state when no storage data exists', () => {
      const testStorage = new MockStorage();
      const testStore = new TestPersistentStore(testStorage);
      expect(testStore.state.data).toBe('');
      expect(testStore.state.count).toBe(0);
    });

    it('should call restore during construction when initRestore is true', () => {
      const testStorage = new MockStorage();
      testStorage.directSet('test-state', { data: 'test', count: 1 });
      const testStore = new TestPersistentStore(testStorage, true);
      expect(testStorage.calls.getItem.length).toBeGreaterThan(0);
      expect(testStore.state.data).toBe('test');
    });

    it('should not call restore during construction when initRestore is false', () => {
      const testStorage = new MockStorage();
      testStorage.directSet('test-state', { data: 'test', count: 1 });
      const testStore = new TestPersistentStore(testStorage, false);
      expect(testStorage.calls.getItem.length).toBe(0);
      expect(testStore.state.data).toBe('');
    });
  });

  describe('getStorage', () => {
    it('should return storage instance when configured', () => {
      expect(store.getStorage()).toBe(mockStorage);
    });

    it('should return null when storage is not configured', () => {
      const testStore = new TestPersistentStore(null);
      expect(testStore.getStorage()).toBeNull();
    });

    it('should return the same storage instance throughout store lifetime', () => {
      const storage1 = store.getStorage();
      store.emit({ data: 'test', count: 1 });
      const storage2 = store.getStorage();
      expect(storage1).toBe(storage2);
      expect(storage1).toBe(mockStorage);
    });
  });

  describe('emit', () => {
    it('should emit state and automatically persist to storage', () => {
      const newState = new TestState();
      newState.data = 'test-data';
      newState.count = 100;

      store.emit(newState);

      expect(store.state.data).toBe('test-data');
      expect(store.state.count).toBe(100);
      expect(mockStorage.calls.setItem.length).toBe(1);
      expect(mockStorage.calls.setItem[0].value).toEqual(newState);
    });

    it('should emit state without persisting when persist option is false', () => {
      const newState = new TestState();
      newState.data = 'test-data';
      newState.count = 100;

      store.emit(newState, { persist: false });

      expect(store.state.data).toBe('test-data');
      expect(store.state.count).toBe(100);
      expect(mockStorage.calls.setItem.length).toBe(0);
    });

    it('should emit state without persisting when storage is null', () => {
      const testStore = new TestPersistentStore(null);
      const newState = new TestState();
      newState.data = 'test-data';

      testStore.emit(newState);

      expect(testStore.state.data).toBe('test-data');
      // No storage calls should be made
    });

    it('should persist state even when persist option is undefined', () => {
      const newState = new TestState();
      newState.data = 'test';

      store.emit(newState, undefined);

      expect(mockStorage.calls.setItem.length).toBe(1);
    });

    it('should persist state when persist option is explicitly true', () => {
      const newState = new TestState();
      newState.data = 'test';

      store.emit(newState, { persist: true });

      expect(mockStorage.calls.setItem.length).toBe(1);
    });

    it('should silently ignore persistence errors', () => {
      mockStorage.shouldFailSetItem = true;
      const newState = new TestState();
      newState.data = 'test';

      // Should not throw error
      expect(() => {
        store.emit(newState);
      }).not.toThrow();

      // State should still be updated
      expect(store.state.data).toBe('test');
    });

    it('should call persist with the emitted state', () => {
      const newState = new TestState();
      newState.data = 'test-data';
      newState.count = 42;

      store.emit(newState);

      expect(mockStorage.calls.setItem[0].value).toEqual(newState);
    });

    it('should handle multiple consecutive emits with persistence', () => {
      store.emit({ data: 'first', count: 1 });
      store.emit({ data: 'second', count: 2 });
      store.emit({ data: 'third', count: 3 });

      expect(mockStorage.calls.setItem.length).toBe(3);
      expect(store.state.data).toBe('third');
      expect(store.state.count).toBe(3);
    });

    it('should handle mixed persist options', () => {
      store.emit({ data: 'persisted', count: 1 });
      store.emit({ data: 'not-persisted', count: 2 }, { persist: false });
      store.emit({ data: 'persisted-again', count: 3 });

      expect(mockStorage.calls.setItem.length).toBe(2);
      expect(mockStorage.calls.setItem[0].value).toEqual({
        data: 'persisted',
        count: 1
      });
      expect(mockStorage.calls.setItem[1].value).toEqual({
        data: 'persisted-again',
        count: 3
      });
    });
  });

  describe('restore', () => {
    it('should restore state from storage', () => {
      mockStorage.directSet('test-state', {
        data: 'restored-data',
        count: 99
      });

      const restored = store.restore();

      expect(restored).not.toBeNull();
      expect(restored?.data).toBe('restored-data');
      expect(restored?.count).toBe(99);
      expect(store.state.data).toBe('restored-data');
      expect(store.state.count).toBe(99);
    });

    it('should return null when storage is not configured', () => {
      const testStore = new TestPersistentStore(null);
      const restored = testStore.restore();
      expect(restored).toBeNull();
    });

    it('should return null when no state exists in storage', () => {
      const restored = store.restore();
      expect(restored).toBeNull();
      expect(store.state.data).toBe('');
      expect(store.state.count).toBe(0);
    });

    it('should return null when storage getItem throws error', () => {
      mockStorage.shouldFailGetItem = true;
      const restored = store.restore();
      expect(restored).toBeNull();
    });

    it('should not trigger persist during restore', () => {
      mockStorage.directSet('test-state', {
        data: 'restored',
        count: 1
      });

      const initialSetItemCalls = mockStorage.calls.setItem.length;
      store.restore();

      // restore() should call emit with { persist: false }
      // So setItem should not be called during restore
      expect(mockStorage.calls.setItem.length).toBe(initialSetItemCalls);
    });

    it('should handle expired state with number expiration', () => {
      const expiredTime = Date.now() - 1000; // Expired 1 second ago
      mockStorage.directSet('test-state', {
        data: 'expired',
        count: 1,
        expires: expiredTime
      });

      const restored = store.restore();
      expect(restored).toBeNull();
      expect(mockStorage.data.has('test-state')).toBe(false);
    });

    it('should handle expired state with Date expiration', () => {
      const expiredDate = new Date(Date.now() - 1000);
      mockStorage.directSet('test-state', {
        data: 'expired',
        count: 1,
        expires: expiredDate
      });

      const restored = store.restore();
      expect(restored).toBeNull();
      expect(mockStorage.data.has('test-state')).toBe(false);
    });

    it('should restore state with valid expiration', () => {
      const futureTime = Date.now() + 3600000; // Expires in 1 hour
      mockStorage.directSet('test-state', {
        data: 'valid',
        count: 1,
        expires: futureTime
      });

      const restored = store.restore();
      expect(restored).not.toBeNull();
      expect(restored?.data).toBe('valid');
    });

    it('should restore state with null expiration (explicitly no expiration)', () => {
      mockStorage.directSet('test-state', {
        data: 'no-expiration',
        count: 1,
        expires: null
      });

      const restored = store.restore();
      expect(restored).not.toBeNull();
      expect(restored?.data).toBe('no-expiration');
    });

    it('should restore state without expiration field', () => {
      mockStorage.directSet('test-state', {
        data: 'no-expiration-field',
        count: 1
      });

      const restored = store.restore();
      expect(restored).not.toBeNull();
      expect(restored?.data).toBe('no-expiration-field');
    });

    it('should update store state during restore', () => {
      mockStorage.directSet('test-state', {
        data: 'restored',
        count: 42
      });

      store.restore();

      expect(store.state.data).toBe('restored');
      expect(store.state.count).toBe(42);
    });
  });

  describe('persist', () => {
    it('should persist current state to storage', () => {
      store.emit({ data: 'test', count: 1 });

      expect(mockStorage.calls.setItem.length).toBe(1);
      expect(mockStorage.calls.setItem[0].key).toBe('test-state');
      expect(mockStorage.calls.setItem[0].value).toEqual({
        data: 'test',
        count: 1
      });
    });

    it('should persist specified state instead of current state', () => {
      store.emit({ data: 'current', count: 1 });

      const customState = new TestState();
      customState.data = 'custom';
      customState.count = 999;

      store.persist(customState);

      expect(mockStorage.calls.setItem.length).toBe(2);
      expect(mockStorage.calls.setItem[1].value).toEqual(customState);
    });

    it('should do nothing when storage is null', () => {
      const testStore = new TestPersistentStore(null);
      testStore.emit({ data: 'test', count: 1 });

      // persist() should not throw error
      expect(() => {
        testStore.persist();
      }).not.toThrow();
    });

    it('should persist state with expiration', () => {
      const stateWithExpiration = new TestState();
      stateWithExpiration.data = 'test';
      stateWithExpiration.count = 1;
      stateWithExpiration.expires = Date.now() + 3600000;

      store.persist(stateWithExpiration);

      const persisted = mockStorage.calls.setItem[0].value as TestState;
      expect(persisted.expires).toBe(stateWithExpiration.expires);
    });

    it('should persist state multiple times', () => {
      store.persist({ data: 'first', count: 1 });
      store.persist({ data: 'second', count: 2 });
      store.persist({ data: 'third', count: 3 });

      expect(mockStorage.calls.setItem.length).toBe(3);
      expect(mockStorage.calls.setItem[2].value).toEqual({
        data: 'third',
        count: 3
      });
    });
  });

  describe('integration tests', () => {
    it('should complete persistence flow: restore -> modify -> persist', () => {
      // Initial state in storage
      mockStorage.directSet('test-state', {
        data: 'initial',
        count: 10
      });

      // Create new store (auto-restores)
      const testStore = new TestPersistentStore(mockStorage);
      expect(testStore.state.data).toBe('initial');
      expect(testStore.state.count).toBe(10);

      // Modify state (auto-persists)
      testStore.emit({ data: 'modified', count: 20 });
      expect(testStore.state.data).toBe('modified');
      expect(testStore.state.count).toBe(20);

      // Verify persistence
      const persisted = mockStorage.getItem('test-state') as TestState;
      expect(persisted.data).toBe('modified');
      expect(persisted.count).toBe(20);
    });

    it('should handle restore -> emit with persist:false -> manual persist', () => {
      mockStorage.directSet('test-state', {
        data: 'restored',
        count: 5
      });

      const testStore = new TestPersistentStore(mockStorage);
      expect(testStore.state.data).toBe('restored');

      // Emit without persistence
      testStore.emit({ data: 'modified', count: 10 }, { persist: false });
      expect(testStore.state.data).toBe('modified');

      // Storage should still have old value
      const stored = mockStorage.getItem('test-state') as TestState;
      expect(stored.data).toBe('restored');

      // Manual persist
      testStore.persist();
      const updated = mockStorage.getItem('test-state') as TestState;
      expect(updated.data).toBe('modified');
    });

    it('should handle expiration check during restore', () => {
      // Store expired state
      const expiredTime = Date.now() - 1000;
      mockStorage.directSet('test-state', {
        data: 'expired',
        count: 1,
        expires: expiredTime
      });

      // Create store (should not restore expired state)
      const testStore = new TestPersistentStore(mockStorage);
      expect(testStore.state.data).toBe('');
      expect(testStore.state.count).toBe(0);
      expect(mockStorage.data.has('test-state')).toBe(false);
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.shouldFailSetItem = true;

      // Emit should not throw
      expect(() => {
        store.emit({ data: 'test', count: 1 });
      }).not.toThrow();

      // State should still be updated
      expect(store.state.data).toBe('test');
    });
  });

  describe('edge cases', () => {
    it('should handle empty state object', () => {
      const emptyState = new TestState();
      store.emit(emptyState);
      expect(mockStorage.calls.setItem.length).toBe(1);
    });

    it('should handle state with all optional fields', () => {
      const state = new TestState();
      state.data = 'test';
      state.count = 0;
      state.expires = null;

      store.emit(state);
      const persisted = mockStorage.calls.setItem[0].value as TestState;
      expect(persisted.expires).toBeNull();
    });

    it('should handle rapid consecutive operations', () => {
      for (let i = 0; i < 100; i++) {
        store.emit({ data: `test-${i}`, count: i });
      }

      expect(mockStorage.calls.setItem.length).toBe(100);
      expect(store.state.count).toBe(99);
    });

    it('should handle restore when storage has invalid data structure', () => {
      mockStorage.directSet('test-state', {
        invalid: 'structure',
        random: 'data'
      });

      const restored = store.restore();
      // Should handle gracefully (Object.assign will merge properties)
      expect(restored).not.toBeNull();
    });

    it('should handle state with Date expiration object', () => {
      const futureDate = new Date(Date.now() + 3600000);
      mockStorage.directSet('test-state', {
        data: 'test',
        count: 1,
        expires: futureDate
      });

      const restored = store.restore();
      expect(restored).not.toBeNull();
      expect(restored?.expires).toBeInstanceOf(Date);
    });
  });
});
