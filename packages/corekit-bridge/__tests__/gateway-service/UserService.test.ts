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
 * 10. edge cases         – Error handling and boundary tests
 * 11. integration        – Complete user flow tests
 */

import { describe, it, expect, beforeEach, vi, expectTypeOf } from 'vitest';
import {
  UserService,
  UserServiceErrorIds,
  type UserServiceConfig
} from '../../src/core/gateway-service/impl/UserService';
import { ExecutorError } from '@qlover/fe-corekit';
import { type UserServiceGateway } from '../../src/core/gateway-service/interface/UserServiceInterface';
import { type LoginParams } from '../../src/core/gateway-service/interface/UserServiceInterface';
import { AsyncStoreStatus } from '../../src/core/store-state';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';
import { KeyStorage, type StorageInterface } from '@qlover/fe-corekit';
import type {
  UserStateInterface,
  UserStoreInterface
} from '../../src/core/gateway-service/interface/UserStoreInterface';
import { UserStore } from '@qlover/corekit-bridge/core';
import type { GatewayResult } from '../../src/core/gateway-service/interface/GatewayServiceInterface';

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

type TestUserState = UserStateInterface<TestUser, TestCredential>;

function createSessionPersist(
  storage: StorageInterface<string, unknown>,
  key = 'auth-session'
) {
  return new KeyStorage<string, Partial<TestUserState>>(
    key,
    storage as StorageInterface<string, Partial<TestUserState>>
  );
}

/**
 * Mock gateway implementation for testing
 *
 * Note: All methods are mocked using vi.fn() to enable tracking calls and return values
 */
class MockUserGateway implements UserServiceGateway<
  TestUser,
  TestCredential,
  any
> {
  public login = vi
    .fn()
    .mockImplementation(
      (
        _params: LoginParams,
        _config?: any
      ): Promise<GatewayResult<TestCredential>> =>
        Promise.resolve({ data: {} as TestCredential, error: null })
    );
  public logout = vi
    .fn()
    .mockImplementation(
      (_params?: unknown, _config?: any): Promise<unknown> => Promise.resolve()
    );
  public register = vi
    .fn()
    .mockImplementation(
      (_params: unknown, _config?: any): Promise<GatewayResult<TestUser>> =>
        Promise.resolve({ data: {} as TestUser, error: null })
    );
  public getUserInfo = vi
    .fn()
    .mockImplementation(
      (_params?: unknown, _config?: any): Promise<GatewayResult<TestUser>> =>
        Promise.resolve({ data: {} as TestUser, error: null })
    );
  public refreshUserInfo = vi
    .fn()
    .mockImplementation(
      (_params?: unknown, _config?: any): Promise<GatewayResult<TestUser>> =>
        Promise.resolve({ data: {} as TestUser, error: null })
    );
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
class MockStorage<Key = string> implements StorageInterface<Key, unknown> {
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

    userService = new UserService<TestUser, TestCredential>(mockGateway, {
      logger: mockLogger
    });
  });

  describe('constructor', () => {
    it('should create UserService with default configuration', () => {
      const service = new UserService<TestUser, TestCredential>(mockGateway);
      expect(service).toBeInstanceOf(UserService);
      expect(service.getStore()).toBeDefined();
    });

    it('should create UserService with custom service name', () => {
      const service = new UserService<TestUser, TestCredential>(mockGateway, {
        serviceName: 'CustomUserService'
      });
      expect(service).toBeInstanceOf(UserService);
    });

    it('should create UserService with gateway and logger', () => {
      const service = new UserService<TestUser, TestCredential>(mockGateway, {
        logger: mockLogger
      });
      expect(service.gateway).toBe(mockGateway);
      expect(service.logger).toBe(mockLogger);
    });

    it('should create UserService with gateway', () => {
      const service = new UserService<TestUser, TestCredential>(mockGateway);
      expect(service.gateway).toBe(mockGateway);
    });

    describe('store persistence configuration', () => {
      it('should create UserService with store configuration (default: persist credential only)', () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage) }
        });

        expect(service.getStore()).toBeDefined();
        const store = service.getStore();
        expect(store).toBeInstanceOf(UserStore);
        expect(
          (store as UserStore<TestUser, TestCredential, string>).getPersist()?.key).toBe('auth-session');
      });

      it('should create UserService with dual persistence configuration', () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), persistKeys: ['result', 'credential'] }
        });

        expect(service.getStore()).toBeDefined();
        const store = service.getStore() as UserStore<
          TestUser,
          TestCredential,
          string
        >;
        expect(store.getPersist()?.key).toBe('auth-session');
      });

      it('should persist credential only by default after login', async () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage) }
        });

        mockGateway.login.mockResolvedValue({
          data: testCredential,
          error: null
        });
        mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

        const result = await service.login(loginParams);
        expect(result.error).toBeNull();
        // Credential should be persisted
        expect((mockStorage.data.get('auth-session') as any)?.credential).toEqual(testCredential);
        // User info should NOT be persisted (in memory only)
        expect((mockStorage.data.get('auth-session') as any)?.result).toBeUndefined();
      });

      it('should persist both user info and credential when dual persistence is enabled', async () => {
        const mockStorage = new MockStorage<string>();
        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), persistKeys: ['result', 'credential'] }
        });

        mockGateway.login.mockResolvedValue({
          data: testCredential,
          error: null
        });
        mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

        await service.login(loginParams);

        // Both should be persisted
        expect((mockStorage.data.get('auth-session') as any)?.credential).toEqual(testCredential);
        expect((mockStorage.data.get('auth-session') as any)?.result).toEqual(testUser);
      });

      it('should restore credential from storage on initialization', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with credential
        mockStorage.setItem('auth-session', { credential: testCredential });

        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), initRestore: true }
        });

        const store = service.getStore();
        expect(store.getCredential()).toEqual(testCredential);
      });

      it('should restore both user info and credential when dual persistence is enabled', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with both
        mockStorage.setItem('auth-session', { credential: testCredential, result: testUser });


        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), persistKeys: ['result', 'credential'], initRestore: true }
        });

        const store = service.getStore();
        expect(store.getCredential()).toEqual(testCredential);
        expect(store.getUser()).toEqual(testUser);
      });

      it('should return false when credential is restored but status is not SUCCESS', () => {
        const mockStorage = new MockStorage<string>();
        // Pre-populate storage with credential
        mockStorage.setItem('auth-session', { credential: testCredential });

        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), initRestore: true }
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
        mockStorage.setItem('auth-session', { credential: testCredential });

        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), initRestore: true }
        });

        // Credential is restored but status is DRAFT
        expect(service.getStore().getCredential()).toEqual(testCredential);
        expect(service.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
        expect(service.isAuthenticated()).toBe(false);

        // Developer manually sets status to SUCCESS after validation
        service.getStore().emit({
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
        mockStorage.setItem('auth-session', { credential: testCredential, result: testUser });


        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), persistKeys: ['result', 'credential'], initRestore: true }
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

        const service = new UserService<TestUser, TestCredential>(mockGateway, {
          store: { persist: createSessionPersist(mockStorage), initRestore: true }
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
          mockStorage.setItem('auth-session', {
            credential: expiredCredential
          });

          const service = new CustomUserService(mockGateway, {
            store: { persist: createSessionPersist(mockStorage), initRestore: true }
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
          mockStorage.setItem('auth-session', { credential: testCredential });

          const service = new CustomUserService(mockGateway, {
            store: { persist: createSessionPersist(mockStorage), initRestore: true }
          });

          // Credential restored but user info is missing
          expect(service.getStore().getCredential()).toEqual(testCredential);
          expect(service.getStore().getUser()).toBeNull();
          // Custom isAuthenticated requires both, so returns false
          expect(service.isAuthenticated()).toBe(false);

          // Set status to SUCCESS manually
          service.getStore().emit({
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
            constructor(
              gateway: UserServiceGateway<TestUser, TestCredential, unknown>,
              options: UserServiceConfig<TestUser, TestCredential>
            ) {
              super(gateway, options);

              // After store initialization, check if credential was restored
              const credential = this.getStore().getCredential();
              if (credential) {
                // Validate credential (e.g., check expiration)
                if (this.isCredentialValid(credential)) {
                  // Credential is valid, set status to SUCCESS
                  this.getStore().emit({
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
          mockStorage.setItem('auth-session', { credential: testCredential });

          const service = new CustomUserService(mockGateway, {
            store: { persist: createSessionPersist(mockStorage), initRestore: true }
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
            constructor(
              gateway: UserServiceGateway<TestUser, TestCredential, any>,
              options: UserServiceConfig<TestUser, TestCredential>
            ) {
              super(gateway, options);

              const credential = this.getStore().getCredential();
              if (credential) {
                // Check if expired
                if (credential.expiresIn <= 0) {
                  // Expired, clear it
                  this.getStore().setCredential(null);
                } else {
                  // Valid, set status to SUCCESS
                  this.getStore().emit({
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
          mockStorage.setItem('auth-session', {
            credential: expiredCredential
          });

          const service = new CustomUserService(mockGateway, {
            store: { persist: createSessionPersist(mockStorage), initRestore: true }
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
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.login(loginParams);

      expect(mockGateway.login).toHaveBeenCalledWith(loginParams, undefined);
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      expect(result.error).toBeNull();
      expect(result.data).toEqual(testCredential);

      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should login successfully but fail to fetch user info (still returns credential)', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      const getUserInfoError = new Error('Failed to fetch user info');
      mockGateway.getUserInfo.mockResolvedValue({
        error: getUserInfoError,
        data: null
      });

      const result = await userService.login(loginParams);

      // Verify login was called
      expect(mockGateway.login).toHaveBeenCalled();
      // Verify getUserInfo was called
      expect(mockGateway.getUserInfo).toHaveBeenCalled();
      // Should still return credential (success)
      expect(result.error).toBeNull();
      expect(result.data).toEqual(testCredential);

      const store = userService.getStore();
      // Credential is saved, user info is null, status SUCCESS
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      // Warning logged
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should handle login failure when gateway returns error result', async () => {
      const loginError = new Error('Invalid credentials');
      mockGateway.login.mockResolvedValue({ error: loginError, data: null });

      const result = await userService.login(loginParams);

      expect(result.error).toEqual(loginError);
      expect(result.data).toBeNull();
      expect(mockGateway.getUserInfo).not.toHaveBeenCalled();

      const store = userService.getStore();
      expect(store.getCredential()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should handle login failure when gateway returns invalid credential (null data)', async () => {
      mockGateway.login.mockResolvedValue({ data: null } as any);

      const result = await userService.login(loginParams);

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        UserServiceErrorIds.InValidCredential
      );
      expect(result.error!.message).toBe('Login is not valid credential');
      expect(mockGateway.getUserInfo).not.toHaveBeenCalled();

      const store = userService.getStore();
      expect(store.getCredential()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should throw system-level errors (network, unexpected) from gateway.login', async () => {
      const networkError = new Error('Network failure');
      mockGateway.login.mockRejectedValue(networkError);

      await expect(userService.login(loginParams)).rejects.toThrow(
        'Network failure'
      );

      const store = userService.getStore();
      expect(store.getStatus()).toBe(AsyncStoreStatus.FAILED);
    });

    it('should support phone code login', async () => {
      const phoneLoginParams: LoginParams = {
        phone: '13800138000',
        code: '123456'
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.login(phoneLoginParams);

      expect(mockGateway.login).toHaveBeenCalledWith(
        phoneLoginParams,
        undefined
      );
      expect(result.data).toEqual(testCredential);
    });
  });

  describe('logout', () => {
    beforeEach(async () => {
      // Setup authenticated state
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);
    });

    it('should logout successfully and reset store', async () => {
      mockGateway.logout.mockResolvedValue(undefined);

      const result = await userService.logout();

      expect(mockGateway.logout).toHaveBeenCalled();
      expect(result).toBeUndefined();
      const store = userService.getStore();
      expect(store.getCredential()).toBeNull();
      expect(store.getUser()).toBeNull();
      expect(store.getStatus()).toBe(AsyncStoreStatus.DRAFT);
    });

    it('should logout with parameters', async () => {
      const logoutParams = { revokeAll: true };
      mockGateway.logout.mockResolvedValue(undefined);

      await userService.logout(logoutParams);

      expect(mockGateway.logout).toHaveBeenCalledWith(logoutParams, undefined);
    });

    it('should handle logout failure without resetting store', async () => {
      const error = new Error('Logout failed');
      mockGateway.logout.mockRejectedValue(error);

      await expect(userService.logout()).rejects.toThrow('Logout failed');

      // Store should not be reset on failure
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getUser()).toEqual(testUser);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123',
        code: '123456'
      };

      mockGateway.register.mockResolvedValue({ data: testUser, error: null });

      const result = await userService.register(registerParams);

      expect(mockGateway.register).toHaveBeenCalledWith(
        registerParams,
        undefined
      );
      expect(result.error).toBeNull();
      expect(result.data).toEqual(testUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(testUser);
      // Registration should not change authentication status
      expect(store.getCredential()).toBeNull();
    });

    it('should handle registration failure when gateway returns error result', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123'
      };
      const regError = new Error('Email already exists');
      mockGateway.register.mockResolvedValue({ error: regError, data: null });

      const result = await userService.register(registerParams);

      expect(result.error).toEqual(regError);
      expect(result.data).toBeNull();
      expect(userService.getStore().getUser()).toBeNull();
    });

    it('should handle registration failure when gateway returns invalid user (null data)', async () => {
      const registerParams = {
        email: 'newuser@example.com',
        password: 'password123'
      };
      mockGateway.register.mockResolvedValue({ data: null } as any);

      const result = await userService.register(registerParams);

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        UserServiceErrorIds.InValidUser
      );
      expect(result.error!.message).toBe('Register user is not valid user');
    });

    it('should throw system-level errors from register gateway', async () => {
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
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);
      vi.clearAllMocks(); // Clear mocks after login setup
    });

    it('should get user info using credential from store', async () => {
      mockGateway.getUserInfo.mockResolvedValue({
        data: testUser,
        error: null
      });

      const result = await userService.getUserInfo();

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(
        testCredential,
        undefined
      );
      expect(result.error).toBeNull();
      expect(result.data).toEqual(testUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(testUser);
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should get user info with custom parameters', async () => {
      const customParams = { token: 'custom-token' };
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.getUserInfo(customParams);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(
        customParams,
        undefined
      );
      expect(result.data).toEqual(testUser);
    });

    it('should handle getUserInfo failure when gateway returns error result', async () => {
      const error = new Error('User not found');
      mockGateway.getUserInfo.mockResolvedValue({ error, data: null });

      const result = await userService.getUserInfo();

      expect(result.error).toEqual(error);
      expect(result.data).toBeNull();
      // Authentication state should remain unchanged
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should throw system-level errors from getUserInfo gateway', async () => {
      const networkError = new Error('Network failure');
      mockGateway.getUserInfo.mockRejectedValue(networkError);

      await expect(userService.getUserInfo()).rejects.toThrow(
        'Network failure'
      );

      // Auth state unchanged
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should return error when getUserInfo returns invalid user (null data)', async () => {
      mockGateway.getUserInfo.mockResolvedValue({ data: null } as any);

      const result = await userService.getUserInfo();

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        UserServiceErrorIds.InValidUser
      );
      expect(result.error!.message).toBe('getUserInfo is not valid user');
    });
  });

  describe('refreshUserInfo', () => {
    beforeEach(async () => {
      // Setup authenticated state
      vi.clearAllMocks();
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);
      vi.clearAllMocks();
    });

    it('should refresh user info using credential from store', async () => {
      const refreshedUser: TestUser = {
        ...testUser,
        name: 'John Updated'
      };
      mockGateway.refreshUserInfo.mockResolvedValue({
        data: refreshedUser,
        error: null
      });

      const result = await userService.refreshUserInfo();

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(
        testCredential,
        undefined
      );
      expect(result.error).toBeNull();
      expect(result.data).toEqual(refreshedUser);

      const store = userService.getStore();
      expect(store.getUser()).toEqual(refreshedUser);
      expect(store.getCredential()).toEqual(testCredential);
    });

    it('should refresh user info with custom parameters', async () => {
      const customParams = { force: true };
      const refreshedUser: TestUser = {
        ...testUser,
        name: 'John Updated'
      };
      mockGateway.refreshUserInfo.mockResolvedValue({ data: refreshedUser });

      const result = await userService.refreshUserInfo(customParams);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(
        customParams,
        undefined
      );
      expect(result.data).toEqual(refreshedUser);
    });

    it('should handle refreshUserInfo failure when gateway returns error result', async () => {
      const error = new Error('Refresh failed');
      mockGateway.refreshUserInfo.mockResolvedValue({ error, data: null });

      const result = await userService.refreshUserInfo();

      expect(result.error).toEqual(error);
      expect(result.data).toBeNull();
      // Auth state unchanged
      const store = userService.getStore();
      expect(store.getCredential()).toEqual(testCredential);
      expect(store.getStatus()).toBe(AsyncStoreStatus.SUCCESS);
    });

    it('should throw system-level errors from refreshUserInfo gateway', async () => {
      const networkError = new Error('Network failure');
      mockGateway.refreshUserInfo.mockRejectedValue(networkError);

      await expect(userService.refreshUserInfo()).rejects.toThrow(
        'Network failure'
      );
    });

    it('should return error when refreshUserInfo returns invalid user (null data)', async () => {
      mockGateway.refreshUserInfo.mockResolvedValue({ data: null } as any);

      const result = await userService.refreshUserInfo();

      expect(result.error).toBeInstanceOf(ExecutorError);
      expect((result.error as ExecutorError).id).toBe(
        UserServiceErrorIds.InValidUser
      );
      expect(result.error!.message).toBe('RefreshUser is not valid user');
    });
  });

  describe('isAuthenticated', () => {
    it('should return false when not authenticated (basic check)', () => {
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return false when credential exists but status is not SUCCESS', () => {
      userService.getStore().setCredential(testCredential);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.DRAFT);
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when credential exists and status is SUCCESS', () => {
      userService.getStore().success(null, testCredential);
      expect(userService.getStore().getCredential()).toEqual(testCredential);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return false when status is SUCCESS but credential is null', () => {
      userService.getStore().success(testUser);
      userService.getStore().setCredential(null);
      expect(userService.getStore().getStatus()).toBe(AsyncStoreStatus.SUCCESS);
      expect(userService.getStore().getCredential()).toBeNull();
      expect(userService.isAuthenticated()).toBe(false);
    });

    it('should return true when credential exists and status is SUCCESS (user info optional)', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      expect(userService.isAuthenticated()).toBe(true);
    });

    it('should return false after logout', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
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
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      expect(userService.getUser()).toEqual(testUser);
    });

    it('should return updated user after getUserInfo', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);

      const updatedUser: TestUser = {
        ...testUser,
        name: 'Updated Name'
      };
      mockGateway.getUserInfo.mockResolvedValue({ data: updatedUser });

      const result = await userService.getUserInfo();
      expect(result.data).toEqual(updatedUser);
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

  describe('integration', () => {
    it('should handle complete user flow: login -> getUserInfo -> logout', async () => {
      // Login
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      const loginResult = await userService.login(loginParams);
      expect(loginResult.data).toEqual(testCredential);
      expect(userService.isAuthenticated()).toBe(true);
      expect(userService.getUser()).toEqual(testUser);

      // Get user info (refresh)
      const updatedUser: TestUser = {
        ...testUser,
        name: 'Updated Name'
      };
      mockGateway.getUserInfo.mockResolvedValue({ data: updatedUser });
      const userInfoResult = await userService.getUserInfo();
      expect(userInfoResult.data).toEqual(updatedUser);
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
      mockGateway.register.mockResolvedValue({ data: testUser });
      const registerResult = await userService.register(registerParams);
      expect(registerResult.data).toEqual(testUser);
      expect(userService.getUser()).toEqual(testUser);
      expect(userService.isAuthenticated()).toBe(false);

      // Login
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      const loginResult = await userService.login(loginParams);
      expect(loginResult.data).toEqual(testCredential);
      expect(userService.isAuthenticated()).toBe(true);
      expect(userService.getStore().getCredential()).toEqual(testCredential);
    });
  });

  describe('edge cases', () => {
    it('should handle getUserInfo when not authenticated (no credential)', async () => {
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      // Pass null explicitly
      const result = await userService.getUserInfo(null);
      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(null, undefined);
      expect(result.data).toEqual(testUser);
    });

    it('should handle refreshUserInfo when not authenticated', async () => {
      mockGateway.refreshUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.refreshUserInfo(null);
      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(null, undefined);
      expect(result.data).toEqual(testUser);
    });

    it('should handle null params in getUserInfo', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);

      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      // Explicitly pass null
      const result = await userService.getUserInfo(null);
      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(null, undefined);
      expect(result.data).toEqual(testUser);
    });

    it('should handle undefined params in getUserInfo (use stored credential)', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });
      await userService.login(loginParams);

      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.getUserInfo(undefined);
      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(
        testCredential,
        undefined
      );
      expect(result.data).toEqual(testUser);
    });
  });

  /**
   * Type safety tests
   */
  describe('Type Safety Tests', () => {
    it('should maintain generic types throughout the service', () => {
      expectTypeOf(
        userService.getUser
      ).returns.toEqualTypeOf<TestUser | null>();
      expectTypeOf(userService.login).returns.resolves.toMatchTypeOf<
        GatewayResult<TestCredential>
      >();
      expectTypeOf(userService.getStore).returns.toMatchTypeOf<
        UserStoreInterface<TestUser, TestCredential>
      >();
    });

    it('should validate all async method return types', () => {
      expectTypeOf(userService.login).returns.resolves.toMatchTypeOf<
        GatewayResult<TestCredential>
      >();
      expectTypeOf(userService.register).returns.resolves.toMatchTypeOf<
        GatewayResult<TestUser>
      >();
      expectTypeOf(userService.getUserInfo).returns.resolves.toMatchTypeOf<
        GatewayResult<TestUser>
      >();
      expectTypeOf(userService.refreshUserInfo).returns.resolves.toMatchTypeOf<
        GatewayResult<TestUser>
      >();
    });

    it('should validate sync method return types', () => {
      expectTypeOf(
        userService.isAuthenticated
      ).returns.toEqualTypeOf<boolean>();
      expectTypeOf(
        userService.getUser
      ).returns.toEqualTypeOf<TestUser | null>();
    });

    it('should infer types correctly from method calls', async () => {
      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const loginResult = await userService.login(loginParams);
      expectTypeOf(loginResult).toMatchTypeOf<GatewayResult<TestCredential>>();

      const user = userService.getUser();
      expectTypeOf(user).toEqualTypeOf<TestUser | null>();

      const isAuth = userService.isAuthenticated();
      expectTypeOf(isAuth).toEqualTypeOf<boolean>();
    });
  });

  /**
   * Config parameter tests
   */
  describe('Config Parameter Tests', () => {
    it('should pass config parameter to login method in gateway', async () => {
      const testConfig = {
        timeout: 5000,
        headers: { 'X-Custom-Header': 'test-value' }
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      const result = await userService.login(loginParams, testConfig);

      expect(mockGateway.login).toHaveBeenCalledWith(loginParams, testConfig);
      expect(result.data).toEqual(testCredential);
    });

    it('should pass config parameter to logout method in gateway', async () => {
      const testConfig = {
        timeout: 3000,
        headers: { Authorization: 'Bearer token' }
      };
      const logoutParams = { revokeAll: true };
      const expectedReturn = { success: true };

      mockGateway.logout.mockResolvedValue(expectedReturn);

      const result = await userService.logout<typeof expectedReturn>(
        logoutParams,
        testConfig
      );

      expect(mockGateway.logout).toHaveBeenCalledWith(logoutParams, testConfig);
      expect(result).toEqual(expectedReturn);
    });

    it('should pass config parameter to register method in gateway', async () => {
      const testConfig = {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      };

      mockGateway.register.mockResolvedValue({ data: testUser });

      const result = await userService.register(
        { email: 'test@example.com' },
        testConfig
      );

      expect(mockGateway.register).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });

    it('should pass config parameter to getUserInfo method in gateway', async () => {
      const testConfig = {
        timeout: 7000,
        headers: { 'X-API-Key': 'secret-key' }
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.getUserInfo(testCredential, testConfig);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(
        testCredential,
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });

    it('should pass config parameter to refreshUserInfo method in gateway', async () => {
      const testConfig = {
        timeout: 8000,
        headers: { 'X-Refresh-Token': 'refresh-token' }
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.refreshUserInfo.mockResolvedValue({ data: testUser });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.refreshUserInfo(
        testCredential,
        testConfig
      );

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(
        testCredential,
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });

    it('should work with config parameter when no params are provided to getUserInfo', async () => {
      const testConfig = { timeout: 6000 };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.getUserInfo(undefined, testConfig);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(
        testCredential,
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });

    it('should work with config parameter when no params are provided to refreshUserInfo', async () => {
      const testConfig = { timeout: 9000 };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.refreshUserInfo.mockResolvedValue({ data: testUser });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.refreshUserInfo(undefined, testConfig);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(
        testCredential,
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });

    it('should pass null params with config to getUserInfo when null is explicitly provided', async () => {
      const testConfig = {
        timeout: 7000,
        headers: { 'X-API-Key': 'secret-key' }
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.getUserInfo(null, testConfig);

      expect(mockGateway.getUserInfo).toHaveBeenCalledWith(null, testConfig);
      expect(result.data).toEqual(testUser);
    });

    it('should pass null params with config to refreshUserInfo when null is explicitly provided', async () => {
      const testConfig = {
        timeout: 8000,
        headers: { 'X-Refresh-Token': 'refresh-token' }
      };

      mockGateway.login.mockResolvedValue({
        data: testCredential,
        error: null
      });
      mockGateway.refreshUserInfo.mockResolvedValue({ data: testUser });
      mockGateway.getUserInfo.mockResolvedValue({ data: testUser });

      await userService.login(loginParams);
      const result = await userService.refreshUserInfo(null, testConfig);

      expect(mockGateway.refreshUserInfo).toHaveBeenCalledWith(
        null,
        testConfig
      );
      expect(result.data).toEqual(testUser);
    });
  });
});
