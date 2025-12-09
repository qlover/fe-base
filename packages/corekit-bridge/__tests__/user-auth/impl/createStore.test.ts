import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from '../../../src/core/user-auth/impl/createStore';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import {
  UserAuthStoreInterface,
  LOGIN_STATUS,
  UserAuthStoreOptions
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import {
  KeyStorage,
  KeyStorageInterface,
  KeyStorageOptions
} from '@qlover/fe-corekit';
import { UserAuthOptions } from '../../../src/core/user-auth/impl/UserAuthService';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import { TokenStorage } from '../../../src/core/storage';

/**
 * Test user type for testing purposes
 */
interface TestUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Test state type extending UserAuthState
 */
type TestState = UserAuthState<TestUser>;

/**
 * Mock store implementation for testing
 */
class MockUserAuthStore implements UserAuthStoreInterface<TestUser> {
  private userStorage: KeyStorageInterface<string, TestUser> | null = null;
  private credentialStorage: KeyStorageInterface<string, string> | null = null;
  private userInfo: TestUser | null = null;
  private credential: string | null = null;
  private loginStatus: LOGIN_STATUS | null = null;
  private error: unknown = null;

  setUserStorage(userStorage: KeyStorageInterface<string, TestUser>): void {
    this.userStorage = userStorage;
  }

  getUserStorage(): KeyStorageInterface<string, TestUser> | null {
    return this.userStorage;
  }

  setCredentialStorage(
    credentialStorage: KeyStorageInterface<string, string>
  ): void {
    this.credentialStorage = credentialStorage;
  }

  getCredentialStorage(): KeyStorageInterface<string, string> | null {
    return this.credentialStorage;
  }

  setUserInfo(params: TestUser | null): void {
    this.userInfo = params;
  }

  getUserInfo(): TestUser | null {
    return this.userInfo;
  }

  setCredential(credential: string): void {
    this.credential = credential;
  }

  getCredential(): string | null {
    return this.credential;
  }

  getLoginStatus(): LOGIN_STATUS | null {
    return this.loginStatus;
  }

  reset(): void {
    this.userInfo = null;
    this.credential = null;
    this.loginStatus = null;
    this.error = null;
  }

  startAuth(): void {
    this.loginStatus = LOGIN_STATUS.LOADING;
    this.error = null;
  }

  authSuccess(userInfo?: TestUser, credential?: string): void {
    this.loginStatus = LOGIN_STATUS.SUCCESS;
    this.error = null;
    if (userInfo) {
      this.userInfo = userInfo;
    }
    if (credential) {
      this.credential = credential;
    }
  }

  authFailed(error?: unknown): void {
    this.loginStatus = LOGIN_STATUS.FAILED;
    this.error = error;
  }
}

/**
 * Mock storage implementation for testing
 */
class MockStorage<Key, Value> extends KeyStorage<Key, Value> {
  private data: Map<Key, Value> = new Map();

  constructor(key: Key, options: KeyStorageOptions<Key> = {}) {
    super(key, options);
  }

  get(): Value | null {
    return this.data.get(this.key) || null;
  }

  set(value: Value): void {
    this.data.set(this.key, value);
  }

  remove(): void {
    this.data.delete(this.key);
  }

  clear(): void {
    this.data.clear();
  }

  has(key: Key): boolean {
    return this.data.has(key);
  }

  keys(): Key[] {
    return Array.from(this.data.keys());
  }

  values(): Value[] {
    return Array.from(this.data.values());
  }

  entries(): [Key, Value][] {
    return Array.from(this.data.entries());
  }

  size(): number {
    return this.data.size;
  }
}

describe('createStore', () => {
  let userStorage: TokenStorage<string, TestUser>;
  let credentialStorage: TokenStorage<string, string>;

  beforeEach(() => {
    userStorage = new TokenStorage<string, TestUser>('test_user');
    credentialStorage = new TokenStorage<string, string>('test_credential');
  });

  describe('options.store', () => {
    it('should create a new UserAuthStore when no store is provided', () => {
      const options: UserAuthOptions<TestState> = {};

      const store = createStore<TestState>(options);

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);
      // @ts-ignore
      expect(store.options).toBeDefined();
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should create a new UserAuthStore when store is provided', () => {
      const options: UserAuthOptions<TestState> = {
        store: new MockUserAuthStore()
      };

      const store = createStore<TestState>(options);

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(MockUserAuthStore);
    });

    it('should create a new UserAuthStore when store is extends UserAuthStore', () => {
      class MockUserAuthStore extends UserAuthStore<TestState> {}

      const options: UserAuthOptions<TestState> = {
        store: new MockUserAuthStore()
      };

      const store = createStore<TestState>(options) as MockUserAuthStore;

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store).toBeInstanceOf(MockUserAuthStore);
      expect(store.state).toBeInstanceOf(UserAuthState);
    });

    it('should create a new UserAuthStore when store is object', () => {
      const options: UserAuthOptions<TestState> = {
        store: {}
      };

      const store = createStore<TestState>(options);

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);
    });

    it('should create a new UserAuthStore when store is null/undefined', () => {
      const store = createStore<TestState>({
        // @ts-ignore
        store: null
      });

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);

      const store2 = createStore<TestState>({
        // @ts-ignore
        store: null
      });

      expect(store2).not.toBeNull();
      expect(store2).toBeInstanceOf(UserAuthStore);
    });

    it('should create a new UserAuthStore when store is not a object', () => {
      const store = createStore<TestState>({
        // @ts-ignore
        store: 'test'
      });

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);
    });

    it('should create a new UserAuthStore when store is a valid object', () => {
      const store = createStore<TestState>({
        store: {
          userStorage: userStorage,
          credentialStorage: credentialStorage
        }
      });

      expect(store).not.toBeNull();
      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBe(userStorage);
      expect(store.getCredentialStorage()).toBe(credentialStorage);
    });

    // Additional store parameter tests
    it('should preserve existing store methods when using custom store', () => {
      const mockStore = new MockUserAuthStore();
      const options: UserAuthOptions<TestState> = {
        store: mockStore
      };

      const store = createStore<TestState>(options);

      expect(store).toBe(mockStore);
      expect(typeof store.setUserInfo).toBe('function');
      expect(typeof store.setCredential).toBe('function');
      expect(typeof store.reset).toBe('function');
    });

    it('should handle store with complete UserAuthStoreInterface implementation', () => {
      const completeStore: UserAuthStoreInterface<TestUser> = {
        setUserStorage: () => {},
        getUserStorage: () => null,
        setCredentialStorage: () => {},
        getCredentialStorage: () => null,
        getLoginStatus: () => null,
        setUserInfo: () => {},
        getUserInfo: () => null,
        setCredential: () => {},
        getCredential: () => null,
        startAuth: () => {},
        authSuccess: () => {},
        authFailed: () => {},
        reset: () => {}
      };

      const options: UserAuthOptions<TestState> = {
        store: completeStore
      };

      const store = createStore<TestState>(options);

      expect(store).toBe(completeStore);
    });

    it('should handle store with partial UserAuthStoreInterface implementation', () => {
      const partialStore = {
        setUserStorage: () => {},
        getUserStorage: () => null,
        setCredentialStorage: () => {},
        getCredentialStorage: () => null,
        startAuth: () => {},
        authSuccess: () => {},
        authFailed: () => {},
        reset: () => {}
      };

      const options: UserAuthOptions<TestState> = {
        // @ts-ignore
        store: partialStore
      };

      const store = createStore<TestState>(options);

      expect(store).toBe(partialStore);
    });

    it('should create UserAuthStore when store object has invalid methods', () => {
      const invalidStore = {
        setUserStorage: 'not a function',
        getUserStorage: null,
        someOtherProperty: 'value'
      };

      const options: UserAuthOptions<TestState> = {
        // @ts-ignore
        store: invalidStore
      };

      const store = createStore<TestState>(options);
      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store).not.toBe(invalidStore);
    });

    it('should merge store options when store is configuration object', () => {
      const storeOptions: UserAuthStoreOptions<TestState> = {
        userStorage: userStorage,
        credentialStorage: credentialStorage
      };

      const options: UserAuthOptions<TestState> = {
        store: storeOptions
      };

      const store = createStore<TestState>(options);

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBe(userStorage);
      expect(store.getCredentialStorage()).toBe(credentialStorage);
    });

    it('should handle empty store configuration object', () => {
      const options: UserAuthOptions<TestState> = {
        store: {}
      };

      const store = createStore<TestState>(options);

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should handle primitive values as store parameter', () => {
      const primitiveValues = [123, true, false, 'string', Symbol('test')];

      primitiveValues.forEach((value) => {
        const options: UserAuthOptions<TestState> = {
          // @ts-ignore
          store: value
        };

        const store = createStore<TestState>(options);

        expect(store).toBeInstanceOf(UserAuthStore);
        expect(store).not.toBe(value);
      });
    });
  });

  describe('options.userStorage', () => {
    it('should set userStorage when provided as storage instance', () => {
      const mockUserStorage = new MockStorage<string, TestUser>('user_test');
      const options: UserAuthOptions<TestState> = {
        userStorage: mockUserStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBe(mockUserStorage);
    });

    it('should create TokenStorage when userStorage is configuration object', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: {
          key: 'custom_user_key'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getUserStorage()?.getKey()).toBe('custom_user_key');
    });

    it('should disable userStorage when set to false', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: false
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeNull();
    });

    it('should handle userStorage with storage backend configuration', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: {
          key: 'user_with_backend'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getUserStorage()?.getKey()).toBe('user_with_backend');
    });

    it('should throw error when userStorage configuration lacks key', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: {
          // @ts-ignore
          expiresIn: 'day'
        }
      };

      expect(() => createStore<TestState>(options)).toThrow(
        'Invalid storage configuration: key is required'
      );
    });

    it('should handle null/undefined userStorage', () => {
      const options1: UserAuthOptions<TestState> = {
        // @ts-ignore
        userStorage: null
      };

      const options2: UserAuthOptions<TestState> = {
        userStorage: undefined
      };

      const store1 = createStore<TestState>(options1);
      const store2 = createStore<TestState>(options2);

      expect(store1.getUserStorage()).toBeNull();
      expect(store2.getUserStorage()).toBeNull();
    });
  });

  describe('options.credentialStorage', () => {
    it('should set credentialStorage when provided as storage instance', () => {
      const mockCredentialStorage = new MockStorage<string, string>(
        'credential_test'
      );
      const options: UserAuthOptions<TestState> = {
        credentialStorage: mockCredentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBe(mockCredentialStorage);
    });

    it('should create TokenStorage when credentialStorage is configuration object', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: {
          key: 'custom_credential_key'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getCredentialStorage()?.getKey()).toBe(
        'custom_credential_key'
      );
    });

    it('should disable credentialStorage when set to false', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: false
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should use default credential storage when not provided', () => {
      const options: UserAuthOptions<TestState> = {};

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getCredentialStorage()?.getKey()).toBe('auth_token');
    });

    it('should handle credentialStorage with configuration', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: {
          key: 'credential_with_config'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getCredentialStorage()?.getKey()).toBe(
        'credential_with_config'
      );
    });

    it('should throw error when credentialStorage configuration lacks key', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: {
          // @ts-ignore
          expiresIn: 'hour'
        }
      };

      expect(() => createStore<TestState>(options)).toThrow(
        'Invalid storage configuration: key is required'
      );
    });

    it('should handle null credentialStorage', () => {
      const options: UserAuthOptions<TestState> = {
        // @ts-ignore
        credentialStorage: null
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).not.toBeNull();
    });
  });

  describe('options.href and options.tokenKey', () => {
    it('should extract token from URL when href and tokenKey are provided', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?access_token=test_token_123&state=xyz',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('test_token_123');
    });

    it('should extract token with default tokenKey when not provided', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?auth_token=default_token_456'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('default_token_456');
    });

    it('should extract token using credentialStorage key when tokenKey not provided', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?custom_key=storage_token_789',
        credentialStorage: {
          key: 'custom_key'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('storage_token_789');
    });

    it('should handle URL without query parameters', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle URL with fragment identifier', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?access_token=fragment_token#section',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('fragment_token');
    });

    it('should handle URL with encoded token values', () => {
      const encodedToken = encodeURIComponent(
        'token with spaces and special chars!@#'
      );
      const options: UserAuthOptions<TestState> = {
        href: `https://example.com/callback?token=${encodedToken}`,
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(
        'token with spaces and special chars!@#'
      );
    });

    it('should handle malformed URL gracefully', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'not-a-valid-url',
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle empty href', () => {
      const options: UserAuthOptions<TestState> = {
        href: '',
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle null/undefined href', () => {
      const options1: UserAuthOptions<TestState> = {
        // @ts-ignore
        href: null,
        tokenKey: 'token'
      };

      const options2: UserAuthOptions<TestState> = {
        href: undefined,
        tokenKey: 'token'
      };

      const store1 = createStore<TestState>(options1);
      const store2 = createStore<TestState>(options2);

      expect(store1.getCredential()).toBe(null);
      expect(store2.getCredential()).toBe(null);
    });

    it('should handle empty tokenKey', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?token=test_value',
        tokenKey: ''
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle multiple query parameters', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?state=xyz&access_token=multi_param_token&expires_in=3600',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('multi_param_token');
    });

    it('should handle token parameter with empty value', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?access_token=&state=xyz',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle token parameter that does not exist', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?state=xyz&other_param=value',
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty options object', () => {
      const store = createStore<TestState>({});

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should handle null options', () => {
      // @ts-ignore
      const store = createStore<TestState>(null);

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should handle undefined options', () => {
      // @ts-ignore
      const store = createStore<TestState>(undefined);

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should handle combination of all parameters', () => {
      const mockUserStorage = new MockStorage<string, TestUser>(
        'combined_user'
      );
      const mockCredentialStorage = new MockStorage<string, string>(
        'combined_credential'
      );

      const options: UserAuthOptions<TestState> = {
        store: {
          userStorage: mockUserStorage,
          credentialStorage: mockCredentialStorage
        },
        userStorage: userStorage, // This should be overridden by store config
        credentialStorage: credentialStorage, // This should be overridden by store config
        href: 'https://example.com/callback?jwt_token=combined_token_123',
        tokenKey: 'jwt_token'
      };

      const store = createStore<TestState>(options);

      expect(store).toBeInstanceOf(UserAuthStore);
      expect(store.getUserStorage()).toBe(mockUserStorage);
      expect(store.getCredentialStorage()).toBe(mockCredentialStorage);
      expect(store.getCredential()).toBe('combined_token_123');
    });

    it('should prioritize existing store credential storage over options', () => {
      const mockStore = new MockUserAuthStore();
      const existingCredentialStorage = new MockStorage<string, string>(
        'existing_credential'
      );
      mockStore.setCredentialStorage(existingCredentialStorage);

      const options: UserAuthOptions<TestState> = {
        store: mockStore,
        credentialStorage: {
          key: 'new_credential_key'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBe(existingCredentialStorage);
    });

    it('should set credential storage on existing store when not present', () => {
      const mockStore = new MockUserAuthStore();

      const options: UserAuthOptions<TestState> = {
        store: mockStore,
        credentialStorage: {
          key: 'set_on_existing'
        }
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getCredentialStorage()?.getKey()).toBe('set_on_existing');
    });

    it('should handle malformed URL encoding gracefully', () => {
      const options: UserAuthOptions<TestState> = {
        href: 'https://example.com/callback?token=%ZZ%invalid%encoding',
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(null);
    });

    it('should handle very long URLs', () => {
      const longToken = 'a'.repeat(10000);
      const options: UserAuthOptions<TestState> = {
        href: `https://example.com/callback?token=${longToken}`,
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(longToken);
    });

    it('should handle URL with no domain', () => {
      const options: UserAuthOptions<TestState> = {
        href: '/callback?token=relative_url_token',
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe('relative_url_token');
    });

    it('should handle complex storage configuration combinations', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: {
          key: 'complex_user'
        },
        credentialStorage: false,
        href: 'https://example.com/callback?token=complex_token',
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getUserStorage()?.getKey()).toBe('complex_user');
      expect(store.getCredentialStorage()).toBeNull();
      expect(store.getCredential()).toBe('complex_token');
    });
  });
});
