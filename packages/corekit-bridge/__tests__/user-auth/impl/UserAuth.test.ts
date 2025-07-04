import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  UserAuthService,
  type UserAuthOptions
} from '../../../src/core/user-auth/impl/UserAuthService';
import {
  LOGIN_STATUS,
  type UserAuthStoreInterface
} from '../../../src/core/user-auth/interface/UserAuthStoreInterface';
import {
  type LoginResponseData,
  type UserAuthApiInterface
} from '../../../src/core/user-auth/interface/UserAuthApiInterface';
import { UserAuthStore } from '../../../src/core/user-auth/impl/UserAuthStore';
import { TokenStorage } from '../../../src/core/storage';

/**
 * Test user interface for authentication testing
 *
 * Significance: Standardized user data structure for consistent testing
 * Core idea: Simple user model representing authenticated user state
 * Main function: Provide type-safe user data for authentication test scenarios
 * Main purpose: Enable comprehensive testing of user authentication operations
 *
 * @example
 * const testUser: TestUser = {
 *   id: '123',
 *   username: 'testuser',
 *   email: 'test@example.com',
 *   token: 'auth-token-123'
 * };
 *
 * // Use in tests
 * mockApi.getUserInfo.mockResolvedValue(testUser);
 */
interface TestUser {
  /** Unique user identifier */
  id: string;
  /** User's display name */
  username: string;
  /** User's email address */
  email: string;
  /** Optional authentication token */
  token?: string;
}

/**
 * Test suite for UserAuthService
 *
 * Significance: Comprehensive testing of authentication service functionality
 * Core idea: Test all authentication operations and edge cases
 * Main function: Verify authentication service behavior under various conditions
 * Main purpose: Ensure reliable authentication system with proper error handling
 */
describe('UserAuthService', () => {
  let mockApi: UserAuthApiInterface<TestUser>;
  let mockStore: UserAuthStoreInterface<TestUser>;
  let authService: UserAuthService<TestUser>;

  // Test data constants
  const testUser: TestUser = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    token: 'auth-token-123'
  };

  const loginCredentials = {
    email: 'test@example.com',
    password: 'password123'
  };

  const loginResponse: LoginResponseData = {
    token: 'auth-token-123',
    refreshToken: 'refresh-token-456'
  };

  const registerData = {
    email: 'newuser@example.com',
    password: 'password123',
    username: 'newuser'
  };

  beforeEach(() => {
    // Create comprehensive mock API
    mockApi = {
      getStore: vi.fn().mockReturnValue(null),
      setStore: vi.fn(),
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      getUserInfo: vi.fn()
    };

    // Create comprehensive mock store
    mockStore = {
      setUserStorage: vi.fn(),
      getUserStorage: vi.fn().mockReturnValue(null),
      setCredentialStorage: vi.fn(),
      getCredentialStorage: vi.fn().mockReturnValue(null),
      getLoginStatus: vi.fn(),
      setUserInfo: vi.fn(),
      getUserInfo: vi.fn(),
      setCredential: vi.fn(),
      getCredential: vi.fn(),
      reset: vi.fn(),
      startAuth: vi.fn(),
      authSuccess: vi.fn(),
      authFailed: vi.fn()
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * Test suite for UserAuthService constructor
   *
   * Tests initialization logic, parameter validation, and setup processes
   */
  describe('Constructor', () => {
    it('should create instance with required api parameter', () => {
      authService = new UserAuthService({ api: mockApi });

      expect(authService.api).toBe(mockApi);
      expect(authService.store).toBeInstanceOf(UserAuthStore);
    });

    it('should throw error when api parameter is missing', () => {
      expect(() => {
        new UserAuthService({} as UserAuthOptions<TestUser>);
      }).toThrow('UserAuthService: api is required');
    });

    it('should use provided store when given', () => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });

      expect(authService.store).toBe(mockStore);
    });

    it('should create default UserAuthStore when store not provided', () => {
      authService = new UserAuthService({ api: mockApi });

      expect(authService.store).toBeInstanceOf(UserAuthStore);
    });

    it('should setup user storage with custom configuration', () => {
      authService = new UserAuthService({
        api: mockApi,
        userStorage: { key: 'custom-user-key' }
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getUserStorage()).toBeTruthy();
    });

    it('should setup credential storage with custom configuration', () => {
      authService = new UserAuthService({
        api: mockApi,
        credentialStorage: { key: 'custom-credential-key' }
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getCredentialStorage()).toBeTruthy();
    });

    it('should disable user storage when set to false', () => {
      authService = new UserAuthService({
        api: mockApi,
        userStorage: false
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getUserStorage()).toBeNull();
    });

    it('should disable credential storage when set to false', () => {
      authService = new UserAuthService({
        api: mockApi,
        credentialStorage: false
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getCredentialStorage()).toBeNull();
    });

    it('should extract token from URL when href and tokenKey provided', () => {
      const href = 'https://example.com?auth_token=url-token-123&other=value';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'auth_token'
      });

      expect(mockStore.setCredential).toHaveBeenCalledWith('url-token-123');
    });

    it('should handle URL without query parameters gracefully', () => {
      const href = 'https://example.com';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'auth_token'
      });

      expect(mockStore.setCredential).not.toHaveBeenCalled();
    });

    it('should handle malformed URLs gracefully', () => {
      const href = 'not-a-valid-url';

      expect(() => {
        authService = new UserAuthService({
          api: mockApi,
          store: mockStore,
          href,
          tokenKey: 'auth_token'
        });
      }).not.toThrow();
    });

    it('should set store to api when api has no store', () => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });

      expect(mockApi.setStore).toHaveBeenCalledWith(mockStore);
    });

    it('should not override existing api store', () => {
      const existingStore = new UserAuthStore<TestUser>();
      vi.mocked(mockApi.getStore).mockReturnValue(existingStore);

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });

      expect(mockApi.setStore).not.toHaveBeenCalled();
    });
  });

  /**
   * Test suite for login functionality
   *
   * Tests authentication flow, error handling, and state management
   */
  describe('Login', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should perform successful login flow', async () => {
      // Setup mocks
      vi.mocked(mockApi.login).mockResolvedValue(loginResponse);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);

      const result = await authService.login(loginCredentials);

      expect(mockStore.startAuth).toHaveBeenCalled();
      expect(mockApi.login).toHaveBeenCalledWith(loginCredentials);
      expect(mockApi.getUserInfo).toHaveBeenCalledWith(loginResponse);
      expect(mockStore.authSuccess).toHaveBeenCalledWith(
        testUser,
        loginResponse
      );
      expect(result).toBe(loginResponse);
    });

    it('should merge stored user info with API response', async () => {
      const storedUser = {
        id: '123',
        username: 'stored',
        email: 'stored@example.com'
      };
      const apiUser = {
        id: '123',
        username: 'updated',
        email: 'updated@example.com'
      };

      vi.mocked(mockApi.login).mockResolvedValue(loginResponse);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(apiUser);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(storedUser);

      await authService.login(loginCredentials);

      expect(mockStore.authSuccess).toHaveBeenCalledWith(
        { ...storedUser, ...apiUser },
        loginResponse
      );
    });

    it('should handle login API failure', async () => {
      const loginError = new Error('Invalid credentials');
      vi.mocked(mockApi.login).mockRejectedValue(loginError);

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        'Invalid credentials'
      );

      expect(mockStore.startAuth).toHaveBeenCalled();
      expect(mockStore.authFailed).toHaveBeenCalledWith(loginError);
      expect(mockStore.authSuccess).not.toHaveBeenCalled();
    });

    it('should handle user info fetch failure after successful login', async () => {
      const userInfoError = new Error('Failed to fetch user info');
      vi.mocked(mockApi.login).mockResolvedValue(loginResponse);
      vi.mocked(mockApi.getUserInfo).mockRejectedValue(userInfoError);

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        'Failed to fetch user info'
      );

      expect(mockStore.startAuth).toHaveBeenCalled();
      expect(mockApi.login).toHaveBeenCalledWith(loginCredentials);
      expect(mockStore.authFailed).toHaveBeenCalledWith(userInfoError);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      vi.mocked(mockApi.login).mockRejectedValue(timeoutError);

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        'Request timeout'
      );

      expect(mockStore.authFailed).toHaveBeenCalledWith(timeoutError);
    });
  });

  /**
   * Test suite for registration functionality
   *
   * Tests user registration flow and automatic login
   */
  describe('Register', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should perform successful registration flow', async () => {
      vi.mocked(mockApi.register).mockResolvedValue(loginResponse);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);

      const result = await authService.register(registerData);

      expect(mockStore.startAuth).toHaveBeenCalled();
      expect(mockApi.register).toHaveBeenCalledWith(registerData);
      expect(mockApi.getUserInfo).toHaveBeenCalledWith(loginResponse);
      expect(mockStore.authSuccess).toHaveBeenCalled();
      expect(result).toBe(loginResponse);
    });

    it('should handle registration failure', async () => {
      const registrationError = new Error('Email already exists');
      vi.mocked(mockApi.register).mockRejectedValue(registrationError);

      await expect(authService.register(registerData)).rejects.toThrow(
        'Email already exists'
      );

      expect(mockStore.startAuth).toHaveBeenCalled();
      expect(mockStore.authFailed).toHaveBeenCalledWith(registrationError);
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Password too weak');
      vi.mocked(mockApi.register).mockRejectedValue(validationError);

      await expect(authService.register(registerData)).rejects.toThrow(
        'Password too weak'
      );

      expect(mockStore.authFailed).toHaveBeenCalledWith(validationError);
    });
  });

  /**
   * Test suite for user info functionality
   *
   * Tests user information retrieval and merging
   */
  describe('UserInfo', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should fetch and merge user information', async () => {
      const storedUser = {
        id: '123',
        username: 'stored',
        email: 'stored@example.com'
      };
      const apiUser = {
        id: '123',
        username: 'updated',
        email: 'updated@example.com'
      };

      vi.mocked(mockStore.getUserInfo).mockReturnValue(storedUser);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(apiUser);

      const result = await authService.userInfo();

      expect(mockApi.getUserInfo).toHaveBeenCalledWith(undefined);
      expect(result).toEqual({ ...storedUser, ...apiUser });
    });

    it('should pass login data to API when provided', async () => {
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);

      await authService.userInfo(loginResponse);

      expect(mockApi.getUserInfo).toHaveBeenCalledWith(loginResponse);
    });

    it('should handle user info fetch failure', async () => {
      const fetchError = new Error('Unauthorized');
      vi.mocked(mockApi.getUserInfo).mockRejectedValue(fetchError);

      await expect(authService.userInfo()).rejects.toThrow('Unauthorized');
    });

    it('should handle null stored user info', async () => {
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);

      const result = await authService.userInfo();

      expect(result).toEqual(testUser);
    });
  });

  /**
   * Test suite for logout functionality
   *
   * Tests logout flow and state cleanup
   */
  describe('Logout', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should perform successful logout', async () => {
      vi.mocked(mockApi.logout).mockResolvedValue();

      await authService.logout();

      expect(mockApi.logout).toHaveBeenCalled();
      expect(mockStore.reset).toHaveBeenCalled();
    });

    it('should reset store even if API logout fails', async () => {
      const logoutError = new Error('Server error');
      vi.mocked(mockApi.logout).mockRejectedValue(logoutError);

      await expect(authService.logout()).rejects.toThrow('Server error');

      expect(mockStore.reset).toHaveBeenCalled();
    });

    it('should handle network errors during logout', async () => {
      const networkError = new Error('Network unavailable');
      vi.mocked(mockApi.logout).mockRejectedValue(networkError);

      await expect(authService.logout()).rejects.toThrow('Network unavailable');

      expect(mockStore.reset).toHaveBeenCalled();
    });
  });

  /**
   * Test suite for authentication status checking
   *
   * Tests authentication state verification logic
   */
  describe('isAuthenticated', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should return true when login status is SUCCESS and user info exists', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(LOGIN_STATUS.SUCCESS);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when login status is not SUCCESS', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(LOGIN_STATUS.LOADING);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when login status is SUCCESS but no user info', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(LOGIN_STATUS.SUCCESS);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when login status is FAILED', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(LOGIN_STATUS.FAILED);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when login status is null', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(null);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);

      expect(authService.isAuthenticated()).toBe(false);
    });

    it('should return false when both login status and user info are null', () => {
      vi.mocked(mockStore.getLoginStatus).mockReturnValue(null);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  /**
   * Test suite for URL token extraction
   *
   * Tests URL parameter parsing and token extraction functionality
   */
  describe('URL Token Extraction', () => {
    it('should extract token from URL query parameters', () => {
      const href = 'https://example.com/callback?access_token=abc123&state=xyz';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'access_token'
      });

      expect(mockStore.setCredential).toHaveBeenCalledWith('abc123');
    });

    it('should handle URL encoded tokens', () => {
      const encodedToken = encodeURIComponent('token with spaces');
      const href = `https://example.com/callback?token=${encodedToken}`;

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'token'
      });

      expect(mockStore.setCredential).toHaveBeenCalledWith('token with spaces');
    });

    it('should handle multiple query parameters', () => {
      const href =
        'https://example.com/callback?param1=value1&auth_token=token123&param2=value2';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'auth_token'
      });

      expect(mockStore.setCredential).toHaveBeenCalledWith('token123');
    });

    it('should not extract token when parameter is missing', () => {
      const href = 'https://example.com/callback?other_param=value';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'auth_token'
      });

      expect(mockStore.setCredential).not.toHaveBeenCalled();
    });

    it('should not extract empty token values', () => {
      const href = 'https://example.com/callback?auth_token=';

      authService = new UserAuthService({
        api: mockApi,
        store: mockStore,
        href,
        tokenKey: 'auth_token'
      });

      expect(mockStore.setCredential).not.toHaveBeenCalled();
    });

    it('should handle malformed URL gracefully', () => {
      const href = 'not-a-url';

      expect(() => {
        authService = new UserAuthService({
          api: mockApi,
          store: mockStore,
          href,
          tokenKey: 'auth_token'
        });
      }).not.toThrow();

      expect(mockStore.setCredential).not.toHaveBeenCalled();
    });
  });

  /**
   * Test suite for storage configuration
   *
   * Tests different storage backend configurations and behaviors
   */
  describe('Storage Configuration', () => {
    it('should use TokenStorage instance directly when provided', () => {
      const customUserStorage = new TokenStorage<string, TestUser>(
        'custom-user'
      );
      const customCredentialStorage = new TokenStorage<string, string>(
        'custom-credential'
      );

      authService = new UserAuthService({
        api: mockApi,
        userStorage: customUserStorage,
        credentialStorage: customCredentialStorage
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getUserStorage()).toBe(customUserStorage);
      expect(store.getCredentialStorage()).toBe(customCredentialStorage);
    });

    it('should create TokenStorage from configuration object', () => {
      authService = new UserAuthService({
        api: mockApi,
        userStorage: {
          key: 'user-config',
          expiresIn: 'week'
        },
        credentialStorage: {
          key: 'credential-config',
          expiresIn: 'day'
        }
      });

      const store = authService.store as UserAuthStore<TestUser>;
      expect(store.getUserStorage()).toBeInstanceOf(TokenStorage);
      expect(store.getCredentialStorage()).toBeInstanceOf(TokenStorage);
    });

    it('should handle storage configuration with all options', () => {
      authService = new UserAuthService({
        api: mockApi,
        userStorage: {
          key: 'full-config-user',
          expiresIn: 'month'
        }
      });

      const store = authService.store as UserAuthStore<TestUser>;
      const userStorage = store.getUserStorage() as TokenStorage<
        string,
        TestUser
      >;
      expect(userStorage).toBeInstanceOf(TokenStorage);
    });
  });

  /**
   * Test suite for error handling and edge cases
   *
   * Tests various error scenarios and edge cases
   */
  describe('Error Handling', () => {
    beforeEach(() => {
      authService = new UserAuthService({
        api: mockApi,
        store: mockStore
      });
    });

    it('should handle concurrent login attempts', async () => {
      vi.mocked(mockApi.login).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(loginResponse), 100)
          )
      );
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);

      const promise1 = authService.login(loginCredentials);
      const promise2 = authService.login(loginCredentials);

      await Promise.all([promise1, promise2]);

      expect(mockStore.startAuth).toHaveBeenCalledTimes(2);
      expect(mockApi.login).toHaveBeenCalledTimes(2);
    });

    it('should handle partial login response data', async () => {
      const partialResponse = { token: 'partial-token' };
      vi.mocked(mockApi.login).mockResolvedValue(partialResponse);
      vi.mocked(mockApi.getUserInfo).mockResolvedValue(testUser);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(null);

      const result = await authService.login(loginCredentials);

      expect(mockStore.authSuccess).toHaveBeenCalledWith(
        testUser,
        partialResponse
      );
      expect(result).toBe(partialResponse);
    });

    it('should handle API methods returning null/undefined', async () => {
      vi.mocked(mockApi.getUserInfo).mockResolvedValue({} as TestUser);
      vi.mocked(mockStore.getUserInfo).mockReturnValue(testUser);

      const result = await authService.userInfo();

      expect(result).toEqual({ ...testUser, ...{} });
    });

    it('should handle store methods throwing errors', async () => {
      const storeError = new Error('Store error');
      vi.mocked(mockStore.startAuth).mockImplementation(() => {
        throw storeError;
      });

      await expect(authService.login(loginCredentials)).rejects.toThrow(
        'Store error'
      );
    });
  });
});
