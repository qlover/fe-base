import { describe, it, expect, beforeEach } from 'vitest';
import {
  createStore,
  TokenStorageValueType
} from '../../../src/core/user-auth/impl/createStore';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import {
  UserAuthStoreInterface,
  LOGIN_STATUS
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import { KeyStorageInterface } from '@qlover/fe-corekit';
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

describe('createStore', () => {
  let userStorage: TokenStorage<string, TestUser>;
  let credentialStorage: TokenStorage<string, string>;

  beforeEach(() => {
    userStorage = new TokenStorage<string, TestUser>('test_user');
    credentialStorage = new TokenStorage<string, string>('test_credential');
  });

  describe('store creation', () => {
    it('should create a new UserAuthStore when no store is provided', () => {
      const options: UserAuthOptions<TestState> = {};

      const store = createStore<TestState>(options);

      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(UserAuthStore);
    });

    it('should use existing store instance when provided', () => {
      const mockStore = new MockUserAuthStore();
      const options: UserAuthOptions<TestState> = {
        store: mockStore
      };

      const store = createStore<TestState>(options);

      expect(store).toBe(mockStore);
    });

    it('should create store with storage configuration object', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: userStorage,
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(UserAuthStore);
    });
  });

  describe('storage configuration', () => {
    it('should configure user storage from TokenStorageValueType', () => {
      const userStorageConfig: TokenStorageValueType<string, TestUser> = {
        key: 'user_data'
      };

      const options: UserAuthOptions<TestState> = {
        userStorage: userStorageConfig
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeDefined();
    });

    it('should configure credential storage from TokenStorageValueType', () => {
      const credentialStorageConfig: TokenStorageValueType<string, string> = {
        key: 'auth_token'
      };

      const options: UserAuthOptions<TestState> = {
        credentialStorage: credentialStorageConfig
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeDefined();
    });

    it('should handle direct storage instance for user storage', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: userStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBe(userStorage);
    });

    it('should handle direct storage instance for credential storage', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBe(credentialStorage);
    });

    it('should handle disabled user storage (false)', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: false
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBeNull();
    });

    it('should handle disabled credential storage (false)', () => {
      const options: UserAuthOptions<TestState> = {
        credentialStorage: false
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should not override existing credential storage on store', () => {
      const existingStorage = new TokenStorage<string, string>('existing');
      const mockStore = new MockUserAuthStore();
      mockStore.setCredentialStorage(existingStorage);

      const options: UserAuthOptions<TestState> = {
        store: mockStore,
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBe(existingStorage);
    });

    it('should set credential storage when store has none', () => {
      const mockStore = new MockUserAuthStore();

      const options: UserAuthOptions<TestState> = {
        store: mockStore,
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getCredentialStorage()).toBe(credentialStorage);
    });
  });

  describe('URL token extraction', () => {
    it('should extract token from URL using tokenKey parameter', () => {
      const testToken = 'test_access_token_123';
      const href = `https://example.com/callback?access_token=${testToken}&state=xyz`;

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token',
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(testToken);
    });

    it('should extract token using credential storage key when tokenKey not provided', () => {
      const testToken = 'test_token_456';
      const href = `https://example.com/callback?auth_token=${testToken}`;

      const tokenStorageWithKey = new TokenStorage<string, string>(
        'auth_token'
      );

      const options: UserAuthOptions<TestState> = {
        href,
        credentialStorage: tokenStorageWithKey
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(testToken);
    });

    it('should use default credential key when no tokenKey or storage key available', () => {
      const testToken = 'test_default_token';
      const href = `https://example.com/callback?auth_token=${testToken}`;

      const options: UserAuthOptions<TestState> = {
        href
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(testToken);
    });

    it('should handle URL without query parameters', () => {
      const href = 'https://example.com/callback';

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBeNull();
    });

    it('should handle URL with empty token parameter', () => {
      const href = 'https://example.com/callback?access_token=&state=xyz';

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBeNull();
    });

    it('should handle URL with missing token parameter', () => {
      const href = 'https://example.com/callback?state=xyz&other=value';

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBeNull();
    });

    it('should decode URL-encoded token values', () => {
      const originalToken = 'token with spaces & special chars';
      const encodedToken = encodeURIComponent(originalToken);
      const href = `https://example.com/callback?access_token=${encodedToken}`;

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(originalToken);
    });

    it('should handle malformed URL gracefully', () => {
      const href = 'not-a-valid-url';

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBeNull();
    });

    it('should not extract token when href is not provided', () => {
      const options: UserAuthOptions<TestState> = {
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBeNull();
    });
  });

  describe('complex scenarios', () => {
    it('should handle complete configuration with all options', () => {
      const testUser: TestUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com'
      };
      const testToken = 'complete_test_token';
      const href = `https://example.com/callback?access_token=${testToken}`;

      // Pre-populate storages
      userStorage.set(testUser);
      credentialStorage.set('old_token');

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token',
        userStorage: {
          key: 'user_profile'
        },
        credentialStorage: {
          key: 'auth_token'
        }
      };

      const store = createStore<TestState>(options);

      expect(store).toBeDefined();
      expect(store.getUserStorage()).toBeDefined();
      expect(store.getCredentialStorage()).toBeDefined();
      expect(store.getCredential()).toBe(testToken); // Should be updated from URL
    });

    it('should work with existing store and additional configurations', () => {
      const mockStore = new MockUserAuthStore();
      const testToken = 'existing_store_token';
      const href = `https://example.com/callback?token=${testToken}`;

      const options: UserAuthOptions<TestState> = {
        store: mockStore,
        href,
        tokenKey: 'token',
        credentialStorage: credentialStorage
      };

      const store = createStore<TestState>(options);

      expect(store).toBe(mockStore);
      expect(store.getCredential()).toBe(testToken);
      expect(store.getCredentialStorage()).toBe(credentialStorage);
    });

    it('should handle mixed storage configurations', () => {
      const directUserStorage = new TokenStorage<string, TestUser>(
        'direct_user'
      );
      const credentialStorageConfig: TokenStorageValueType<string, string> = {
        key: 'credential_config'
      };

      const options: UserAuthOptions<TestState> = {
        userStorage: directUserStorage,
        credentialStorage: credentialStorageConfig
      };

      const store = createStore<TestState>(options);

      expect(store.getUserStorage()).toBe(directUserStorage);
      expect(store.getCredentialStorage()).toBeDefined();
      expect(store.getCredentialStorage()).not.toBe(credentialStorage);
    });
  });

  describe('edge cases', () => {
    it('should handle empty options object', () => {
      const options: UserAuthOptions<TestState> = {};

      const store = createStore<TestState>(options);

      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(UserAuthStore);
    });

    it('should handle null/undefined storage configurations', () => {
      const options: UserAuthOptions<TestState> = {
        userStorage: undefined,
        credentialStorage: undefined
      };

      const store = createStore<TestState>(options);

      expect(store).toBeDefined();
      expect(store.getUserStorage()).toBeNull();
      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should handle URL with multiple same parameters', () => {
      const href = 'https://example.com/callback?token=first&token=second';

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'token'
      };

      const store = createStore<TestState>(options);

      // URLSearchParams.get() returns the first value
      expect(store.getCredential()).toBe('first');
    });

    it('should handle URL with fragment identifier', () => {
      const testToken = 'fragment_token';
      const href = `https://example.com/callback?access_token=${testToken}#section`;

      const options: UserAuthOptions<TestState> = {
        href,
        tokenKey: 'access_token'
      };

      const store = createStore<TestState>(options);

      expect(store.getCredential()).toBe(testToken);
    });
  });

  describe('type safety', () => {
    it('should maintain type safety with generic parameters', () => {
      interface CustomUser {
        userId: number;
        username: string;
        roles: string[];
      }

      type CustomState = UserAuthState<CustomUser>;

      const options: UserAuthOptions<CustomState> = {
        userStorage: {
          key: 'custom_user'
        }
      };

      const store = createStore<CustomState>(options);

      expect(store).toBeDefined();
      expect(store.getUserStorage()).toBeDefined();

      // Type checking - these should compile without errors
      const userInfo: CustomUser | null = store.getUserInfo();
      if (userInfo) {
        expect(typeof userInfo.userId).toBe('number');
        expect(typeof userInfo.username).toBe('string');
        expect(Array.isArray(userInfo.roles)).toBe(true);
      }
    });
  });
});
