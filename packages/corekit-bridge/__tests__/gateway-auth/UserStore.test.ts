/**
 * UserStore test suite
 *
 * Coverage:
 * 1. Constructor          – Constructor tests with various configurations
 * 2. Persistence (default) – Default behavior: only credential is persisted
 * 3. Dual persistence     – Persist both user info and credential separately
 * 4. Restore              – Restore credential and user info from storage
 * 5. Persist              – Persist credential and user info to storage
 * 6. Error handling       – Error handling in restore and persist
 * 7. Edge cases           – Boundary conditions and edge cases
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { UserStore } from '../../src/core/gateway-auth/impl/UserStore';
import type { SyncStorageInterface } from '@qlover/fe-corekit';
import { AsyncStoreStatus } from '../../src/core/store-state';

/**
 * Test credential type
 */
interface TestCredential {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Test user type
 */
interface TestUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Mock storage implementation for testing
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();
  public shouldFailGetItem: boolean = false;
  public shouldFailSetItem: boolean = false;
  public calls: {
    setItem: Array<{ key: Key; value: unknown }>;
    getItem: Array<{ key: Key }>;
    removeItem: Array<{ key: Key }>;
    clear: number;
  } = {
    setItem: [],
    getItem: [],
    removeItem: [],
    clear: 0
  };

  public get length(): number {
    return this.data.size;
  }

  public setItem<T>(key: Key, value: T): T {
    if (this.shouldFailSetItem) {
      throw new Error('Storage setItem failed');
    }
    this.calls.setItem.push({ key, value });
    this.data.set(String(key), value);
    return value;
  }

  public getItem<T>(key: Key): T | null {
    if (this.shouldFailGetItem) {
      throw new Error('Storage getItem failed');
    }
    this.calls.getItem.push({ key });
    const value = this.data.get(String(key));
    return (value ?? null) as T | null;
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
    this.calls = {
      setItem: [],
      getItem: [],
      removeItem: [],
      clear: 0
    };
  }
}

describe('UserStore', () => {
  let mockStorage: MockStorage<string>;
  let store: UserStore<TestUser, TestCredential, string>;

  /**
   * Test data fixtures
   */
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

  beforeEach(() => {
    mockStorage = new MockStorage<string>();
    mockStorage.reset();
  });

  describe('Constructor', () => {
    it('should initialize with default options', () => {
      store = new UserStore<TestUser, TestCredential, string>();

      expect(store.getCredential()).toBeNull();
      expect(store.getUser()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should initialize with storage and storageKey', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });

      expect(store.getStorage()).toBe(mockStorage);
      // credentialStorageKey should default to storageKey
      expect(store['credentialStorageKey']).toBe('auth-token');
      expect(store['persistUserInfo']).toBe(false);
    });

    it('should initialize with credentialStorageKey', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token'
      });

      expect(store['credentialStorageKey']).toBe('auth-token');
      expect(store['persistUserInfo']).toBe(false);
    });

    it('should initialize with persistUserInfo option', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true
      });

      expect(store['persistUserInfo']).toBe(true);
    });

    it('should restore credential from storage on initialization', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: true
      });

      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should handle restore errors gracefully during initialization', () => {
      mockStorage.shouldFailGetItem = true;

      expect(() => {
        store = new UserStore<TestUser, TestCredential, string>({
          storage: mockStorage,
          storageKey: 'auth-token',
          initRestore: true
        });
      }).not.toThrow();

      expect(store.getCredential()).toBeNull();
    });
  });

  describe('Default Persistence Behavior (credential only)', () => {
    beforeEach(() => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });
    });

    it('should persist only credential, not user info', () => {
      store.success(testUser, testCredential);

      // Credential should be persisted
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.calls.setItem[0]).toEqual({
        key: 'auth-token',
        value: testCredential
      });
    });

    it('should not persist user info when only credential is configured', () => {
      store.success(testUser, testCredential);

      // User info should NOT be persisted
      const userInfoInStorage = mockStorage.data.get('auth-token');
      expect(userInfoInStorage).not.toEqual(testUser);
      expect(userInfoInStorage).toEqual(testCredential);
    });

    it('should clear credential from storage when set to null', () => {
      // First set credential
      store.success(testUser, testCredential);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);

      // Reset removeItem calls count
      const removeItemCallsBefore = mockStorage.calls.removeItem.length;

      // Then clear it
      store.setCredential(null);
      expect(mockStorage.data.has('auth-token')).toBe(false);
      // setCredential(null) triggers persist which calls removeItem
      expect(mockStorage.calls.removeItem.length).toBeGreaterThan(
        removeItemCallsBefore
      );
      expect(
        mockStorage.calls.removeItem.some((call) => call.key === 'auth-token')
      ).toBe(true);
    });

    it('should use storageKey for credential storage by default', () => {
      store.success(testUser, testCredential);

      expect(mockStorage.calls.setItem[0].key).toBe('auth-token');
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
    });
  });

  describe('Dual Persistence (user info and credential)', () => {
    beforeEach(() => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true
      });
    });

    it('should persist both user info and credential separately', () => {
      store.success(testUser, testCredential);

      // Both should be persisted
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
      expect(mockStorage.data.get('user-info')).toEqual(testUser);
      // success() triggers persist twice (once from super.success(), once from setCredential())
      // Each persist sets both credential and userInfo, so we expect at least 2 setItem calls
      // (one for credential, one for userInfo), but may be more due to multiple persist calls
      expect(mockStorage.calls.setItem.length).toBeGreaterThanOrEqual(2);
      // Verify both credential and userInfo are persisted
      expect(
        mockStorage.calls.setItem.some(
          (call) => call.key === 'auth-token' && call.value === testCredential
        )
      ).toBe(true);
      expect(
        mockStorage.calls.setItem.some(
          (call) => call.key === 'user-info' && call.value === testUser
        )
      ).toBe(true);
    });

    it('should persist credential to credentialStorageKey', () => {
      store.success(testUser, testCredential);

      const credentialCall = mockStorage.calls.setItem.find(
        (call) => call.key === 'auth-token'
      );
      expect(credentialCall?.value).toEqual(testCredential);
    });

    it('should persist user info to storageKey', () => {
      store.success(testUser, testCredential);

      const userInfoCall = mockStorage.calls.setItem.find(
        (call) => call.key === 'user-info'
      );
      expect(userInfoCall?.value).toEqual(testUser);
    });

    it('should clear user info from storage when set to null', () => {
      // First set both
      store.success(testUser, testCredential);
      expect(mockStorage.data.get('user-info')).toEqual(testUser);

      // Then clear user info
      store.setUser(null);
      expect(mockStorage.data.has('user-info')).toBe(false);
      expect(
        mockStorage.calls.removeItem.some((call) => call.key === 'user-info')
      ).toBe(true);
    });

    it('should not persist user info when credentialStorageKey equals storageKey', () => {
      // When keys are the same, only credential should be persisted
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        credentialStorageKey: 'auth-token', // Same key
        persistUserInfo: true
      });

      store.success(testUser, testCredential);

      // Only credential should be persisted (once)
      expect(mockStorage.calls.setItem).toHaveLength(1);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
      expect(mockStorage.data.get('auth-token')).not.toEqual(testUser);
    });
  });

  describe('Restore', () => {
    it('should restore credential from storage', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });

      const restored = store.restore();

      expect(restored).toEqual(testCredential);
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should NOT automatically set status to SUCCESS when credential is restored', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);

      store.restore();

      // Status should remain DRAFT - developers must decide when to set it to SUCCESS
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should allow manual setting of status after restore', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      store.restore();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
      expect(store.getCredential()).toEqual(testCredential);

      // Manually set status to SUCCESS based on application logic
      store.updateState({
        status: AsyncStoreStatus.SUCCESS,
        loading: false,
        error: null,
        endTime: Date.now()
      });

      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should restore both user info and credential when dual persistence is enabled', () => {
      mockStorage.setItem('auth-token', testCredential);
      mockStorage.setItem('user-info', testUser);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true,
        initRestore: false // Don't auto-restore, we'll call manually
      });

      const restored = store.restore();

      expect(restored).toEqual(testCredential);
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      // Status should NOT be automatically set to SUCCESS
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should not restore user info when credentialStorageKey equals storageKey', () => {
      mockStorage.setItem('auth-token', testCredential);
      mockStorage.setItem('auth-token', testUser); // Overwrite with user info

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        credentialStorageKey: 'auth-token', // Same key
        persistUserInfo: true,
        initRestore: false
      });

      const restored = store.restore();

      // Should restore credential (which overwrote user info)
      expect(restored).toEqual(testUser); // Last value set
      expect(store.getUser()).not.toEqual(testUser); // User info not restored separately
    });

    it('should return null when storage is not configured', () => {
      store = new UserStore<TestUser, TestCredential, string>();

      const restored = store.restore();

      expect(restored).toBeNull();
    });

    it('should return null when storageKey is not configured', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage
        // No storageKey
      });

      const restored = store.restore();

      expect(restored).toBeNull();
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.shouldFailGetItem = true;

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      const restored = store.restore();

      expect(restored).toBeNull();
      expect(store.getCredential()).toBeNull();
    });

    it('should not restore user info when persistUserInfo is false', () => {
      mockStorage.setItem('auth-token', testCredential);
      mockStorage.setItem('user-info', testUser);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: false, // Not enabled
        initRestore: false
      });

      store.restore();

      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toBeNull(); // User info not restored
      // Status should NOT be automatically set
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should restore credential but status remains DRAFT (developer decides when to set SUCCESS)', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      const restored = store.restore();

      // Credential is restored
      expect(restored).toEqual(testCredential);
      expect(store.getCredential()).toEqual(testCredential);
      // But status remains DRAFT - developer must decide when to set it to SUCCESS
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });
  });

  describe('Persist', () => {
    beforeEach(() => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });
    });

    it('should persist credential when set', () => {
      store.setCredential(testCredential);

      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
      expect(mockStorage.calls.setItem).toHaveLength(1);
    });

    it('should persist credential via success method', () => {
      store.success(testUser, testCredential);

      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
    });

    it('should persist credential via start method', () => {
      store.start(testUser, testCredential);

      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
    });

    it('should work correctly when start is called with credential while state already has credential', () => {
      // First set credential and user via success
      store.success(testUser, testCredential);
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);

      // Create a new credential
      const newCredential: TestCredential = {
        token: 'new-token-789',
        refreshToken: 'new-refresh-token-789',
        expiresIn: 7200
      };

      // Call start with credential but without result - credential should update, but result may be reset
      store.start(undefined, newCredential);
      expect(store.getCredential()).toEqual(newCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.PENDING);
      expect(store.getState().loading).toBe(true);
      // Result may be reset to undefined when start(undefined) is called
      // getUser() returns null when result is undefined (due to ?? null)
      expect(store.getUser()).toBeNull();
      expect(mockStorage.data.get('auth-token')).toEqual(newCredential);
    });

    it('should work correctly when start is called with both result and credential while state already has credential', () => {
      // First set credential and user via success
      store.success(testUser, testCredential);
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);

      // Create new credential and updated user
      const newCredential: TestCredential = {
        token: 'new-token-789',
        refreshToken: 'new-refresh-token-789',
        expiresIn: 7200
      };
      const updatedUser: TestUser = {
        ...testUser,
        name: 'Jane Doe'
      };

      // Call start with both result and credential - both should update
      store.start(updatedUser, newCredential);
      expect(store.getCredential()).toEqual(newCredential);
      expect(store.getUser()).toEqual(updatedUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.PENDING);
      expect(store.getState().loading).toBe(true);
      expect(mockStorage.data.get('auth-token')).toEqual(newCredential);
    });

    it('should handle storage errors gracefully', () => {
      mockStorage.shouldFailSetItem = true;

      expect(() => {
        store.setCredential(testCredential);
      }).not.toThrow();
    });

    it('should not persist when storage is not configured', () => {
      store = new UserStore<TestUser, TestCredential, string>();

      expect(() => {
        store.setCredential(testCredential);
      }).not.toThrow();
    });

    it('should clear credential from storage when credential is null', () => {
      // First set credential
      store.setCredential(testCredential);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);

      // Then clear it
      store.setCredential(null);
      expect(mockStorage.data.has('auth-token')).toBe(false);
      expect(mockStorage.calls.removeItem).toHaveLength(1);
    });
  });

  describe('Integration Tests', () => {
    it('should persist and restore credential correctly', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });

      // Set credential
      store.success(testUser, testCredential);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);

      // Create new store instance and restore
      const newStore = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: true
      });

      expect(newStore.getCredential()).toEqual(testCredential);
      expect(newStore.getUser()).toBeNull(); // User info not persisted
    });

    it('should persist and restore both user info and credential correctly', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true
      });

      // Set both
      store.success(testUser, testCredential);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
      expect(mockStorage.data.get('user-info')).toEqual(testUser);

      // Create new store instance and restore
      const newStore = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true,
        initRestore: true
      });

      expect(newStore.getCredential()).toEqual(testCredential);
      expect(newStore.getUser()).toEqual(testUser);
    });

    it('should maintain credential across multiple operations', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });

      // Set credential
      store.success(testUser, testCredential);
      expect(store.getCredential()).toEqual(testCredential);

      // Update user info (credential should remain)
      store.success({ ...testUser, name: 'Jane Doe' });
      expect(store.getCredential()).toEqual(testCredential);
      expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
    });
  });

  describe('Restore Status Handling (Developer Decision)', () => {
    it('should restore credential but NOT set status to SUCCESS automatically', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      store.restore();

      // Credential is restored
      expect(store.getCredential()).toEqual(testCredential);
      // But status remains DRAFT - developer decides when to set SUCCESS
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should allow developer to set status to SUCCESS after validation', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      store.restore();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);

      // Example: Developer validates credential and sets status
      const credential = store.getCredential();
      if (credential && credential.expiresIn > 0) {
        // Credential is valid, set status to SUCCESS
        store.updateState({
          status: AsyncStoreStatus.SUCCESS,
          loading: false,
          error: null,
          endTime: Date.now()
        });
      }

      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should allow developer to clear credential if validation fails', () => {
      // Use an expired credential for this test
      const expiredCredential: TestCredential = {
        ...testCredential,
        expiresIn: -1000 // Expired (negative value)
      };
      mockStorage.setItem('auth-token', expiredCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      store.restore();
      expect(store.getCredential()).toEqual(expiredCredential);

      // Example: Developer validates and finds credential invalid
      const credential = store.getCredential();
      if (credential && credential.expiresIn <= 0) {
        // Credential expired, clear it
        store.setCredential(null);
      }

      // Credential should be cleared because it was expired
      expect(store.getCredential()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should restore both credential and user info but status remains DRAFT', () => {
      mockStorage.setItem('auth-token', testCredential);
      mockStorage.setItem('user-info', testUser);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true,
        initRestore: false
      });

      store.restore();

      // Both are restored
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      // But status remains DRAFT
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null credential gracefully', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token'
      });

      store.setCredential(null);

      expect(store.getCredential()).toBeNull();
      expect(mockStorage.data.has('auth-token')).toBe(false);
    });

    it('should handle null user info gracefully', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'user-info',
        credentialStorageKey: 'auth-token',
        persistUserInfo: true
      });

      store.setUser(null);

      expect(store.getUser()).toBeNull();
      expect(mockStorage.data.has('user-info')).toBe(false);
    });

    it('should handle undefined credentialStorageKey correctly', () => {
      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        credentialStorageKey: undefined
      });

      // Should use storageKey as credentialStorageKey
      expect(store['credentialStorageKey']).toBe('auth-token');
    });

    it('should handle initRestore: false correctly', () => {
      mockStorage.setItem('auth-token', testCredential);

      store = new UserStore<TestUser, TestCredential, string>({
        storage: mockStorage,
        storageKey: 'auth-token',
        initRestore: false
      });

      // Credential should not be restored automatically
      expect(store.getCredential()).toBeNull();

      // But can be restored manually
      store.restore();
      expect(store.getCredential()).toEqual(testCredential);
    });
  });
});
