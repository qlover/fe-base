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
import {
  UserService,
  UserServiceConfig
} from '../../src/core/gateway-auth/impl/UserService';
import { UserServiceGateway } from '../../src/core/gateway-auth/interface/UserServiceInterface';
import { LoginParams } from '../../src/core/gateway-auth/interface/LoginInterface';
import { GatewayExecutor } from '../../src/core/gateway-auth/impl/GatewayExecutor';
import { AsyncStoreStatus } from '../../src/core/store-state';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

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
  public login = vi.fn();
  public logout = vi.fn();
  public register = vi.fn();
  public getUserInfo = vi.fn();
  public refreshUserInfo = vi.fn();
}

/**
 * Mock logger implementation for testing
 */
class MockLogger implements LoggerInterface {
  public log = vi.fn();
  public fatal = vi.fn();
  public trace = vi.fn();
  public debug = vi.fn();
  public info = vi.fn();
  public warn = vi.fn();
  public error = vi.fn();
  public addAppender = vi.fn();
  /**
   * @override
   */
  public context<Value>(value?: Value): LogContext<Value> {
    return new LogContext<Value>(value);
  }
}

/**
 * Mock storage implementation for testing persistence
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();

  /**
   * @override
   */
  public get length(): number {
    return this.data.size;
  }

  /**
   * @override
   */
  public setItem<T>(key: Key, value: T): T {
    this.data.set(String(key), value);
    return value;
  }

  /**
   * @override
   */
  public getItem<T>(key: Key): T | null {
    const value = this.data.get(String(key));
    return (value ?? null) as T | null;
  }

  /**
   * @override
   */
  public removeItem(key: Key): void {
    this.data.delete(String(key));
  }

  /**
   * @override
   */
  public clear(): void {
    this.data.clear();
  }

  /**
   * @override
   */
  public reset(): void {
    this.data.clear();
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

    describe('store persistence configuration', () => {
      it('should create UserService with store configuration (default: persist credential only)', () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token'
          }
        });

        expect(service.getStore()).toBeDefined();
        const store = service.getStore();
        // Verify store is configured correctly
        expect(store.getStorage()).toBe(mockStorage);
      });

      it('should create UserService with dual persistence configuration', () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'user-info',
            credentialStorageKey: 'auth-token',
            persistUserInfo: true
          }
        });

        expect(service.getStore()).toBeDefined();
        const store = service.getStore();
        expect(store.getStorage()).toBe(mockStorage);
      });

      it('should persist credential only by default after login', async () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token'
          }
        });

        mockGateway.login.mockResolvedValue(testCredential);
        mockGateway.getUserInfo.mockResolvedValue(testUser);

        await service.login(loginParams);

        // Credential should be persisted
        expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
        // User info should NOT be persisted (in memory only)
        expect(mockStorage.data.get('auth-token')).not.toEqual(testUser);
      });

      it('should persist both user info and credential when dual persistence is enabled', async () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'user-info',
            credentialStorageKey: 'auth-token',
            persistUserInfo: true
          }
        });

        mockGateway.login.mockResolvedValue(testCredential);
        mockGateway.getUserInfo.mockResolvedValue(testUser);

        await service.login(loginParams);

        // Both should be persisted
        expect(mockStorage.data.get('auth-token')).toEqual(testCredential);
        expect(mockStorage.data.get('user-info')).toEqual(testUser);
      });

      it('should restore credential from storage on initialization', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with credential
        mockStorage.setItem('auth-token', testCredential);

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token',
            initRestore: true
          }
        });

        const store = service.getStore();
        expect(store.getCredential()).toEqual(testCredential);
      });

      it('should restore both user info and credential when dual persistence is enabled', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with both
        mockStorage.setItem('auth-token', testCredential);
        mockStorage.setItem('user-info', testUser);

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'user-info',
            credentialStorageKey: 'auth-token',
            persistUserInfo: true,
            initRestore: true
          }
        });

        const store = service.getStore();
        expect(store.getCredential()).toEqual(testCredential);
        expect(store.getUser()).toEqual(testUser);
      });

      it('should return false when credential is restored but status is not SUCCESS', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with credential
        mockStorage.setItem('auth-token', testCredential);

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token',
            initRestore: true
          }
        });

        // Credential is restored
        expect(service.getStore().getCredential()).toEqual(testCredential);
        // But status is NOT automatically set to SUCCESS
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
        // So isAuthenticated returns false
        expect(service.isAuthenticated()).toBe(false);
      });

      it('should return true when credential is restored and status is manually set to SUCCESS', () => {
        const mockStorage = new MockStorage<string>();
        mockStorage.setItem('auth-token', testCredential);

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token',
            initRestore: true
          }
        });

        // Credential is restored but status is DRAFT
        expect(service.getStore().getCredential()).toEqual(testCredential);
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
        expect(service.isAuthenticated()).toBe(false);

        // Developer manually sets status to SUCCESS after validation
        service.getStore().updateState({
          status: AsyncStoreStatus.SUCCESS,
          loading: false,
          error: null,
          endTime: Date.now()
        });

        // Now isAuthenticated returns true
        expect(service.isAuthenticated()).toBe(true);
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      });

      it('should return false when both credential and user info are restored but status is not SUCCESS', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with both
        mockStorage.setItem('auth-token', testCredential);
        mockStorage.setItem('user-info', testUser);

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'user-info',
            credentialStorageKey: 'auth-token',
            persistUserInfo: true,
            initRestore: true
          }
        });

        // Both are restored
        expect(service.getStore().getCredential()).toEqual(testCredential);
        expect(service.getStore().getUser()).toEqual(testUser);
        // But status is NOT automatically set to SUCCESS
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
        // So isAuthenticated returns false
        expect(service.isAuthenticated()).toBe(false);
      });

      it('should set isAuthenticated to false when no credential is restored', () => {
        const mockStorage = new MockStorage<string>();
        // Storage is empty

        const service = new UserService<TestUser, TestCredential>({
          gateway: mockGateway,
          store: {
            storage: mockStorage,
            storageKey: 'auth-token',
            initRestore: true
          }
        });

        // isAuthenticated should return false when no credential is restored
        expect(service.isAuthenticated()).toBe(false);
        expect(service.getStore().getCredential()).toBeNull();
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
      });

      describe('Custom authentication logic examples', () => {
        it('should demonstrate overriding isAuthenticated with credential expiration check', () => {
          class CustomUserService extends UserService<
            TestUser,
            TestCredential
          > {
            public override isAuthenticated(): boolean {
              const credential = this.getCredential();
              if (!credential) return false;

              // Check if credential has expired
              if (credential.expiresIn && credential.expiresIn <= 0) {
                // Credential expired, clear it
                this.getStore().setCredential(null);
                return false;
              }

              // Use base implementation
              return super.isAuthenticated();
            }
          }

          const mockStorage = new MockStorage<string>();
          const expiredCredential = { ...testCredential, expiresIn: -1000 }; // Expired
          mockStorage.setItem('auth-token', expiredCredential);

          const service = new CustomUserService({
            gateway: mockGateway,
            store: {
              storage: mockStorage,
              storageKey: 'auth-token',
              initRestore: true
            }
          });

          // Credential is restored but expired
          expect(service.getStore().getCredential()).toEqual(expiredCredential);
          // Custom isAuthenticated should clear expired credential and return false
          expect(service.isAuthenticated()).toBe(false);
          expect(service.getStore().getCredential()).toBeNull();
        });

        it('should demonstrate overriding isAuthenticated to require both credential and user', () => {
          class CustomUserService extends UserService<
            TestUser,
            TestCredential
          > {
            public override isAuthenticated(): boolean {
              const state = this.getStore().getState();
              // Require both credential and user info
              return (
                state.status === AsyncStoreStatus.SUCCESS &&
                !!this.getCredential() &&
                !!this.getUser()
              );
            }
          }

          const mockStorage = new MockStorage<string>();
          mockStorage.setItem('auth-token', testCredential);

          const service = new CustomUserService({
            gateway: mockGateway,
            store: {
              storage: mockStorage,
              storageKey: 'auth-token',
              initRestore: true
            }
          });

          // Credential restored but user info is missing
          expect(service.getStore().getCredential()).toEqual(testCredential);
          expect(service.getStore().getUser()).toBeNull();
          // Custom isAuthenticated requires both, so returns false
          expect(service.isAuthenticated()).toBe(false);

          // Set status to SUCCESS manually
          service.getStore().updateState({
            status: AsyncStoreStatus.SUCCESS,
            loading: false,
            error: null,
            endTime: Date.now()
          });

          // Still false because user info is missing
          expect(service.isAuthenticated()).toBe(false);

          // Set user info
          service.getStore().setUser(testUser);
          // Now returns true
          expect(service.isAuthenticated()).toBe(true);
        });

        it('should demonstrate handling credential restoration with validation in constructor', () => {
          class CustomUserService extends UserService<
            TestUser,
            TestCredential
          > {
            constructor(options: UserServiceConfig<TestUser, TestCredential>) {
              super(options);

              // After store initialization, check if credential was restored
              const credential = this.getStore().getCredential();
              if (credential) {
                // Validate credential (e.g., check expiration)
                if (this.isCredentialValid(credential)) {
                  // Credential is valid, set status to SUCCESS
                  this.getStore().updateState({
                    status: AsyncStoreStatus.SUCCESS,
                    loading: false,
                    error: null,
                    endTime: Date.now()
                  });
                } else {
                  // Credential invalid, clear it
                  this.getStore().setCredential(null);
                }
              }
            }

            /**
             * @override
             */
            private isCredentialValid(credential: TestCredential): boolean {
              // Example: Check expiration
              return credential.expiresIn > 0;
            }
          }

          const mockStorage = new MockStorage<string>();
          mockStorage.setItem('auth-token', testCredential);

          const service = new CustomUserService({
            gateway: mockGateway,
            store: {
              storage: mockStorage,
              storageKey: 'auth-token',
              initRestore: true
            }
          });

          // Credential is restored and validated in constructor
          expect(service.getStore().getCredential()).toEqual(testCredential);
          expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
          expect(service.isAuthenticated()).toBe(true);
        });

        it('should demonstrate handling expired credential restoration', () => {
          class CustomUserService extends UserService<
            TestUser,
            TestCredential
          > {
            constructor(options: UserServiceConfig<TestUser, TestCredential>) {
              super(options);

              const credential = this.getStore().getCredential();
              if (credential) {
                // Check if expired
                if (credential.expiresIn <= 0) {
                  // Expired, clear it
                  this.getStore().setCredential(null);
                } else {
                  // Valid, set status to SUCCESS
                  this.getStore().updateState({
                    status: AsyncStoreStatus.SUCCESS,
                    loading: false,
                    error: null,
                    endTime: Date.now()
                  });
                }
              }
            }
          }

          const mockStorage = new MockStorage<string>();
          const expiredCredential = { ...testCredential, expiresIn: -1000 };
          mockStorage.setItem('auth-token', expiredCredential);

          const service = new CustomUserService({
            gateway: mockGateway,
            store: {
              storage: mockStorage,
              storageKey: 'auth-token',
              initRestore: true
            }
          });

          // Expired credential should be cleared
          expect(service.getStore().getCredential()).toBeNull();
          expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
          expect(service.isAuthenticated()).toBe(false);
        });
      });
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
    it('should return false when not authenticated (basic check)', () => {
      // No credential, no SUCCESS status
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return false when credential exists but status is not SUCCESS', () => {
      // Set credential but status is DRAFT
      userService.getStore().setCredential(testCredential);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
      // Basic check requires SUCCESS status
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when credential exists and status is SUCCESS (basic check)', () => {
      // Set credential and status to SUCCESS
      userService.getStore().success(null, testCredential);
      expect(userService.getStore().getCredential()).toEqual(testCredential);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      // Basic check passes
      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return false when status is SUCCESS but credential is null', () => {
      // Set status to SUCCESS but no credential
      userService.getStore().success(testUser);
      userService.getStore().setCredential(null);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      expect(userService.getStore().getCredential()).toBeNull();
      // Basic check requires credential
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when credential exists and status is SUCCESS (user info optional)', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockResolvedValue(testUser);

      await userService.login(loginParams);

      // Basic check: credential + SUCCESS status = authenticated
      // User info is optional for basic check
      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return true even when getUserInfo fails but credential exists', async () => {
      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.getUserInfo.mockRejectedValue(
        new Error('Failed to fetch user')
      );

      await userService.login(loginParams);

      // Login succeeded, credential exists, status is SUCCESS
      // Basic check only requires credential + SUCCESS status
      // User info failure doesn't affect basic authentication check
      expect(userService.getStore().getCredential()).toEqual(testCredential);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      expect(userService.getUser()).toBeNull(); // User info fetch failed
      expect(userService.isAuthenticated()).toBe(true); // But still authenticated
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
