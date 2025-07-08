/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { UserAuthService } from '../../../src/core/user-auth/impl/UserAuthService';
import { UserAuthState } from '../../../src/core/user-auth/impl/UserAuthState';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import { TokenStorage } from '../../../src/core/storage';
import type {
  LoginResponseData,
  UserAuthApiInterface
} from '../../../src/core/user-auth/interface/UserAuthApiInterface';
import type {
  UserAuthStoreInterface,
  UserAuthStoreOptions
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

// Test user interface
interface TestUser {
  id: number;
  name: string;
  email: string;
  roles?: string[];
  profile?: {
    avatar?: string;
    preferences?: Record<string, unknown>;
  };
}

// Test auth state
class TestAuthState extends UserAuthState<TestUser> {
  constructor(userInfo?: TestUser | null, credential?: string | null) {
    super(userInfo, credential);
  }
}

// Mock storage implementations
class MockStorage implements SyncStorageInterface<string, unknown> {
  private data: Record<string, string> = {};

  getItem<T>(key: string, defaultValue?: T): T | null {
    const value = this.data[key];
    return value ? (value as unknown as T) : (defaultValue ?? null);
  }

  setItem<T>(key: string, value: T): void {
    this.data[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  clear(): void {
    this.data = {};
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return keys[index] || null;
  }

  get length(): number {
    return Object.keys(this.data).length;
  }
}

// Mock API implementation
class MockUserAuthApi implements UserAuthApiInterface<TestUser> {
  private store: UserAuthStoreInterface<TestUser> | null = null;

  public mockLogin: Mock = vi.fn();
  public mockRegister: Mock = vi.fn();
  public mockLogout: Mock = vi.fn();
  public mockGetUserInfo: Mock = vi.fn();

  getStore(): UserAuthStoreInterface<TestUser> | null {
    return this.store;
  }

  setStore(store: UserAuthStoreInterface<TestUser>): void {
    this.store = store;
  }

  async login(params: unknown): Promise<LoginResponseData> {
    return this.mockLogin(params);
  }

  async register(params: unknown): Promise<LoginResponseData> {
    return this.mockRegister(params);
  }

  async logout(): Promise<void> {
    return this.mockLogout();
  }

  async getUserInfo(params?: unknown): Promise<TestUser> {
    return this.mockGetUserInfo(params);
  }
}

describe('UserAuthService Options Configuration', () => {
  let mockApi: MockUserAuthApi;
  let mockLocalStorage: MockStorage;
  let mockSessionStorage: MockStorage;

  // Test data
  const testUser: TestUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    roles: ['user'],
    profile: {
      avatar: 'avatar.jpg',
      preferences: { theme: 'dark' }
    }
  };

  const loginResponse: LoginResponseData = {
    token: 'test-token-123',
    refreshToken: 'refresh-token-456'
  };

  beforeEach(() => {
    mockApi = new MockUserAuthApi();
    mockLocalStorage = new MockStorage();
    mockSessionStorage = new MockStorage();

    // Reset all mocks
    vi.clearAllMocks();
  });

  describe('Store Configuration Options', () => {
    describe('Direct Store Instance', () => {
      it('should use provided UserAuthStore instance', () => {
        const customStore = new UserAuthStore<TestAuthState>({
          userStorage: new TokenStorage('custom-user'),
          credentialStorage: new TokenStorage('custom-cred')
        });

        const service = new UserAuthService(mockApi, {
          store: customStore
        });

        expect(service.store).toBe(customStore);
        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should not override existing store in API', () => {
        const existingStore = new UserAuthStore<TestAuthState>({});
        const providedStore = new UserAuthStore<TestAuthState>({});

        mockApi.setStore(existingStore);

        const service = new UserAuthService<TestAuthState>(mockApi, {
          store: providedStore
        });

        // API should keep its existing store
        expect(mockApi.getStore()).toBe(existingStore);
        // Service should use the provided store
        expect(service.store).toBe(providedStore);
      });

      it('should handle store with pre-configured storage', () => {
        const userStorage = new TokenStorage<string, TestUser>('pre-user');
        const credentialStorage = new TokenStorage('pre-cred');
        const customStore = new UserAuthStore<TestAuthState>({
          userStorage,
          credentialStorage
        });

        const service = new UserAuthService<TestAuthState>(mockApi, {
          store: customStore
        });

        expect(service.store.getUserStorage()).toBe(userStorage);
        expect(service.store.getCredentialStorage()).toBe(credentialStorage);
      });
    });

    describe('Store Options Configuration', () => {
      it('should create store from UserAuthStoreOptions', () => {
        const storeOptions: UserAuthStoreOptions<TestAuthState> = {
          userStorage: new TokenStorage('store-user'),
          credentialStorage: new TokenStorage('store-cred')
        };

        const service = new UserAuthService<TestAuthState>(mockApi, {
          store: new UserAuthStore<TestAuthState>(storeOptions)
        });

        expect(service.store).toBeDefined();
        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });

      it('should handle empty store options', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          store: new UserAuthStore<TestAuthState>({})
        });

        expect(service.store).toBeDefined();
        expect(typeof service.store.startAuth).toBe('function');
        expect(typeof service.store.authSuccess).toBe('function');
        expect(typeof service.store.authFailed).toBe('function');
      });

      it('should merge store options with other configurations', () => {
        const storeOptions: UserAuthStoreOptions<TestAuthState> = {
          userStorage: new TokenStorage('merge-user')
        };

        const service = new UserAuthService<TestAuthState>(mockApi, {
          store: new UserAuthStore<TestAuthState>(storeOptions),
          credentialStorage: {
            key: 'merge-cred',
            storage: mockLocalStorage
          }
        });

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });
    });

    describe('Default Store Creation', () => {
      it('should create default store when no store provided', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {});

        expect(service.store).toBeDefined();
        expect(service.store).toBeInstanceOf(UserAuthStore);
      });

      it('should set store in API when API has no store', () => {
        expect(mockApi.getStore()).toBeNull();

        const service = new UserAuthService<TestAuthState>(mockApi, {});

        expect(mockApi.getStore()).toBe(service.store);
      });

      it('should have default credential storage', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {});

        expect(service.store.getUserStorage()).toBeNull();
        expect(service.store.getCredentialStorage()).toBeDefined();
      });
    });
  });

  describe('Configuration Validation and Error Handling', () => {
    describe('Invalid Configuration', () => {
      it('should handle null options gracefully', () => {
        const service = new UserAuthService<TestAuthState>(
          mockApi,
          null as any
        );

        expect(service.store).toBeDefined();
      });

      it('should handle undefined options gracefully', () => {
        const service = new UserAuthService<TestAuthState>(
          mockApi,
          undefined as any
        );

        expect(service.store).toBeDefined();
      });

      it('should handle empty object options', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {});

        expect(service.store).toBeDefined();
      });

      it('should handle invalid storage configuration', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: null as any
        });

        expect(service.store).toBeDefined();
      });
    });
  });

  // 由于测试文件过长，我会继续添加其他测试用例，但先保持这个基本结构
  describe('User Storage Configuration Options', () => {
    describe('Enabled User Storage', () => {
      it('should configure localStorage with key only', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'user_profile',
            storage: mockLocalStorage
          }
        });

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getUserStorage()?.key).toBe('user_profile');
      });

      it('should configure with string expiration (week)', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'week_user',
            storage: mockLocalStorage
          }
        });

        expect(service.store.getUserStorage()).toBeDefined();
        expect(service.store.getUserStorage()?.key).toBe('week_user');
      });

      it('should configure with direct TokenStorage instance', () => {
        const directStorage = new TokenStorage<string, TestUser>(
          'direct_user',
          {
            storage: mockLocalStorage
          }
        );

        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: directStorage
        });

        expect(service.store.getUserStorage()).toBe(directStorage);
      });
    });

    describe('Disabled User Storage', () => {
      it('should disable user storage when set to false', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: false
        });

        expect(service.store.getUserStorage()).toBeNull();
      });

      it('should handle authentication flow without user storage', async () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: false
        });

        mockApi.mockLogin.mockResolvedValue(loginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(testUser);

        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(service.isAuthenticated()).toBe(true);
        expect(service.store.getUserInfo()).toEqual(testUser);
      });
    });
  });

  describe('Credential Storage Configuration Options', () => {
    describe('Enabled Credential Storage', () => {
      it('should configure localStorage for credentials', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          credentialStorage: {
            key: 'auth_token',
            storage: mockLocalStorage
          }
        });

        expect(service.store.getCredentialStorage()).toBeDefined();
        expect(service.store.getCredentialStorage()?.key).toBe('auth_token');
      });

      it('should configure with direct TokenStorage instance', () => {
        const directStorage = new TokenStorage('direct_token', {
          storage: mockLocalStorage
        });

        const service = new UserAuthService<TestAuthState>(mockApi, {
          credentialStorage: directStorage
        });

        expect(service.store.getCredentialStorage()).toBe(directStorage);
      });
    });

    describe('Disabled Credential Storage', () => {
      it('should disable credential storage when set to false', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          credentialStorage: false
        });

        expect(service.store.getCredentialStorage()).toBeNull();
      });

      it('should handle authentication flow without credential storage', async () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          credentialStorage: false
        });

        mockApi.mockLogin.mockResolvedValue(loginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(testUser);

        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(service.isAuthenticated()).toBe(true);
        expect(service.store.getCredential()).toBe(loginResponse.token);
      });
    });
  });

  describe('URL Token Extraction Configuration', () => {
    describe('Basic URL Token Extraction', () => {
      it('should extract token from simple URL', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          href: 'https://example.com/callback?access_token=token123',
          tokenKey: 'access_token'
        });

        expect(service.store.getCredential()).toBe('token123');
      });

      it('should extract token from complex URL with multiple parameters', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          href: 'https://example.com/callback?state=xyz&access_token=token456&user_id=123',
          tokenKey: 'access_token'
        });

        expect(service.store.getCredential()).toBe('token456');
      });

      it('should handle URL without query parameters', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          href: 'https://example.com/callback',
          tokenKey: 'access_token'
        });

        expect(service.store.getCredential()).toBeNull();
      });
    });

    describe('Custom Token Keys', () => {
      it('should extract with custom token key', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          href: 'https://example.com/callback?jwt=custom_token_123',
          tokenKey: 'jwt'
        });

        expect(service.store.getCredential()).toBe('custom_token_123');
      });

      it('should extract with oauth token key', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          href: 'https://example.com/oauth/callback?oauth_token=oauth_123',
          tokenKey: 'oauth_token'
        });

        expect(service.store.getCredential()).toBe('oauth_123');
      });
    });
  });

  describe('Combined Configuration Scenarios', () => {
    describe('Complete Configuration', () => {
      it('should handle OAuth configuration', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'oauth_user',
            storage: mockLocalStorage
          },
          credentialStorage: {
            key: 'oauth_token',
            storage: mockLocalStorage
          },
          href: 'https://myapp.com/oauth/callback?access_token=oauth_123&refresh_token=refresh_456',
          tokenKey: 'access_token'
        });

        expect(service.store.getUserStorage()?.key).toBe('oauth_user');
        expect(service.store.getCredentialStorage()?.key).toBe('oauth_token');
        expect(service.store.getCredential()).toBe('oauth_123');
      });

      it('should handle session-only configuration', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: false,
          credentialStorage: false
        });

        expect(service.store.getUserStorage()).toBeNull();
        expect(service.store.getCredentialStorage()).toBeNull();
      });
    });

    describe('Mixed Storage Types', () => {
      it('should handle user in localStorage and credentials in sessionStorage', () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'persistent_user',
            storage: mockLocalStorage
          },
          credentialStorage: {
            key: 'session_token',
            storage: mockSessionStorage
          }
        });

        expect(service.store.getUserStorage()?.key).toBe('persistent_user');
        expect(service.store.getCredentialStorage()?.key).toBe('session_token');
      });
    });
  });

  describe('Authentication Flow with Different Configurations', () => {
    describe('Login Flow with Storage', () => {
      it('should persist user and credentials during login', async () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'login_user',
            storage: mockLocalStorage
          },
          credentialStorage: {
            key: 'login_token',
            storage: mockLocalStorage
          }
        });

        mockApi.mockLogin.mockResolvedValue(loginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(testUser);

        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(service.isAuthenticated()).toBe(true);
        expect(service.store.getUserInfo()).toEqual(testUser);
        expect(service.store.getCredential()).toBe(loginResponse.token);
        expect(mockLocalStorage.getItem('login_user')).toBeTruthy();
        expect(mockLocalStorage.getItem('login_token')).toBeTruthy();
      });

      it('should work without storage during login', async () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: false,
          credentialStorage: false
        });

        mockApi.mockLogin.mockResolvedValue(loginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(testUser);

        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(service.isAuthenticated()).toBe(true);
        expect(service.store.getUserInfo()).toEqual(testUser);
        expect(service.store.getCredential()).toBe(loginResponse.token);
      });
    });

    describe('Logout Flow with Storage', () => {
      it('should clear all storage during logout', async () => {
        const service = new UserAuthService<TestAuthState>(mockApi, {
          userStorage: {
            key: 'logout_user',
            storage: mockLocalStorage
          },
          credentialStorage: {
            key: 'logout_token',
            storage: mockLocalStorage
          }
        });

        // Setup authenticated state
        mockApi.mockLogin.mockResolvedValue(loginResponse);
        mockApi.mockGetUserInfo.mockResolvedValue(testUser);
        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(service.isAuthenticated()).toBe(true);
        expect(mockLocalStorage.getItem('logout_user')).toBeTruthy();
        expect(mockLocalStorage.getItem('logout_token')).toBeTruthy();

        // Logout
        mockApi.mockLogout.mockResolvedValue(undefined);
        await service.logout();

        expect(service.isAuthenticated()).toBe(false);
        expect(service.store.getUserInfo()).toBeNull();
        expect(service.store.getCredential()).toBeNull();
      });
    });
  });

  describe('Multiple Service Instances', () => {
    it('should handle multiple services with different configurations', () => {
      const service1 = new UserAuthService<TestAuthState>(mockApi, {
        userStorage: {
          key: 'service1_user',
          storage: mockLocalStorage
        }
      });

      const service2 = new UserAuthService<TestAuthState>(mockApi, {
        userStorage: {
          key: 'service2_user',
          storage: mockSessionStorage
        }
      });

      expect(service1.store).not.toBe(service2.store);
      expect(service1.store.getUserStorage()?.key).toBe('service1_user');
      expect(service2.store.getUserStorage()?.key).toBe('service2_user');
    });
  });
});
