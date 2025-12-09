/**
 * AsyncStoreInterface test suite
 *
 * Coverage:
 * 1. AsyncStateInterface        – State interface structure tests
 * 2. AsyncStateAction           – Action methods tests (start, stop, success, failed, reset, updateState, getDuration)
 * 3. AsyncStateStatusInterface  – Status checking methods tests
 * 4. AsyncStoreInterface        – Complete interface integration tests
 * 5. edge cases                 – Error handling and boundary tests
 * 6. integration                – Complete async operation flow tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import {
  AsyncStateInterface,
  AsyncStore,
  AsyncStoreOptions,
  AsyncStoreStateInterface,
  AsyncStoreStatus
} from '../../src/core/store-state';

/**
 * Mock storage implementation for testing
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();
  public shouldFailGetItem: boolean = false;
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

  get length(): number {
    return this.data.size;
  }

  setItem<T>(key: Key, value: T, options?: unknown): T {
    this.calls.setItem.push({ key, value, options });
    this.data.set(String(key), value);
    return value;
  }

  getItem<T>(key: Key, defaultValue?: T, options?: unknown): T | null {
    this.calls.getItem.push({ key, defaultValue, options });
    if (this.shouldFailGetItem) {
      throw new Error('Storage getItem failed');
    }
    const value = this.data.get(String(key));
    return (value ?? defaultValue ?? null) as T | null;
  }

  removeItem(key: Key, options?: unknown): void {
    this.calls.removeItem.push({ key, options });
    this.data.delete(String(key));
  }

  clear(): void {
    this.calls.clear++;
    this.data.clear();
  }

  reset(): void {
    this.data.clear();
    this.shouldFailGetItem = false;
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }
}

/**
 * Test data type
 */
interface TestUser {
  id: number;
  name: string;
  email: string;
}

interface TestUserState extends AsyncStoreStateInterface<TestUser> {}

describe('AsyncStateInterface', () => {
  describe('structure', () => {
    it('should have all required properties', () => {
      const state: AsyncStateInterface<TestUser> = {
        loading: false,
        result: null,
        error: null,
        startTime: 0,
        endTime: 0
      };

      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('result');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('startTime');
      expect(state).toHaveProperty('endTime');
    });

    it('should allow optional status property', () => {
      const stateWithStatus: AsyncStateInterface<TestUser> = {
        loading: false,
        result: null,
        error: null,
        startTime: 0,
        endTime: 0,
        status: 'pending'
      };

      expect(stateWithStatus.status).toBe('pending');
    });

    it('should support different result types', () => {
      const stringState: AsyncStateInterface<string> = {
        loading: false,
        result: 'test',
        error: null,
        startTime: 0,
        endTime: 0
      };

      const numberState: AsyncStateInterface<number> = {
        loading: false,
        result: 42,
        error: null,
        startTime: 0,
        endTime: 0
      };

      expect(stringState.result).toBe('test');
      expect(numberState.result).toBe(42);
    });
  });
});

describe('AsyncStateAction', () => {
  let store: AsyncStore<TestUserState, string>;
  let mockStorage: MockStorage<string>;

  beforeEach(() => {
    mockStorage = new MockStorage();
    store = new AsyncStore<TestUserState, string>({
      storage: mockStorage,
      storageKey: 'test-user',
      defaultState: () => null
    });
  });

  afterEach(() => {
    mockStorage.reset();
    vi.clearAllMocks();
  });

  describe('start', () => {
    it('should set loading to true and record startTime', () => {
      const beforeStart = Date.now();
      store.start();
      const afterStart = Date.now();

      expect(store.getLoading()).toBe(true);
      expect(store.getState().startTime).toBeGreaterThanOrEqual(beforeStart);
      expect(store.getState().startTime).toBeLessThanOrEqual(afterStart);
    });

    it('should set initial result if provided', () => {
      const initialUser: TestUser = {
        id: 1,
        name: 'John',
        email: 'john@test.com'
      };
      store.start(initialUser);

      expect(store.getLoading()).toBe(true);
      expect(store.getResult()).toEqual(initialUser);
    });

    it('should set status to pending', () => {
      store.start();
      expect(store.getStatus()).toBe(AsyncStoreStatus.PENDING);
    });

    it('should allow starting multiple times', () => {
      vi.useFakeTimers();
      try {
        store.start();
        const firstStartTime = store.getState().startTime;

        vi.advanceTimersByTime(100);
        store.start();
        const secondStartTime = store.getState().startTime;

        expect(secondStartTime).toBeGreaterThan(firstStartTime);
        expect(store.getLoading()).toBe(true);
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('stopped', () => {
    it('should set loading to false and record endTime', () => {
      store.start();
      const beforeStop = Date.now();
      store.stopped();
      const afterStop = Date.now();

      expect(store.getLoading()).toBe(false);
      expect(store.getState().endTime).toBeGreaterThanOrEqual(beforeStop);
      expect(store.getState().endTime).toBeLessThanOrEqual(afterStop);
    });

    it('should set error if provided', () => {
      const error = new Error('Operation stopped');
      store.start();
      store.stopped(error);

      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
    });

    it('should set result if provided', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.stopped(undefined, user);

      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(user);
    });

    it('should set status to stopped', () => {
      store.start();
      store.stopped();
      expect(store.getStatus()).toBe(AsyncStoreStatus.STOPPED);
    });
  });

  describe('failed', () => {
    it('should set loading to false and record endTime', () => {
      store.start();
      const beforeFail = Date.now();
      const error = new Error('Operation failed');
      store.failed(error);
      const afterFail = Date.now();

      expect(store.getLoading()).toBe(false);
      expect(store.getState().endTime).toBeGreaterThanOrEqual(beforeFail);
      expect(store.getState().endTime).toBeLessThanOrEqual(afterFail);
    });

    it('should set error information', () => {
      const error = new Error('Network error');
      store.start();
      store.failed(error);

      expect(store.getError()).toBe(error);
      expect(store.getLoading()).toBe(false);
    });

    it('should set result if provided (partial data)', () => {
      const error = new Error('Partial failure');
      const partialUser: TestUser = {
        id: 1,
        name: 'John',
        email: 'john@test.com'
      };
      store.start();
      store.failed(error, partialUser);

      expect(store.getError()).toBe(error);
      expect(store.getResult()).toEqual(partialUser);
    });

    it('should preserve existing result when result parameter is not provided', () => {
      const existingUser: TestUser = {
        id: 1,
        name: 'John',
        email: 'john@test.com'
      };
      // Set up existing result
      store.start();
      store.success(existingUser);
      expect(store.getResult()).toEqual(existingUser);

      // Call failed without result parameter
      const error = new Error('Operation failed');
      store.failed(error);

      // Existing result should be preserved
      expect(store.getError()).toBe(error);
      expect(store.getResult()).toEqual(existingUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should clear result when explicitly passing null', () => {
      const existingUser: TestUser = {
        id: 1,
        name: 'John',
        email: 'john@test.com'
      };
      // Set up existing result
      store.start();
      store.success(existingUser);
      expect(store.getResult()).toEqual(existingUser);

      // Call failed with explicit null to clear result
      const error = new Error('Operation failed');
      store.failed(error, null);

      // Result should be cleared
      expect(store.getError()).toBe(error);
      expect(store.getResult()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should set status to failed', () => {
      store.start();
      store.failed(new Error('Failed'));
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });
  });

  describe('success', () => {
    it('should set loading to false and record endTime', () => {
      store.start();
      const beforeSuccess = Date.now();
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);
      const afterSuccess = Date.now();

      expect(store.getLoading()).toBe(false);
      expect(store.getState().endTime).toBeGreaterThanOrEqual(beforeSuccess);
      expect(store.getState().endTime).toBeLessThanOrEqual(afterSuccess);
    });

    it('should set result data', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      expect(store.getResult()).toEqual(user);
      expect(store.getLoading()).toBe(false);
    });

    it('should clear error', () => {
      store.start();
      store.failed(new Error('Previous error'));
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);

      expect(store.getError()).toBeNull();
      expect(store.getResult()).toEqual(user);
    });

    it('should set status to success', () => {
      store.start();
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });
  });

  describe('reset', () => {
    it('should reset all state to initial values', () => {
      store.start();
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);

      store.reset();

      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toBeNull();
      expect(store.getError()).toBeNull();
      expect(store.getState().startTime).toBe(0);
      expect(store.getState().endTime).toBe(0);
    });

    it('should reset after failure', () => {
      store.start();
      store.failed(new Error('Failed'));

      store.reset();

      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBeNull();
      expect(store.getResult()).toBeNull();
    });

    it('should allow starting new operation after reset', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      store.reset();

      store.start();
      expect(store.getLoading()).toBe(true);
      expect(store.getState().startTime).toBeGreaterThan(0);
    });
  });

  describe('updateState', () => {
    it('should update loading state', () => {
      store.updateState({ loading: true });
      expect(store.getLoading()).toBe(true);
    });

    it('should update result', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.updateState({ result: user });
      expect(store.getResult()).toEqual(user);
    });

    it('should update error', () => {
      const error = new Error('Test error');
      store.updateState({ error });
      expect(store.getError()).toBe(error);
    });

    it('should update multiple properties', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.updateState({
        loading: true,
        result: user,
        startTime: Date.now()
      });

      expect(store.getLoading()).toBe(true);
      expect(store.getResult()).toEqual(user);
      expect(store.getState().startTime).toBeGreaterThan(0);
    });

    it('should not affect other properties when updating partial state', () => {
      store.start();
      const originalStartTime = store.getState().startTime;

      store.updateState({
        result: { id: 1, name: 'John', email: 'john@test.com' }
      });

      expect(store.getResult()).not.toBeNull();
      expect(store.getState().startTime).toBe(originalStartTime);
      expect(store.getLoading()).toBe(true);
    });
  });

  describe('getDuration', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return 0 if operation has not started', () => {
      expect(store.getDuration()).toBe(0);
    });

    it('should return time since start if operation is in progress', () => {
      store.start();
      vi.advanceTimersByTime(1000);
      expect(store.getDuration()).toBe(1000);
    });

    it('should return total duration if operation has completed', () => {
      store.start();
      vi.advanceTimersByTime(500);
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      vi.advanceTimersByTime(500);

      expect(store.getDuration()).toBe(500);
    });

    it('should calculate duration correctly for failed operations', () => {
      store.start();
      vi.advanceTimersByTime(750);
      store.failed(new Error('Failed'));
      vi.advanceTimersByTime(250);

      expect(store.getDuration()).toBe(750);
    });
  });
});

describe('AsyncStateStatusInterface', () => {
  let store: AsyncStore<TestUserState, string>;

  beforeEach(() => {
    store = new AsyncStore<TestUserState, string>({
      storage: null,
      defaultState: () => null
    });
  });

  describe('isPending', () => {
    it('should return true when loading is true', () => {
      store.start();
      expect(store.isPending()).toBe(true);
    });

    it('should return false when loading is false', () => {
      expect(store.isPending()).toBe(false);
    });

    it('should return false after operation completes', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isPending()).toBe(false);
    });
  });

  describe('isSuccess', () => {
    it('should return true when operation succeeded', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isSuccess()).toBe(true);
    });

    it('should return false when operation is in progress', () => {
      store.start();
      expect(store.isSuccess()).toBe(false);
    });

    it('should return false when operation failed', () => {
      store.start();
      store.failed(new Error('Failed'));
      expect(store.isSuccess()).toBe(false);
    });

    it('should return false when operation is stopped', () => {
      store.start();
      store.stopped();
      expect(store.isSuccess()).toBe(false);
    });
  });

  describe('isFailed', () => {
    it('should return true when operation failed', () => {
      store.start();
      store.failed(new Error('Failed'));
      expect(store.isFailed()).toBe(true);
    });

    it('should return false when operation succeeded', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isFailed()).toBe(false);
    });

    it('should return false when operation is in progress', () => {
      store.start();
      expect(store.isFailed()).toBe(false);
    });
  });

  describe('isStopped', () => {
    it('should return true when operation is stopped', () => {
      store.start();
      store.stopped();
      expect(store.isStopped()).toBe(true);
    });

    it('should return false when operation succeeded', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isStopped()).toBe(false);
    });

    it('should return false when operation failed', () => {
      store.start();
      store.failed(new Error('Failed'));
      expect(store.isStopped()).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('should return true when operation succeeded', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isCompleted()).toBe(true);
    });

    it('should return true when operation failed', () => {
      store.start();
      store.failed(new Error('Failed'));
      expect(store.isCompleted()).toBe(true);
    });

    it('should return true when operation is stopped', () => {
      store.start();
      store.stopped();
      expect(store.isCompleted()).toBe(true);
    });

    it('should return false when operation is in progress', () => {
      store.start();
      expect(store.isCompleted()).toBe(false);
    });
  });
});

describe('AsyncStoreInterface', () => {
  let store: AsyncStore<TestUserState, string>;
  let mockStorage: MockStorage<string>;

  beforeEach(() => {
    mockStorage = new MockStorage();
    store = new AsyncStore<TestUserState, string>({
      storage: mockStorage,
      storageKey: 'test-user',
      defaultState: () => null
    });
  });

  afterEach(() => {
    mockStorage.reset();
    vi.clearAllMocks();
  });

  describe('getStore', () => {
    it('should return the store instance', () => {
      const storeInstance = store.getStore();
      expect(storeInstance).toBe(store);
    });

    it('should allow accessing store state', () => {
      const storeInstance = store.getStore();
      expect(storeInstance.state).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should return current state object', () => {
      const state = store.getState();
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('result');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('startTime');
      expect(state).toHaveProperty('endTime');
    });

    it('should return updated state after operations', () => {
      store.start();
      const state = store.getState();
      expect(state.loading).toBe(true);
      expect(state.status).toBe(AsyncStoreStatus.PENDING);
    });
  });

  describe('getLoading', () => {
    it('should return loading state', () => {
      expect(store.getLoading()).toBe(false);
      store.start();
      expect(store.getLoading()).toBe(true);
    });
  });

  describe('getError', () => {
    it('should return null when no error', () => {
      expect(store.getError()).toBeNull();
    });

    it('should return error when operation failed', () => {
      const error = new Error('Test error');
      store.start();
      store.failed(error);
      expect(store.getError()).toBe(error);
    });
  });

  describe('getResult', () => {
    it('should return null when no result', () => {
      expect(store.getResult()).toBeNull();
    });

    it('should return result when operation succeeded', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);
      expect(store.getResult()).toEqual(user);
    });
  });

  describe('getStatus', () => {
    it('should return status of the operation', () => {
      store.start();
      expect(store.getStatus()).toBe(AsyncStoreStatus.PENDING);

      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });
  });

  describe('restore', () => {
    it('should return null when storage is not configured', () => {
      const storeWithoutStorage = new AsyncStore<TestUserState, string>({
        storage: null,
        defaultState: () => null
      });
      expect(storeWithoutStorage.restore()).toBeNull();
    });

    it('should return null when storageKey is not configured', () => {
      const storeWithoutKey = new AsyncStore<TestUserState, string>({
        storage: mockStorage,
        storageKey: null,
        defaultState: () => null
      });
      expect(storeWithoutKey.restore()).toBeNull();
    });

    it('should return null when no data exists in storage', () => {
      expect(store.restore()).toBeNull();
    });

    it('should restore result value when storageResult is true (default)', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      mockStorage.setItem('test-user', user);

      const restored = store.restore();
      expect(restored).toEqual(user);
      expect(store.getResult()).toEqual(user);
      expect(typeof restored).toBe('object');
    });

    it('should restore full state when storageResult is false', () => {
      store['storageResult'] = false;
      const fullState: AsyncStoreStateInterface<TestUser> = {
        loading: false,
        result: { id: 1, name: 'John', email: 'john@test.com' },
        error: null,
        startTime: 1000,
        endTime: 2000,
        status: AsyncStoreStatus.SUCCESS
      };
      mockStorage.setItem('test-user', fullState);

      const restored = store.restore<AsyncStoreStateInterface<TestUser>>();
      expect(restored).not.toBeNull();
      expect(restored).toEqual(fullState);
      expect(store.getState()).toEqual(fullState);
    });

    it('should not persist when restoring state', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      mockStorage.setItem('test-user', user);

      const initialSetItemCalls = mockStorage.calls.setItem.length;
      store.restore();
      // restore() calls updateState with { persist: false }, so no additional setItem calls
      expect(mockStorage.calls.setItem.length).toBe(initialSetItemCalls);
    });

    it('should return null when storage getItem throws error', () => {
      const errorStorage = new MockStorage<string>();
      errorStorage.shouldFailGetItem = true;
      const errorStore = new AsyncStore<TestUserState, string>({
        storage: errorStorage,
        storageKey: 'test-user',
        defaultState: () => null
      });

      expect(errorStore.restore()).toBeNull();
    });

    it('should handle null or undefined values from storage', () => {
      mockStorage.setItem('test-user', null as unknown as TestUser);
      expect(store.restore()).toBeNull();

      mockStorage.setItem('test-user', undefined as unknown as TestUser);
      expect(store.restore()).toBeNull();
    });
  });

  describe('persist', () => {
    it('should do nothing when storage is not configured', () => {
      const storeWithoutStorage = new AsyncStore<TestUserState, string>({
        storage: null,
        defaultState: () => null
      });
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      storeWithoutStorage.start();
      storeWithoutStorage.success(user);
      storeWithoutStorage.persist();

      // Should not throw and should not persist
      expect(mockStorage.calls.setItem.length).toBe(0);
    });

    it('should do nothing when storageKey is not configured', () => {
      const storeWithoutKey = new AsyncStore<TestUserState, string>({
        storage: mockStorage,
        storageKey: null,
        defaultState: () => null
      });
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      storeWithoutKey.start();
      storeWithoutKey.success(user);
      storeWithoutKey.persist();

      expect(mockStorage.calls.setItem.length).toBe(0);
    });

    it('should persist only result value when storageResult is true (default)', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      expect(mockStorage.calls.setItem.length).toBeGreaterThan(0);
      const persisted = mockStorage.getItem('test-user');
      expect(persisted).toEqual(user);
      expect(persisted).not.toHaveProperty('loading');
      expect(persisted).not.toHaveProperty('status');
    });

    it('should persist full state when storageResult is false', () => {
      store['storageResult'] = false;
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      const persisted = mockStorage.getItem(
        'test-user'
      ) as AsyncStoreStateInterface<TestUser>;
      expect(persisted).toHaveProperty('loading');
      expect(persisted).toHaveProperty('result');
      expect(persisted).toHaveProperty('error');
      expect(persisted).toHaveProperty('startTime');
      expect(persisted).toHaveProperty('endTime');
      expect(persisted).toHaveProperty('status');
      expect(persisted.result).toEqual(user);
      expect(persisted.status).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should not persist when result is null and storageResult is true', () => {
      store.start();
      store.failed(new Error('Failed'));

      // Clear previous calls
      mockStorage.reset();
      store.persist();

      // When storageResult is true and result is null, persist should not store anything
      const persisted = mockStorage.getItem('test-user');
      expect(persisted).toBeNull();
    });

    it('should persist full state even when result is null if storageResult is false', () => {
      store['storageResult'] = false;
      store.start();
      store.failed(new Error('Failed'));

      // Clear previous calls
      mockStorage.reset();
      store.persist();

      const persisted = mockStorage.getItem(
        'test-user'
      ) as AsyncStoreStateInterface<TestUser>;
      expect(persisted).not.toBeNull();
      expect(persisted.result).toBeUndefined();
      expect(persisted.error).not.toBeNull();
      expect(persisted.status).toBe(AsyncStoreStatus.FAILED);
    });

    it('should automatically persist on state changes', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      expect(mockStorage.calls.setItem.length).toBeGreaterThan(0);
      const persisted = mockStorage.getItem('test-user');
      expect(persisted).toEqual(user);
    });
  });

  describe('storageResult property', () => {
    it('should default to true', () => {
      expect(store['storageResult']).toBe(true);
    });

    it('should allow changing storageResult mode', () => {
      expect(store['storageResult']).toBe(true);

      store['storageResult'] = false;
      expect(store['storageResult']).toBe(false);

      store['storageResult'] = true;
      expect(store['storageResult']).toBe(true);
    });

    it('should affect restore behavior based on storageResult', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };

      // Test with storageResult = true (default)
      mockStorage.setItem('test-user', user);
      const restoredWithResult = store.restore();
      expect(restoredWithResult).toEqual(user);
      expect(typeof restoredWithResult).toBe('object');

      // Reset and test with storageResult = false
      store.reset();
      mockStorage.reset();
      store['storageResult'] = false;
      const fullState: AsyncStoreStateInterface<TestUser> = {
        loading: false,
        result: user,
        error: null,
        startTime: 1000,
        endTime: 2000,
        status: AsyncStoreStatus.SUCCESS
      };
      mockStorage.setItem('test-user', fullState);
      const restoredWithState =
        store.restore<AsyncStoreStateInterface<TestUser>>();
      expect(restoredWithState).toEqual(fullState);
    });

    it('should affect persist behavior based on storageResult', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };

      // Test with storageResult = true (default)
      store.start();
      store.success(user);
      mockStorage.reset();
      store.persist();
      const persistedWithResult = mockStorage.getItem('test-user');
      expect(persistedWithResult).toEqual(user);
      expect(persistedWithResult).not.toHaveProperty('loading');

      // Reset and test with storageResult = false
      store.reset();
      mockStorage.reset();
      store['storageResult'] = false;
      store.start();
      store.success(user);
      store.persist();
      const persistedWithState = mockStorage.getItem(
        'test-user'
      ) as AsyncStoreStateInterface<TestUser>;
      expect(persistedWithState).toHaveProperty('loading');
      expect(persistedWithState).toHaveProperty('status');
      expect(persistedWithState.result).toEqual(user);
    });
  });

  describe('integration tests', () => {
    it('should complete full async operation flow', () => {
      // Start operation
      store.start();
      expect(store.isPending()).toBe(true);
      expect(store.getLoading()).toBe(true);

      // Complete successfully
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);
      expect(store.isSuccess()).toBe(true);
      expect(store.isCompleted()).toBe(true);
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(user);
    });

    it('should handle error flow', () => {
      store.start();
      expect(store.isPending()).toBe(true);

      const error = new Error('Operation failed');
      store.failed(error);
      expect(store.isFailed()).toBe(true);
      expect(store.isCompleted()).toBe(true);
      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
    });

    it('should handle stop flow', () => {
      store.start();
      expect(store.isPending()).toBe(true);

      store.stopped();
      expect(store.isStopped()).toBe(true);
      expect(store.isCompleted()).toBe(true);
      expect(store.getLoading()).toBe(false);
    });

    it('should handle reset and restart', () => {
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });
      expect(store.isSuccess()).toBe(true);

      store.reset();
      expect(store.getResult()).toBeNull();
      expect(store.getError()).toBeNull();
      expect(store.getLoading()).toBe(false);

      store.start();
      expect(store.isPending()).toBe(true);
    });
  });
});

describe('AsyncStore subclass implementation', () => {
  /**
   * Extended async store with custom methods
   */
  class ExtendedAsyncStore<Key, Opt = unknown> extends AsyncStore<
    TestUserState,
    Key,
    Opt
  > {
    private customProperty: string = 'default';

    /**
     * Custom method to set custom property
     */
    setCustomProperty(value: string): void {
      this.customProperty = value;
    }

    /**
     * Custom method to get custom property
     */
    getCustomProperty(): string {
      return this.customProperty;
    }

    override start(result?: TestUser | undefined): void {
      this.setCustomProperty('started');
      super.start(result);
    }

    override success(result: TestUser): void {
      this.setCustomProperty('success');
      super.success(result);
    }

    override failed(error: unknown, result?: TestUser | undefined): void {
      this.setCustomProperty('failed');
      super.failed(error, result);
    }

    override stopped(error?: unknown, result?: TestUser | undefined): void {
      this.setCustomProperty('stopped');
      super.stopped(error, result);
    }

    /**
     * Custom async operation method
     */
    async fetchData(): Promise<void> {
      this.start();
      try {
        // Simulate async operation
        await new Promise((resolve) => setTimeout(resolve, 10));
        const mockData: TestUser = {
          id: 1,
          name: 'Test User',
          email: 'test@example.com'
        };
        this.success(mockData as TestUser);
      } catch (error) {
        this.failed(error);
      }
    }
  }

  let store: ExtendedAsyncStore<string>;
  let mockStorage: MockStorage<string>;

  beforeEach(() => {
    mockStorage = new MockStorage();
    store = new ExtendedAsyncStore<string>({
      storage: mockStorage,
      storageKey: 'extended-store',
      defaultState: () => null
    });
  });

  afterEach(() => {
    mockStorage.reset();
    vi.clearAllMocks();
  });

  describe('inheritance', () => {
    it('should inherit all AsyncStore methods', () => {
      expect(store.start).toBeDefined();
      expect(store.success).toBeDefined();
      expect(store.failed).toBeDefined();
      expect(store.stopped).toBeDefined();
      expect(store.getState).toBeDefined();
      expect(store.getLoading).toBeDefined();
      expect(store.getError).toBeDefined();
      expect(store.getResult).toBeDefined();
      expect(store.getStatus).toBeDefined();
      expect(store.reset).toBeDefined();
    });

    it('should work with inherited methods', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      expect(store.getLoading()).toBe(true);
      expect(store.getStatus()).toBe(AsyncStoreStatus.PENDING);

      store.success(user);
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(user);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should maintain parent class functionality', () => {
      expect(store.getStore()).toBe(store);
      expect(store.getState()).toBeDefined();
      expect(store.getState().loading).toBe(false);
    });
  });

  describe('method overriding', () => {
    it('should call custom logic when overriding start', () => {
      store.start();
      expect(store.getCustomProperty()).toBe('started');
      expect(store.getLoading()).toBe(true);
    });

    it('should call custom logic when overriding success', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);
      expect(store.getCustomProperty()).toBe('success');
      expect(store.getResult()).toEqual(user);
    });

    it('should call custom logic when overriding failed', () => {
      const error = new Error('Test error');
      store.start();
      store.failed(error);
      expect(store.getCustomProperty()).toBe('failed');
      expect(store.getError()).toBe(error);
    });

    it('should call custom logic when overriding stopped', () => {
      store.start();
      store.stopped();
      expect(store.getCustomProperty()).toBe('stopped');
      expect(store.getStatus()).toBe(AsyncStoreStatus.STOPPED);
    });
  });

  describe('custom methods', () => {
    it('should support custom properties and methods', () => {
      expect(store.getCustomProperty()).toBe('default');
      store.setCustomProperty('custom-value');
      expect(store.getCustomProperty()).toBe('custom-value');
    });

    it('should support custom async operations', async () => {
      await store.fetchData();
      expect(store.getCustomProperty()).toBe('success');
      expect(store.getResult()).not.toBeNull();
      expect(store.getLoading()).toBe(false);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });
  });

  describe('persistence with subclass', () => {
    it('should persist state with custom methods', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      expect(mockStorage.calls.setItem.length).toBeGreaterThan(0);
      const persisted = mockStorage.getItem('extended-store');
      expect(persisted).toEqual(user);
    });

    it('should restore state with custom methods', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      mockStorage.setItem('extended-store', user);

      const restored = store.restore();
      expect(restored).toEqual(user);
      expect(store.getResult()).toEqual(user);
    });
  });

  describe('state management with subclass', () => {
    it('should update state correctly with overridden methods', () => {
      store.start();
      expect(store.getState().loading).toBe(true);
      expect(store.getState().status).toBe(AsyncStoreStatus.PENDING);
      expect(store.getCustomProperty()).toBe('started');

      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.success(user);
      expect(store.getState().loading).toBe(false);
      expect(store.getState().result).toEqual(user);
      expect(store.getState().status).toBe(AsyncStoreStatus.SUCCESS);
      expect(store.getCustomProperty()).toBe('success');
    });

    it('should reset state correctly with subclass', () => {
      store.setCustomProperty('test');
      store.start();
      store.success({ id: 1, name: 'John', email: 'john@test.com' });

      store.reset();
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toBeNull();
      expect(store.getError()).toBeNull();
      // Custom property should remain unchanged after reset
      expect(store.getCustomProperty()).toBe('success');
    });
  });
});

describe('AsyncStore extension patterns', () => {
  /**
   * Store with expiration support
   */
  interface ExpiringAsyncStoreState<T> extends AsyncStoreStateInterface<T> {
    expires?: number | Date | null;
  }

  class ExpiringAsyncStore<Key, Opt = unknown> extends AsyncStore<
    TestUserState,
    Key,
    Opt
  > {
    private readonly expirationKey: Key;

    constructor(
      expirationKey: Key,
      options?: AsyncStoreOptions<TestUserState, Key, Opt>
    ) {
      super(options);
      this.expirationKey = expirationKey;
    }

    override restore<R = TestUser | TestUserState>(): R | null {
      if (!this.storage || !this.storageKey) {
        return null;
      }

      try {
        const stored = this.storage.getItem(
          this.storageKey
        ) as ExpiringAsyncStoreState<TestUser> | null;
        if (stored) {
          // Check expiration
          if (stored.expires) {
            const expiresAt =
              typeof stored.expires === 'number'
                ? stored.expires
                : stored.expires.getTime();
            if (Date.now() > expiresAt) {
              // State expired, remove from storage
              this.storage.removeItem(this.storageKey);
              return null;
            }
          }

          this.updateState(stored, { persist: false });
          return this.getResult() as R;
        }
      } catch {
        return null;
      }

      return null;
    }

    /**
     * Set expiration for the current state
     */
    setExpiration(expiresInMs: number): void {
      const expires = Date.now() + expiresInMs;
      this.updateState({
        expires
      } as Partial<ExpiringAsyncStoreState<TestUser>>);
    }
  }

  let store: ExpiringAsyncStore<string>;
  let mockStorage: MockStorage<string>;

  beforeEach(() => {
    mockStorage = new MockStorage();
    store = new ExpiringAsyncStore('expiration-key', {
      storage: mockStorage,
      storageKey: 'expiring-store',
      defaultState: () => null
    });
  });

  afterEach(() => {
    mockStorage.reset();
    vi.clearAllMocks();
  });

  describe('expiration support', () => {
    it('should restore non-expired state', () => {
      const futureTime = Date.now() + 3600000; // 1 hour from now
      const state: ExpiringAsyncStoreState<TestUser> = {
        loading: false,
        result: { id: 1, name: 'John', email: 'john@test.com' },
        error: null,
        startTime: 0,
        endTime: Date.now(),
        status: AsyncStoreStatus.SUCCESS,
        expires: futureTime
      };
      mockStorage.setItem('expiring-store', state);

      const restored = store.restore();
      expect(restored).not.toBeNull();
      expect(store.getResult()).not.toBeNull();
    });

    it('should not restore expired state', () => {
      const pastTime = Date.now() - 1000; // 1 second ago
      const state: ExpiringAsyncStoreState<TestUser> = {
        loading: false,
        result: { id: 1, name: 'John', email: 'john@test.com' },
        error: null,
        startTime: 0,
        endTime: Date.now() - 2000,
        status: AsyncStoreStatus.SUCCESS,
        expires: pastTime
      };
      mockStorage.setItem('expiring-store', state);

      const restored = store.restore();
      expect(restored).toBeNull();
      expect(mockStorage.data.has('expiring-store')).toBe(false);
    });

    it('should set expiration for state', () => {
      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);
      store.setExpiration(3600000); // 1 hour

      const state = store.getState() as ExpiringAsyncStoreState<TestUser>;
      expect(state.expires).toBeDefined();
      expect(state.expires).toBeGreaterThan(Date.now());
    });
  });

  describe('complex extension scenarios', () => {
    /**
     * Store with retry logic
     */
    class RetryableAsyncStore<Key, Opt = unknown> extends AsyncStore<
      TestUserState,
      Key,
      Opt
    > {
      private retryCount: number = 0;
      private maxRetries: number = 3;

      constructor(
        maxRetries: number,
        options?: AsyncStoreOptions<TestUserState, Key, Opt>
      ) {
        super(options);
        this.maxRetries = maxRetries;
      }

      getRetryCount(): number {
        return this.retryCount;
      }

      override failed(error: unknown, result?: TestUser | undefined): void {
        super.failed(error, result);
        this.retryCount++;
      }

      /**
       * Retry the operation
       */
      async retry(operation: () => Promise<TestUser>): Promise<void> {
        if (this.retryCount >= this.maxRetries) {
          return;
        }

        this.start();
        try {
          const result = await operation();
          this.success(result);
          this.retryCount = 0; // Reset on success
        } catch (error) {
          this.failed(error);
        }
      }

      canRetry(): boolean {
        return this.retryCount < this.maxRetries;
      }
    }

    it('should support retry logic extension', async () => {
      const retryStore = new RetryableAsyncStore<TestUserState, string>(3, {
        storage: null,
        defaultState: () => null
      });

      let attemptCount = 0;
      const mockOperation = async (): Promise<TestUser> => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Temporary failure');
        }
        return { id: 1, name: 'John', email: 'john@test.com' };
      };

      // First attempt fails
      await retryStore.retry(mockOperation);
      expect(retryStore.isFailed()).toBe(true);
      expect(retryStore.getRetryCount()).toBe(1);
      expect(retryStore.canRetry()).toBe(true);

      // Second attempt fails
      await retryStore.retry(mockOperation);
      expect(retryStore.getRetryCount()).toBe(2);
      expect(retryStore.canRetry()).toBe(true);

      // Third attempt succeeds
      await retryStore.retry(mockOperation);
      expect(retryStore.isSuccess()).toBe(true);
      expect(retryStore.getRetryCount()).toBe(0); // Reset on success
      expect(attemptCount).toBe(3);
    });

    it('should stop retrying after max retries', async () => {
      const retryStore = new RetryableAsyncStore<TestUserState, string>(2, {
        storage: null,
        defaultState: () => null
      });

      const mockOperation = async (): Promise<TestUser> => {
        throw new Error('Always fails');
      };

      // First attempt
      await retryStore.retry(mockOperation);
      expect(retryStore.canRetry()).toBe(true);

      // Second attempt
      await retryStore.retry(mockOperation);
      expect(retryStore.canRetry()).toBe(false);

      // Third attempt should not retry
      await retryStore.retry(mockOperation);
      expect(retryStore.getRetryCount()).toBe(2); // Still 2, didn't increment
    });
  });

  describe('multiple inheritance levels', () => {
    /**
     * Base extended store
     */
    class BaseExtendedStore<Key, Opt = unknown> extends AsyncStore<
      TestUserState,
      Key,
      Opt
    > {
      protected baseProperty: string = 'base';

      getBaseProperty(): string {
        return this.baseProperty;
      }
    }

    /**
     * Further extended store
     */
    class FurtherExtendedStore<Key, Opt = unknown> extends BaseExtendedStore<
      Key,
      Opt
    > {
      private derivedProperty: string = 'derived';

      getDerivedProperty(): string {
        return this.derivedProperty;
      }

      override start(result?: TestUser | undefined): void {
        this.baseProperty = 'modified-base';
        this.derivedProperty = 'modified-derived';
        super.start(result);
      }
    }

    it('should support multiple inheritance levels', () => {
      const store = new FurtherExtendedStore<TestUser, string>({
        storage: null,
        defaultState: () => null
      });

      expect(store.getBaseProperty()).toBe('base');
      expect(store.getDerivedProperty()).toBe('derived');

      store.start();
      expect(store.getBaseProperty()).toBe('modified-base');
      expect(store.getDerivedProperty()).toBe('modified-derived');
      expect(store.getLoading()).toBe(true);
    });

    it('should maintain all parent functionality', () => {
      const store = new FurtherExtendedStore<TestUser, string>({
        storage: null,
        defaultState: () => null
      });

      const user: TestUser = { id: 1, name: 'John', email: 'john@test.com' };
      store.start();
      store.success(user);

      expect(store.getResult()).toEqual(user);
      expect(store.isSuccess()).toBe(true);
      expect(store.getState()).toBeDefined();
    });
  });
});
