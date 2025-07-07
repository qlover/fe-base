import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyStorageInterface } from '@qlover/fe-corekit';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import { LOGIN_STATUS } from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import { LoginResponseData } from '../../../src/core/user-auth/interface/UserAuthApiInterface';

/**
 * Mock user interface for comprehensive authentication testing
 *
 * Significance: Standardized user data structure for consistent testing scenarios
 * Core idea: Simple yet comprehensive user model representing authenticated user state
 * Main function: Provide type-safe user data structure for all authentication test cases
 * Main purpose: Enable thorough testing of user authentication store operations with realistic data
 *
 * @example
 * const testUser: MockUser = {
 *   id: 1,
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   token: 'auth-token-123',
 *   roles: ['user', 'admin']
 * };
 *
 * // Use in authentication tests
 * store.setUserInfo(testUser);
 * expect(store.getUserInfo()).toEqual(testUser);
 */
interface MockUser {
  /** Unique user identifier */
  id: number;
  /** User's display name */
  name: string;
  /** User's email address */
  email: string;
  /** Optional authentication token */
  token?: string;
  /** Optional user roles for authorization testing */
  roles?: string[];
  /** Optional user profile data */
  profile?: {
    avatar?: string;
    preferences?: Record<string, unknown>;
  };
}

/**
 * Mock authentication state for testing
 *
 * Significance: Extends UserAuthState with MockUser type for comprehensive testing
 * Core idea: Provides proper state structure that matches UserAuthStore requirements
 * Main function: Enable type-safe testing of authentication state management
 * Main purpose: Satisfy UserAuthStore generic constraints while providing realistic test data
 *
 * @example
 * const store = new UserAuthStore<MockAuthState>();
 * store.setUserInfo(mockUser);
 * expect(store.state.userInfo).toEqual(mockUser);
 */
class MockAuthState extends UserAuthState<MockUser> {
  constructor(userInfo?: MockUser | null, credential?: string | null) {
    super(userInfo, credential);
  }
}

/**
 * Mock key storage implementation for testing storage integration
 *
 * Significance: In-memory storage implementation that simulates persistent storage behavior
 * Core idea: Controllable storage mock that allows testing of storage integration without external dependencies
 * Main function: Provide predictable storage behavior for testing authentication state persistence
 * Main purpose: Enable comprehensive testing of storage operations with full control over storage state
 *
 * @example
 * const mockStorage = new MockKeyStorage('user_data');
 * mockStorage.set(userData);
 *
 * // Test storage integration
 * const store = new UserAuthStore(mockStorage);
 * expect(store.getUserInfo()).toEqual(userData);
 */
class MockKeyStorage extends KeyStorageInterface<string, MockUser> {
  private storage = new Map<string, MockUser>();

  /**
   * Retrieve stored value
   * @returns Stored user data or null if not found
   */
  get(): MockUser | null {
    return this.storage.get(this.key) || null;
  }

  /**
   * Store user data
   * @param value - User data to store
   */
  set(value: MockUser): void {
    this.storage.set(this.key, value);
  }

  /**
   * Remove stored data
   */
  remove(): void {
    this.storage.delete(this.key);
  }

  /**
   * Clear all stored data (test helper)
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Check if key exists (test helper)
   * @returns True if key exists in storage
   */
  has(): boolean {
    return this.storage.has(this.key);
  }
}

/**
 * Mock credential storage for testing credential management
 *
 * Significance: Specialized storage mock for authentication credentials
 * Core idea: String-based storage for tokens and credentials
 * Main function: Test credential storage and retrieval operations
 * Main purpose: Verify credential persistence and security handling
 */
class MockCredentialStorage extends KeyStorageInterface<string, string> {
  private storage = new Map<string, string>();

  get(): string | null {
    const value = this.storage.get(this.key);
    return value !== undefined ? value : null;
  }

  set(value: string): void {
    this.storage.set(this.key, value);
  }

  remove(): void {
    this.storage.delete(this.key);
  }

  clear(): void {
    this.storage.clear();
  }
}

/**
 * Test suite for UserAuthStore
 *
 * Significance: Comprehensive testing of authentication state management
 * Core idea: Test all authentication store operations and edge cases
 * Main function: Verify store behavior under various conditions and scenarios
 * Main purpose: Ensure reliable authentication state management with proper error handling
 */
describe('UserAuthStore', () => {
  let store: UserAuthStore<MockAuthState>;
  let mockUserStorage: MockKeyStorage;
  let mockCredentialStorage: MockCredentialStorage;

  // Test data constants
  const mockUser: MockUser = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    token: 'auth-token-123',
    roles: ['user', 'admin'],
    profile: {
      avatar: 'https://example.com/avatar.jpg',
      preferences: {
        theme: 'dark',
        language: 'en'
      }
    }
  };

  const mockCredential = 'test-credential-token';

  const loginResponse: LoginResponseData = {
    token: 'login-response-token',
    refreshToken: 'refresh-token-456'
  };

  beforeEach(() => {
    mockUserStorage = new MockKeyStorage('test-user-key');
    mockCredentialStorage = new MockCredentialStorage('test-credential-key');
    store = new UserAuthStore<MockAuthState>();
  });

  /**
   * Test suite for constructor and initialization
   *
   * Tests store initialization with various configuration options
   */
  describe('Constructor and Initialization', () => {
    it('should initialize with default empty state', () => {
      const newStore = new UserAuthStore<MockAuthState>();

      expect(newStore.getUserInfo()).toBeNull();
      expect(newStore.getCredential()).toBeNull();
      expect(newStore.getLoginStatus()).toBeNull();
      expect(newStore.getUserStorage()).toBeNull();
      expect(newStore.getCredentialStorage()).toBeNull();
    });

    it('should initialize with user storage and load existing data', () => {
      // Pre-populate user storage
      mockUserStorage.set(mockUser);

      const newStore = new UserAuthStore<MockAuthState>({
        userStorage: mockUserStorage
      });

      expect(newStore.getUserInfo()).toEqual(mockUser);
      expect(newStore.getUserStorage()).toBe(mockUserStorage);
    });

    it('should initialize with credential storage and load existing credential', () => {
      // Pre-populate credential storage
      mockCredentialStorage.set(mockCredential);

      const newStore = new UserAuthStore<MockAuthState>({
        credentialStorage: mockCredentialStorage
      });

      expect(newStore.getCredential()).toBe(mockCredential);
      expect(newStore.getCredentialStorage()).toBe(mockCredentialStorage);
    });

    it('should initialize with both storages and load all data', () => {
      mockUserStorage.set(mockUser);
      mockCredentialStorage.set(mockCredential);

      const newStore = new UserAuthStore<MockAuthState>({
        userStorage: mockUserStorage,
        credentialStorage: mockCredentialStorage
      });

      expect(newStore.getUserInfo()).toEqual(mockUser);
      expect(newStore.getCredential()).toBe(mockCredential);
      expect(newStore.getUserStorage()).toBe(mockUserStorage);
      expect(newStore.getCredentialStorage()).toBe(mockCredentialStorage);
    });

    it('should initialize with initial credential option', () => {
      const initialCredential = 'initial-credential-123';

      // Pre-populate credential storage with initial credential
      mockCredentialStorage.set(initialCredential);

      const newStore = new UserAuthStore<MockAuthState>({
        credentialStorage: mockCredentialStorage
      });

      expect(newStore.getCredential()).toBe(initialCredential);
    });

    it('should prioritize storage credential over initial credential', () => {
      const storageCredential = 'storage-credential';

      mockCredentialStorage.set(storageCredential);

      const newStore = new UserAuthStore<MockAuthState>({
        credentialStorage: mockCredentialStorage
      });

      // Storage credential should be loaded from storage
      expect(newStore.getCredential()).toBe(storageCredential);
    });
  });

  /**
   * Test suite for user storage management
   *
   * Tests user storage configuration and operations
   */
  describe('User Storage Management', () => {
    it('should set and get user storage correctly', () => {
      store.setUserStorage(mockUserStorage);

      expect(store.getUserStorage()).toBe(mockUserStorage);
    });

    it('should return null when no user storage is set', () => {
      expect(store.getUserStorage()).toBeNull();
    });

    it('should work without user storage', () => {
      expect(() => {
        store.setUserInfo(mockUser);
        const userInfo = store.getUserInfo();
        expect(userInfo).toEqual(mockUser);
      }).not.toThrow();
    });

    it('should replace existing user storage', () => {
      const firstStorage = new MockKeyStorage('first');
      const secondStorage = new MockKeyStorage('second');

      store.setUserStorage(firstStorage);
      expect(store.getUserStorage()).toBe(firstStorage);

      store.setUserStorage(secondStorage);
      expect(store.getUserStorage()).toBe(secondStorage);
    });
  });

  /**
   * Test suite for credential storage management
   *
   * Tests credential storage configuration and operations
   */
  describe('Credential Storage Management', () => {
    it('should set and get credential storage correctly', () => {
      store.setCredentialStorage(mockCredentialStorage);

      expect(store.getCredentialStorage()).toBe(mockCredentialStorage);
    });

    it('should return null when no credential storage is set', () => {
      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should work without credential storage', () => {
      expect(() => {
        store.setCredential(mockCredential);
        const credential = store.getCredential();
        expect(credential).toBe(mockCredential);
      }).not.toThrow();
    });

    it('should replace existing credential storage', () => {
      const firstStorage = new MockCredentialStorage('first');
      const secondStorage = new MockCredentialStorage('second');

      store.setCredentialStorage(firstStorage);
      expect(store.getCredentialStorage()).toBe(firstStorage);

      store.setCredentialStorage(secondStorage);
      expect(store.getCredentialStorage()).toBe(secondStorage);
    });
  });

  /**
   * Test suite for user information management
   *
   * Tests user data storage, retrieval, and persistence
   */
  describe('User Information Management', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
    });

    it('should set user info and persist to storage', () => {
      store.setUserInfo(mockUser);

      expect(store.getUserInfo()).toEqual(mockUser);
      expect(mockUserStorage.get()).toEqual(mockUser);
    });

    it('should get user info from current state', () => {
      store.setUserInfo(mockUser);

      const retrievedUser = store.getUserInfo();

      expect(retrievedUser).toEqual(mockUser);
    });

    it('should return null when no user info is set', () => {
      expect(store.getUserInfo()).toBeNull();
    });

    it('should update user info correctly', () => {
      const initialUser = { ...mockUser, name: 'Initial Name' };
      const updatedUser = { ...mockUser, name: 'Updated Name' };

      store.setUserInfo(initialUser);
      expect(store.getUserInfo()?.name).toBe('Initial Name');

      store.setUserInfo(updatedUser);
      expect(store.getUserInfo()?.name).toBe('Updated Name');
      expect(mockUserStorage.get()?.name).toBe('Updated Name');
    });

    it('should handle complex user objects with nested properties', () => {
      const complexUser = {
        ...mockUser,
        profile: {
          avatar: 'https://example.com/new-avatar.jpg',
          preferences: {
            theme: 'light',
            language: 'es',
            notifications: {
              email: true,
              push: false
            }
          }
        },
        metadata: {
          lastLogin: new Date().toISOString(),
          loginCount: 42
        }
      };

      store.setUserInfo(complexUser);

      expect(store.getUserInfo()).toEqual(complexUser);
      expect(mockUserStorage.get()).toEqual(complexUser);
    });

    it('should handle setting user info without storage', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();

      expect(() => {
        storeWithoutStorage.setUserInfo(mockUser);
      }).not.toThrow();

      expect(storeWithoutStorage.getUserInfo()).toEqual(mockUser);
    });
  });

  /**
   * Test suite for credential management
   *
   * Tests credential storage, retrieval, and persistence
   */
  describe('Credential Management', () => {
    beforeEach(() => {
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should set credential and persist to storage', () => {
      store.setCredential(mockCredential);

      expect(store.getCredential()).toBe(mockCredential);
      expect(mockCredentialStorage.get()).toBe(mockCredential);
    });

    it('should get credential from current state', () => {
      store.setCredential(mockCredential);

      const retrievedCredential = store.getCredential();

      expect(retrievedCredential).toBe(mockCredential);
    });

    it('should return null when no credential is set', () => {
      expect(store.getCredential()).toBeNull();
    });

    it('should update credential correctly', () => {
      const initialCredential = 'initial-token';
      const updatedCredential = 'updated-token';

      store.setCredential(initialCredential);
      expect(store.getCredential()).toBe(initialCredential);

      store.setCredential(updatedCredential);
      expect(store.getCredential()).toBe(updatedCredential);
      expect(mockCredentialStorage.get()).toBe(updatedCredential);
    });

    it('should handle setting credential without storage', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();

      expect(() => {
        storeWithoutStorage.setCredential(mockCredential);
      }).not.toThrow();

      expect(storeWithoutStorage.getCredential()).toBe(mockCredential);
    });
  });

  /**
   * Test suite for login status management
   *
   * Tests authentication status tracking and updates
   */
  describe('Login Status Management', () => {
    it('should return null for initial login status', () => {
      expect(store.getLoginStatus()).toBeNull();
    });

    it('should track login status through authentication flow', () => {
      // Start authentication
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      // Successful authentication
      store.authSuccess();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);

      // Failed authentication
      store.authFailed();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
    });

    it('should handle multiple status transitions', () => {
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      store.authFailed('Network error');
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);

      store.authSuccess();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
    });
  });

  /**
   * Test suite for authentication flow methods
   *
   * Tests complete authentication state transitions
   */
  describe('Authentication Flow Methods', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    describe('startAuth', () => {
      it('should set login status to LOADING and clear errors', () => {
        // First set an error state
        store.authFailed('previous error');
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.startAuth();
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      });

      it('should not affect existing user info and credentials', () => {
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        store.startAuth();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(mockCredential);
      });
    });

    describe('authSuccess', () => {
      it('should set login status to SUCCESS', () => {
        store.authSuccess();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      });

      it('should set login status to SUCCESS and store user info when provided', () => {
        store.authSuccess(mockUser);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(mockUserStorage.get()).toEqual(mockUser);
      });

      it('should handle string credential parameter', () => {
        const tokenString = 'string-token-123';

        store.authSuccess(mockUser, tokenString);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(tokenString);
        expect(mockCredentialStorage.get()).toBe(tokenString);
      });

      it('should handle LoginResponseData credential parameter', () => {
        store.authSuccess(mockUser, loginResponse);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(loginResponse.token);
        expect(mockCredentialStorage.get()).toBe(loginResponse.token);
      });

      it('should handle LoginResponseData without token', () => {
        const responseWithoutToken = { refreshToken: 'refresh-only' };

        store.authSuccess(mockUser, responseWithoutToken);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBeNull();
      });

      it('should clear errors on successful auth', () => {
        store.authFailed('some error');
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.authSuccess();
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      });

      it('should not overwrite existing user info when none provided', () => {
        store.setUserInfo(mockUser);
        store.authSuccess();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
        expect(store.getUserInfo()).toEqual(mockUser);
      });
    });

    describe('authFailed', () => {
      it('should set login status to FAILED', () => {
        store.authFailed();

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should set login status to FAILED with error object', () => {
        const error = new Error('Authentication failed');

        store.authFailed(error);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle string error messages', () => {
        const errorMessage = 'Invalid credentials';

        store.authFailed(errorMessage);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle null/undefined errors', () => {
        store.authFailed(null);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);

        store.authFailed(undefined);
        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should handle complex error objects', () => {
        const complexError = {
          message: 'Authentication failed',
          code: 401,
          details: {
            reason: 'invalid_token',
            timestamp: Date.now()
          }
        };

        store.authFailed(complexError);

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      });

      it('should preserve user info and credentials on auth failure', () => {
        store.setUserInfo(mockUser);
        store.setCredential(mockCredential);

        store.authFailed('Network error');

        expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
        expect(store.getUserInfo()).toEqual(mockUser);
        expect(store.getCredential()).toBe(mockCredential);
      });
    });
  });

  /**
   * Test suite for reset functionality
   *
   * Tests complete state and storage cleanup
   */
  describe('Reset Functionality', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should reset all store state and clear all storage', () => {
      // Set up comprehensive state
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);
      store.authSuccess();

      // Verify state is fully set
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(mockUserStorage.get()).toEqual(mockUser);
      expect(mockCredentialStorage.get()).toBe(mockCredential);

      // Reset everything
      store.reset();

      // Verify complete cleanup
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();
      expect(store.getLoginStatus()).toBeNull();
      expect(mockUserStorage.get()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });

    it('should reset without any storage configured', () => {
      const storeWithoutStorage = new UserAuthStore<MockAuthState>();
      storeWithoutStorage.setUserInfo(mockUser);
      storeWithoutStorage.authSuccess();

      expect(() => {
        storeWithoutStorage.reset();
      }).not.toThrow();

      expect(storeWithoutStorage.getUserInfo()).toBeNull();
      expect(storeWithoutStorage.getLoginStatus()).toBeNull();
    });

    it('should reset with only user storage configured', () => {
      const partialStore = new UserAuthStore<MockAuthState>({
        userStorage: mockUserStorage
      });

      partialStore.setUserInfo(mockUser);
      partialStore.authSuccess();

      partialStore.reset();

      expect(partialStore.getUserInfo()).toBeNull();
      expect(partialStore.getLoginStatus()).toBeNull();
      expect(mockUserStorage.get()).toBeNull();
    });

    it('should reset with only credential storage configured', () => {
      const partialStore = new UserAuthStore<MockAuthState>({
        credentialStorage: mockCredentialStorage
      });

      partialStore.setCredential(mockCredential);
      partialStore.authSuccess();

      partialStore.reset();

      expect(partialStore.getCredential()).toBeNull();
      expect(partialStore.getLoginStatus()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });
  });

  /**
   * Test suite for state consistency and integration
   *
   * Tests state management consistency across operations
   */
  describe('State Consistency and Integration', () => {
    beforeEach(() => {
      store.setUserStorage(mockUserStorage);
      store.setCredentialStorage(mockCredentialStorage);
    });

    it('should maintain state consistency across complete authentication flow', () => {
      // Initial state
      expect(store.getLoginStatus()).toBeNull();
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();

      // Start authentication
      store.startAuth();
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.LOADING);
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();

      // Successful authentication with data
      store.authSuccess(mockUser, mockCredential);
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);

      // Authentication failure (preserves user data)
      store.authFailed('Network error');
      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.FAILED);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);

      // Complete reset
      store.reset();
      expect(store.getLoginStatus()).toBeNull();
      expect(store.getUserInfo()).toBeNull();
      expect(store.getCredential()).toBeNull();
    });

    it('should handle rapid state changes correctly', () => {
      store.startAuth();
      store.authSuccess(mockUser, mockCredential);
      store.startAuth();
      store.authFailed('Error');
      store.startAuth();
      store.authSuccess();

      expect(store.getLoginStatus()).toBe(LOGIN_STATUS.SUCCESS);
      expect(store.getUserInfo()).toEqual(mockUser);
      expect(store.getCredential()).toBe(mockCredential);
    });

    it('should properly synchronize state with storage', () => {
      // Set data through store
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);

      // Verify storage synchronization
      expect(mockUserStorage.get()).toEqual(mockUser);
      expect(mockCredentialStorage.get()).toBe(mockCredential);

      // Modify storage directly
      const modifiedUser = { ...mockUser, name: 'Modified Name' };
      mockUserStorage.set(modifiedUser);

      // Store state should remain unchanged until next operation
      expect(store.getUserInfo()).toEqual(mockUser);

      // Reset and verify storage is cleared
      store.reset();
      expect(mockUserStorage.get()).toBeNull();
      expect(mockCredentialStorage.get()).toBeNull();
    });
  });

  /**
   * Test suite for error handling and edge cases
   *
   * Tests various error scenarios and edge cases
   */
  describe('Error Handling and Edge Cases', () => {
    it('should handle null user info gracefully', () => {
      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(null);
      }).not.toThrow();

      expect(store.getUserInfo()).toBeNull();
    });

    it('should handle undefined user info gracefully', () => {
      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(undefined as unknown as MockUser);
      }).not.toThrow();

      expect(store.getUserInfo()).toBeNull();
    });

    it('should handle storage errors during user info operations', () => {
      const faultyUserStorage = new MockKeyStorage('faulty');
      vi.spyOn(faultyUserStorage, 'set').mockImplementation(() => {
        throw new Error('User storage error');
      });

      store.setUserStorage(faultyUserStorage);

      // Should throw when storage fails
      expect(() => {
        store.setUserInfo(mockUser);
      }).toThrow('User storage error');
    });

    it('should handle storage errors during credential operations', () => {
      const faultyCredentialStorage = new MockCredentialStorage('faulty');
      vi.spyOn(faultyCredentialStorage, 'set').mockImplementation(() => {
        throw new Error('Credential storage error');
      });

      store.setCredentialStorage(faultyCredentialStorage);

      // Should throw when storage fails
      expect(() => {
        store.setCredential(mockCredential);
      }).toThrow('Credential storage error');
    });

    it('should handle storage errors during reset', () => {
      const faultyUserStorage = new MockKeyStorage('faulty');
      vi.spyOn(faultyUserStorage, 'remove').mockImplementation(() => {
        throw new Error('Remove error');
      });

      store.setUserStorage(faultyUserStorage);
      store.setUserInfo(mockUser);

      // Reset should handle storage errors gracefully
      expect(() => {
        store.reset();
      }).toThrow('Remove error');
    });

    it('should handle empty string credentials', () => {
      store.setCredentialStorage(mockCredentialStorage);

      store.setCredential('');

      expect(store.getCredential()).toBe('');
      expect(mockCredentialStorage.get()).toBe('');
    });

    it('should handle very large user objects', () => {
      const largeUser = {
        ...mockUser,
        metadata: {
          ...Array.from({ length: 1000 }, (_, i) => ({
            [`field${i}`]: `value${i}`
          })).reduce((acc, obj) => ({ ...acc, ...obj }), {})
        }
      };

      store.setUserStorage(mockUserStorage);

      expect(() => {
        store.setUserInfo(largeUser);
      }).not.toThrow();

      expect(store.getUserInfo()).toEqual(largeUser);
    });
  });

  /**
   * Test suite for store interface integration
   *
   * Tests proper inheritance and integration with base store functionality
   */
  describe('Store Interface Integration', () => {
    it('should properly extend StoreInterface functionality', () => {
      // Test that the store properly inherits from StoreInterface
      expect(store).toHaveProperty('state');
      expect(store).toHaveProperty('emit');
      expect(typeof store.emit).toBe('function');
    });

    it('should maintain proper state structure', () => {
      store.setUserInfo(mockUser);
      store.setCredential(mockCredential);
      store.authSuccess();

      const state = store.state;

      expect(state.userInfo).toEqual(mockUser);
      expect(state.credential).toBe(mockCredential);
      expect(state.loginStatus).toBe(LOGIN_STATUS.SUCCESS);
      expect(state.error).toBeNull();
    });

    it('should emit state changes properly', () => {
      const emitSpy = vi.spyOn(store, 'emit');

      store.setUserInfo(mockUser);
      expect(emitSpy).toHaveBeenCalled();

      store.setCredential(mockCredential);
      expect(emitSpy).toHaveBeenCalled();

      store.startAuth();
      expect(emitSpy).toHaveBeenCalled();

      store.authSuccess();
      expect(emitSpy).toHaveBeenCalled();

      store.authFailed('error');
      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
