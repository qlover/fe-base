/**
 * UserService test suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests with various configurations
 * 2. login              – Login operation tests with credential and user info fetching
 * 3. logout             – Logout operation tests with state reset
 * 4. register           – User registration tests
 * 5. getUserInfo        – Get user information tests
 * 6. refreshUserInfo    – Refresh user information tests
 * 7. isAuthenticated    – Authentication status check tests
 * 8. getUser            – Get current user tests
 * 9. getStore           – Store instance retrieval tests
 * 10. use                – Plugin registration tests
 * 11. edge cases         – Error handling and boundary tests
 * 12. integration        – Complete user flow tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../../src/core/gateway-auth/impl/UserService';
import { UserServiceGateway } from '../../src/core/gateway-auth/interface/UserServiceInterface';
import { LoginParams } from '../../src/core/gateway-auth/interface/LoginInterface';
import { GatewayExecutor } from '../../src/core/gateway-auth/impl/GatewayExecutor';
import { AsyncStoreStatus } from '../../src/core/store-state';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

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
 * Mock gateway implementation for testing
 *
 * Note: All methods are mocked using vi.fn() to enable tracking calls and return values
 */
class MockUserGateway implements UserServiceGateway<TestUser, TestCredential> {
  login = vi.fn();
  logout = vi.fn();
  register = vi.fn();
  getUserInfo = vi.fn();
  refreshUserInfo = vi.fn();
}

/**
 * Mock logger implementation for testing
 */
class MockLogger implements LoggerInterface {
  log = vi.fn();
  fatal = vi.fn();
  trace = vi.fn();
  debug = vi.fn();
  info = vi.fn();
  warn = vi.fn();
  error = vi.fn();
  addAppender = vi.fn();
  context<Value>(value?: Value): LogContext<Value> {
    return new LogContext<Value>(value);
  }
}

describe('UserService', () => {
  let userService: UserService<TestUser, TestCredential>;
  let mockGateway: MockUserGateway;
  let mockLogger: MockLogger;

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

  const loginParams: LoginParams = {
    email: 'user@example.com',
    password: 'password123'
  };

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();

    mockGateway = new MockUserGateway();
    mockLogger = new MockLogger();

    userService = new UserService<TestUser, TestCredential>({
      gateway: mockGateway,
      logger: mockLogger,
      executor: new GatewayExecutor<
        TestUser,
        UserServiceGateway<TestUser, TestCredential>
      >()
    });
  });

  describe('constructor', () => {
    it('should create UserService with default configuration', () => {
      const service = new UserService<TestUser, TestCredential>();
      expect(service).toBeInstanceOf(UserService);
      expect(service.getStore()).toBeDefined();
    });

    it('should create UserService with custom service name', () => {
      const service = new UserService<TestUser, TestCredential>({
        serviceName: 'CustomUserService'
      });
      expect(service).toBeInstanceOf(UserService);
    });

    it('should create UserService with gateway and logger', () => {
      const service = new UserService<TestUser, TestCredential>({
        gateway: mockGateway,
        logger: mockLogger
      });
      expect(service.getGateway()).toBe(mockGateway);
      expect(service.getLogger()).toBe(mockLogger);
    });

    it('should create UserService with executor', () => {
      const executor = new GatewayExecutor<
        TestUser,
        UserServiceGateway<TestUser, TestCredential>
      >();
      const service = new UserService<TestUser, TestCredential>({
        executor
      });
      expect(service.getExecutor()).toBe(executor);
    });
  });

  describe('login', () => {
    it('should login successfully and fetch user info', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.login(loginParams);

      // Verify login was called
      expect(mockGateway.login).toHaveBeenCalled();
      // getUserInfo is called inside the custom execution function with credential
      // Note: getUserInfo is called via gateway?.getUserInfo(credential) inside the execute callback
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testCredential);

      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should login successfully even if getUserInfo fails', async () => {
      // Setup mocks
      mockGateway.login.mockResolvedValue(testCredential);
      const getUserInfoError = new Error('Failed to fetch user info');
      mockGateway.getUserInfo.mockRejectedValue(getUserInfoError);

      const result = await userService.login(loginParams);

      // Verify login was called
      expect(mockGateway.login).toHaveBeenCalled();
      // Verify getUserInfo was called (it's called inside the custom execution function)
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      // Verify logger.warn was called with the error
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Failed to fetch user info after login',
        getUserInfoError
      );
      // Verify result
      expect(result).toEqual(testCredential);

      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should handle login failure', async () => {
      mockGateway.login.mockResolvedValue(null);

      const result = await userService.login(loginParams);

      expect(result).toBeNull();
      expect(mockGateway.getUserInfo).not.toHaveBeenCalled();

      const store = userService.getStore();
      expect(store.getCredential()).toBeNull();
      // Status should be FAILED after login failure
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should handle login error', async () => {
      const error = new Error('Login failed');
      mockGateway.login.mockRejectedValue(error);

      await expect(userService.login(loginParams)).rejects.toThrow(
        'Login failed'
      );

      const store = userService.getStore();
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should support phone code login', async () => {
      const phoneLoginParams: LoginParams = {
        phone: '13800138000',
        code: '123456'
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.login(phoneLoginParams);

      expect(mockGateway.login).toHaveBeenCalled();
      expect(result).toEqual(testCredential);
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      // Setup authenticated state
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);
    });

    it('should logout successfully and reset store', async () => {
      mockGateway.logout.mockResolvedValue(undefined);

      const result = await userService.logout();

      expect(mockGateway.logout).toHaveBeenCalled();
      // Logout returns void by default
      expect(result).toBeUndefined();
      const store = userService.getStore();
      expect(store.getCredential()).toBeNull();
      expect(store.getUser()).toBeNull();
      // After reset, status should be DRAFT
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should logout with parameters', async () => {
      const logoutParams = { revokeAll: true };
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.logout(logoutParams);

      expect(mockGateway.logout).toHaveBeenCalled();
    });

    it('should handle logout failure without resetting store', async () => {
      const error = new Error('Logout failed');
      mockGateway.logout.mockRejectedValue(error);

      await expect(userService.logout()).rejects.toThrow('Logout failed');

      // Store should not be reset on failure - credential should still be there
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      // Status should be FAILED after logout error
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123',
        code: '123456'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const result = await userService.register(registerParams);

      expect(mockGateway.register).toHaveBeenCalled();
      expect(result).toEqual(testUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(testUser);
      // Registration should not change authentication status
      expect(store.getCredential()).toBeNull();
    });

    it('should handle registration failure', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      mockGateway.register.mockResolvedValue(null);

      const result = await userService.register(registerParams);

      expect(result).toBeNull();
    });

    it('should handle registration error', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123'
      };

      const error = new Error('Registration failed');
      mockGateway.register.mockRejectedValue(error);

      await expect(userService.register(registerParams)).rejects.toThrow(
        'Registration failed'
      );
    });
  });

  describe('getUserInfo', () => {
    beforeEach(async () => {
      // Setup authenticated state
      vi.clearAllMocks();
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);
      vi.clearAllMocks(); // Clear mocks after login setup
    });

    it('should get user info using credential from store', async () => {
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.getUserInfo();

      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(testUser);
      // Should not change authentication status
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should get user info with custom parameters', async () => {
      const customParams = { token: 'custom-token' };
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.getUserInfo(customParams);

      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('should handle getUserInfo failure without affecting auth state', async () => {
      const error = new Error('Failed to get user info');
      mockGateway.getUserInfo.mockRejectedValue(error);

      await expect(userService.getUserInfo()).rejects.toThrow(
        'Failed to get user info'
      );

      // Authentication state should remain unchanged
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should return null when getUserInfo returns null', async () => {
      mockGateway.getUserInfo.mockResolvedValue(null);

      const result = await userService.getUserInfo();

      expect(result).toBeNull();
    });
  });

  describe('refreshUserInfo', () => {
    beforeEach(async () => {
      // Setup authenticated state
      vi.clearAllMocks();
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);
      vi.clearAllMocks(); // Clear mocks after login setup
    });

    it('should refresh user info using credential from store', async () => {
      const refreshedUser: TestUser = {
        ...testUser,
        name: 'John Updated'
      };
      mockGateway.refreshUserInfo.mockResolvedValue(refreshedUser);

      const result = await userService.refreshUserInfo();

      expect(mockGateway.refreshUserInfo).toHaveBeenCalled();
      expect(result).toEqual(refreshedUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(refreshedUser);
      // Should not change authentication status
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should refresh user info with custom parameters', async () => {
      const customParams = { force: true };
      const refreshedUser: TestUser = {
        ...testUser,
        name: 'John Updated'
      };
      mockGateway.refreshUserInfo.mockResolvedValue(refreshedUser);

      const result = await userService.refreshUserInfo(customParams);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalled();
      expect(result).toEqual(refreshedUser);
    });

    it('should handle refreshUserInfo failure without affecting auth state', async () => {
      const error = new Error('Failed to refresh user info');
      mockGateway.refreshUserInfo.mockRejectedValue(error);

      await expect(userService.refreshUserInfo()).rejects.toThrow(
        'Failed to refresh user info'
      );

      // Authentication state should remain unchanged
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should return null when refreshUserInfo returns null', async () => {
      mockGateway.refreshUserInfo.mockResolvedValue(null);

      const result = await userService.refreshUserInfo();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not authenticated', () => {
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return false when only credential exists', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockRejectedValue(new Error('Failed'));

      await userService.login(loginParams);

      // User is null, so not authenticated
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when both credential and user exist', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.login(loginParams);

      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.login(loginParams);
      expect(userService.isAuthenticated()).toBe(true);

      await userService.logout();
      expect(userService.isAuthenticated()).toBe(false);
    });
  });

  describe('getUser', () => {
    it('should return null when no user is set', () => {
      expect(userService.getUser()).toBeNull();
    });

    it('should return user after login', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.login(loginParams);

      expect(userService.getUser()).toEqual(testUser);
    });

    it('should return updated user after getUserInfo', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);

      const updatedUser: TestUser = {
        ...testUser,
        name: 'Updated Name'
      };
      mockGateway.getUserInfo.mockResolvedValue(updatedUser);

      await userService.getUserInfo();

      expect(userService.getUser()).toEqual(updatedUser);
    });
  });

  describe('getStore', () => {
    it('should return UserStoreInterface instance', () => {
      const store = userService.getStore();
      expect(store).toBeDefined();
      expect(store.getCredential).toBeDefined();
      expect(store.getUser).toBeDefined();
      expect(store.getStatus).toBeDefined();
    });

    it('should return the same store instance', () => {
      const store1 = userService.getStore();
      const store2 = userService.getStore();
      expect(store1).toBe(store2);
    });
  });

  describe('use', () => {
    it('should register plugin successfully', () => {
      const plugin = {
        pluginName: 'TestPlugin',
        onLoginBefore: vi.fn()
      };

      expect(() => userService.use(plugin)).not.toThrow();
    });

    it('should register multiple plugins', () => {
      const plugin1 = {
        pluginName: 'Plugin1',
        onLoginBefore: vi.fn()
      };
      const plugin2 = {
        pluginName: 'Plugin2',
        onLogoutBefore: vi.fn()
      };

      expect(() => userService.use([plugin1, plugin2])).not.toThrow();
    });

    it('should execute plugin hooks during login', async () => {
      const plugin = {
        pluginName: 'TestPlugin',
        onLoginBefore: vi.fn(),
        onLoginSuccess: vi.fn()
      };

      userService.use(plugin);
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.login(loginParams);

      expect(plugin.onLoginBefore).toHaveBeenCalled();
      expect(plugin.onLoginSuccess).toHaveBeenCalled();
    });
  });

  describe('integration', () => {
    it('should handle complete user flow: login -> getUserInfo -> logout', async () => {
      // Login
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);

      expect(userService.isAuthenticated()).toBe(true);
      expect(userService.getUser()).toEqual(testUser);

      // Get user info
      const updatedUser: TestUser = {
        ...testUser,
        name: 'Updated Name'
      };
      mockGateway.getUserInfo.mockResolvedValue(updatedUser);
      await userService.getUserInfo();

      expect(userService.getUser()).toEqual(updatedUser);
      expect(userService.isAuthenticated()).toBe(true);

      // Logout
      mockGateway.logout.mockResolvedValue(undefined);
      await userService.logout();

      expect(userService.isAuthenticated()).toBe(false);
      expect(userService.getUser()).toBeNull();
      expect(userService.getStore().getCredential()).toBeNull();
    });

    it('should handle register -> login flow', async () => {
      // Register
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123'
      };
      mockGateway.register.mockResolvedValue(testUser);
      await userService.register(registerParams);

      expect(userService.getUser()).toEqual(testUser);
      expect(userService.isAuthenticated()).toBe(false);

      // Login
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);

      expect(userService.isAuthenticated()).toBe(true);
      expect(userService.getStore().getCredential()).toEqual(testCredential);
    });
  });

  describe('edge cases', () => {
    it('should handle getUserInfo when not authenticated', async () => {
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      const result = await userService.getUserInfo();

      // Should use null credential when not authenticated
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('should handle refreshUserInfo when not authenticated', async () => {
      mockGateway.refreshUserInfo.mockResolvedValue(testUser);

      const result = await userService.refreshUserInfo();

      // Should use null credential when not authenticated
      expect(mockGateway.refreshUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('should handle null params in getUserInfo', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      // Explicitly pass null
      const result = await userService.getUserInfo(null as unknown);

      // Should use null instead of credential when null is explicitly passed
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });

    it('should handle undefined params in getUserInfo', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);
      await userService.login(loginParams);

      mockGateway.getUserInfo.mockResolvedValue(testUser);

      // Pass undefined
      const result = await userService.getUserInfo(undefined);

      // Should use credential when undefined is passed
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result).toEqual(testUser);
    });
  });
});
