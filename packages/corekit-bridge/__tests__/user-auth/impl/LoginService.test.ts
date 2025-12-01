import { describe, it, expect, beforeEach } from 'vitest';
import {
  LoginService,
  LoginParams,
  LoginCredential,
  LoginInterface
} from '../../../src/core/user-auth2';
import {
  AsyncStoreInterface,
  AsyncStateInterface,
  StoreInterface
} from '../../../src/core/store-state';

/**
 * Test credential type
 */
interface TestCredential extends LoginCredential {
  token: string;
  refreshToken?: string;
}

/**
 * Test state type
 */
interface TestState extends AsyncStateInterface<TestCredential> {}

/**
 * Mock AsyncStore implementation for testing
 */
class MockAsyncStore implements AsyncStoreInterface<TestCredential, TestState> {
  private state: TestState = {
    loading: false,
    result: null,
    error: null,
    startTime: 0,
    endTime: 0,
    status: undefined
  };

  start(result?: TestCredential): void {
    this.state = {
      ...this.state,
      loading: true,
      result: result || null,
      error: null,
      startTime: Date.now(),
      status: 'pending'
    };
  }

  stopped(error?: unknown, result?: TestCredential): void {
    this.state = {
      ...this.state,
      loading: false,
      error: error || null,
      result: result || null,
      endTime: Date.now(),
      status: 'stopped'
    };
  }

  failed(error: unknown, result?: TestCredential): void {
    this.state = {
      ...this.state,
      loading: false,
      error,
      result: result || null,
      endTime: Date.now(),
      status: 'failed'
    };
  }

  success(result: TestCredential): void {
    this.state = {
      ...this.state,
      loading: false,
      result,
      error: null,
      endTime: Date.now(),
      status: 'success'
    };
  }

  reset(): void {
    this.state = {
      loading: false,
      result: null,
      error: null,
      startTime: 0,
      endTime: 0,
      status: undefined
    };
  }

  getState(): TestState {
    return { ...this.state };
  }

  updateState(state: Partial<TestState>): void {
    this.state = { ...this.state, ...state };
  }

  getStore(): StoreInterface<TestState> {
    return this as unknown as StoreInterface<TestState>;
  }
}

/**
 * Mock LoginInterface implementation for testing
 */
class MockLoginGateway implements LoginInterface<LoginParams, TestCredential> {
  private shouldFail: boolean = false;
  private failError: Error | null = null;
  private delay: number = 0;
  private loginCallCount: number = 0;
  private logoutCallCount: number = 0;
  private lastLoginParams: LoginParams | null = null;
  private lastLogoutParams: unknown = null;

  setShouldFail(shouldFail: boolean, error?: unknown): void {
    this.shouldFail = shouldFail;
    this.failError = (error as Error) || new Error('Mock login failed');
  }

  setDelay(delay: number): void {
    this.delay = delay;
  }

  getLoginCallCount(): number {
    return this.loginCallCount;
  }

  getLogoutCallCount(): number {
    return this.logoutCallCount;
  }

  getLastLoginParams(): LoginParams | null {
    return this.lastLoginParams;
  }

  getLastLogoutParams(): unknown {
    return this.lastLogoutParams;
  }

  async login(params: LoginParams): Promise<TestCredential> {
    this.loginCallCount++;
    this.lastLoginParams = params;

    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw this.failError || new Error('Mock login failed');
    }

    return {
      token: 'mock_token_' + Date.now(),
      refreshToken: 'mock_refresh_token'
    };
  }

  async logout<LogoutParams, LogoutResult = void>(
    params?: LogoutParams
  ): Promise<LogoutResult> {
    this.logoutCallCount++;
    this.lastLogoutParams = params;

    if (this.delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delay));
    }

    if (this.shouldFail) {
      throw this.failError || new Error('Mock logout failed');
    }

    return undefined as LogoutResult;
  }
}

describe('LoginService', () => {
  let mockStore: MockAsyncStore;
  let mockGateway: MockLoginGateway;
  let loginService: LoginService<LoginParams, TestCredential, TestState>;

  beforeEach(() => {
    mockStore = new MockAsyncStore();
    mockGateway = new MockLoginGateway();
    mockGateway.setShouldFail(false);
    mockGateway.setDelay(0);
    loginService = new LoginService(mockStore, mockGateway);
  });

  describe('constructor', () => {
    it('should create LoginService with store and gateway', () => {
      const service = new LoginService(mockStore, mockGateway);

      expect(service).toBeInstanceOf(LoginService);
      expect(service.getStore()).toBe(mockStore);
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create LoginService with store and null gateway', () => {
      const service = new LoginService(mockStore, null);

      expect(service).toBeInstanceOf(LoginService);
      expect(service.getStore()).toBe(mockStore);
      expect(service.getGateway()).toBeNull();
    });

    it('should create LoginService with store and undefined gateway', () => {
      const service = new LoginService(mockStore, undefined);

      expect(service).toBeInstanceOf(LoginService);
      expect(service.getStore()).toBe(mockStore);
      expect(service.getGateway()).toBeNull();
    });

    it('should create LoginService with default null gateway when not provided', () => {
      const service = new LoginService(mockStore);

      expect(service).toBeInstanceOf(LoginService);
      expect(service.getStore()).toBe(mockStore);
      expect(service.getGateway()).toBeNull();
    });
  });

  describe('getStore', () => {
    it('should return the store instance', () => {
      expect(loginService.getStore()).toBe(mockStore);
    });

    it('should return the same store instance on multiple calls', () => {
      const store1 = loginService.getStore();
      const store2 = loginService.getStore();

      expect(store1).toBe(store2);
      expect(store1).toBe(mockStore);
    });
  });

  describe('getGateway', () => {
    it('should return the gateway instance when set', () => {
      expect(loginService.getGateway()).toBe(mockGateway);
    });

    it('should return null when gateway is not set', () => {
      const service = new LoginService(mockStore, null);
      expect(service.getGateway()).toBeNull();
    });

    it('should return null when gateway is undefined', () => {
      const service = new LoginService(mockStore, undefined);
      expect(service.getGateway()).toBeNull();
    });

    it('should return the same gateway instance on multiple calls', () => {
      const gateway1 = loginService.getGateway();
      const gateway2 = loginService.getGateway();

      expect(gateway1).toBe(gateway2);
      expect(gateway1).toBe(mockGateway);
    });
  });

  describe('login', () => {
    describe('gateway validation', () => {
      it('should return empty credential when gateway is null', async () => {
        const service = new LoginService(mockStore, null);

        const result = await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(result).toEqual({});
        expect(mockGateway.getLoginCallCount()).toBe(0);
      });

      it('should return empty credential when gateway is undefined', async () => {
        const service = new LoginService(mockStore, undefined);

        const result = await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        expect(result).toEqual({});
        expect(mockGateway.getLoginCallCount()).toBe(0);
      });

      it('should not update store state when gateway is null', async () => {
        const service = new LoginService(mockStore, null);

        await service.login({
          email: 'test@example.com',
          password: 'password'
        });

        const state = mockStore.getState();
        expect(state.loading).toBe(false);
        expect(state.result).toBeNull();
      });
    });

    describe('successful login', () => {
      it('should successfully login with email and password', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password123'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
        expect(mockGateway.getLoginCallCount()).toBe(1);
      });

      it('should successfully login with phone and password', async () => {
        const params: LoginParams = {
          phone: '13800138000',
          password: 'password123'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should successfully login with phone and code', async () => {
        const params: LoginParams = {
          phone: '13800138000',
          code: '123456'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(result.token).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should update store state to loading when login starts', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        const loginPromise = loginService.login(params);

        // Check state immediately after start
        const state = mockStore.getState();
        expect(state.loading).toBe(true);
        expect(state.status).toBe('pending');

        await loginPromise;
      });

      it('should update store state to success when login succeeds', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await loginService.login(params);

        const state = mockStore.getState();
        expect(state.loading).toBe(false);
        expect(state.error).toBeNull();
        expect(state.result).toBeDefined();
        expect(state.result?.token).toBeDefined();
        expect(state.status).toBe('success');
      });

      it('should return the credential from gateway', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(result.token).toContain('mock_token_');
        expect(result.refreshToken).toBe('mock_refresh_token');
      });
    });

    describe('failed login', () => {
      it('should handle login failure and update store state', async () => {
        const error = new Error('Invalid credentials');
        mockGateway.setShouldFail(true, error);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'wrong'
        };

        await expect(loginService.login(params)).rejects.toThrow(
          'Invalid credentials'
        );

        const state = mockStore.getState();
        expect(state.loading).toBe(false);
        expect(state.error).toBe(error);
        expect(state.status).toBe('failed');
      });

      it('should handle network error', async () => {
        const error = new Error('Network error');
        mockGateway.setShouldFail(true, error);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await expect(loginService.login(params)).rejects.toThrow(
          'Network error'
        );

        const state = mockStore.getState();
        expect(state.error).toBe(error);
        expect(state.status).toBe('failed');
      });

      it('should handle timeout error', async () => {
        const error = new Error('Request timeout');
        mockGateway.setShouldFail(true, error);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await expect(loginService.login(params)).rejects.toThrow(
          'Request timeout'
        );

        const state = mockStore.getState();
        expect(state.error).toBe(error);
        expect(state.status).toBe('failed');
      });

      it('should handle non-Error exceptions', async () => {
        mockGateway.setShouldFail(true, 'String error' as unknown);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await expect(loginService.login(params)).rejects.toBe('String error');

        const state = mockStore.getState();
        expect(state.error).toBe('String error');
        expect(state.status).toBe('failed');
      });

      it('should handle null error', async () => {
        mockGateway.setShouldFail(true, null as unknown);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await expect(loginService.login(params)).rejects.toBeNull();

        const state = mockStore.getState();
        expect(state.error).toBeNull();
        expect(state.status).toBe('failed');
      });

      it('should throw the same error that gateway throws', async () => {
        const customError = new TypeError('Custom error type');
        mockGateway.setShouldFail(true, customError);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await expect(loginService.login(params)).rejects.toThrow(
          'Custom error type'
        );
        await expect(loginService.login(params)).rejects.toBeInstanceOf(
          TypeError
        );
      });
    });

    describe('login parameters edge cases', () => {
      it('should handle empty params object', async () => {
        const params: LoginParams = {};

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with only email', async () => {
        const params: LoginParams = { email: 'test@example.com' };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with only phone', async () => {
        const params: LoginParams = { phone: '13800138000' };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with all fields', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password123',
          phone: '13800138000',
          code: '123456'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with empty string values', async () => {
        const params: LoginParams = {
          email: '',
          password: '',
          phone: '',
          code: ''
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with very long values', async () => {
        const longString = 'a'.repeat(10000);
        const params: LoginParams = {
          email: longString,
          password: longString
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with special characters', async () => {
        const params: LoginParams = {
          email: 'test+user@example.com',
          password: 'p@ssw0rd!#$%^&*()',
          phone: '+86-138-0013-8000',
          code: '123-456'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });

      it('should handle params with unicode characters', async () => {
        const params: LoginParams = {
          email: '测试@example.com',
          password: '密码123',
          phone: '13800138000',
          code: '验证码'
        };

        const result = await loginService.login(params);

        expect(result).toBeDefined();
        expect(mockGateway.getLastLoginParams()).toEqual(params);
      });
    });

    describe('concurrent login attempts', () => {
      it('should handle multiple concurrent login calls', async () => {
        const params1: LoginParams = {
          email: 'user1@example.com',
          password: 'pass1'
        };
        const params2: LoginParams = {
          email: 'user2@example.com',
          password: 'pass2'
        };

        const [result1, result2] = await Promise.all([
          loginService.login(params1),
          loginService.login(params2)
        ]);

        expect(result1).toBeDefined();
        expect(result2).toBeDefined();
        expect(mockGateway.getLoginCallCount()).toBe(2);
      });

      it('should handle rapid sequential login calls', async () => {
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        await loginService.login(params);
        await loginService.login(params);
        await loginService.login(params);

        expect(mockGateway.getLoginCallCount()).toBe(3);
      });
    });

    describe('async behavior', () => {
      it('should handle delayed gateway response', async () => {
        mockGateway.setDelay(100);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        const startTime = Date.now();
        await loginService.login(params);
        const endTime = Date.now();

        expect(endTime - startTime).toBeGreaterThanOrEqual(90); // Allow some margin
        const state = mockStore.getState();
        expect(state.status).toBe('success');
      });

      it('should properly sequence store state updates', async () => {
        mockGateway.setDelay(50);
        const params: LoginParams = {
          email: 'test@example.com',
          password: 'password'
        };

        const loginPromise = loginService.login(params);

        // Check loading state
        let state = mockStore.getState();
        expect(state.loading).toBe(true);
        expect(state.status).toBe('pending');

        await loginPromise;

        // Check success state
        state = mockStore.getState();
        expect(state.loading).toBe(false);
        expect(state.status).toBe('success');
      });
    });
  });

  describe('logout', () => {
    describe('logout with gateway', () => {
      it('should successfully logout when gateway is set', async () => {
        await loginService.logout();

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toBeUndefined();
      });

      it('should call gateway logout with parameters', async () => {
        const logoutParams = { revokeAll: true, redirectUrl: '/home' };

        await loginService.logout(logoutParams);

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toEqual(logoutParams);
      });

      it('should reset store state after successful logout', async () => {
        // First login to set some state
        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        let state = mockStore.getState();
        expect(state.result).not.toBeNull();

        // Then logout
        await loginService.logout();

        state = mockStore.getState();
        expect(state.result).toBeNull();
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should return gateway logout result', async () => {
        const mockResult = { success: true, message: 'Logged out' };
        const mockGatewayWithResult = {
          async login() {
            return { token: 'token' };
          },
          async logout() {
            return mockResult;
          }
        } as LoginInterface<LoginParams, TestCredential>;

        const service = new LoginService(mockStore, mockGatewayWithResult);
        const result = await service.logout<{}, typeof mockResult>();

        expect(result).toEqual(mockResult);
      });

      it('should handle logout with typed parameters and result', async () => {
        interface LogoutParams {
          revokeAll: boolean;
        }
        interface LogoutResult {
          success: boolean;
        }

        const mockGatewayWithTypedResult = {
          async login() {
            return { token: 'token' };
          },
          async logout<LP, LR>(_params?: LP): Promise<LR> {
            return { success: true } as LR;
          }
        } as LoginInterface<LoginParams, TestCredential>;

        const service = new LoginService(mockStore, mockGatewayWithTypedResult);
        const result = await service.logout<LogoutParams, LogoutResult>({
          revokeAll: true
        });

        expect(result).toEqual({ success: true });
      });
    });

    describe('logout without gateway', () => {
      it('should handle logout when gateway is null', async () => {
        const service = new LoginService(mockStore, null);

        const result = await service.logout();

        expect(result).toBeUndefined();
      });

      it('should handle logout when gateway is undefined', async () => {
        const service = new LoginService(mockStore, undefined);

        const result = await service.logout();

        expect(result).toBeUndefined();
      });

      it('should reset store state even without gateway', async () => {
        const service = new LoginService(mockStore, null);

        // First set some state manually
        mockStore.success({ token: 'test_token' });
        let state = mockStore.getState();
        expect(state.result).not.toBeNull();

        // Then logout
        await service.logout();

        state = mockStore.getState();
        expect(state.result).toBeNull();
        expect(state.error).toBeNull();
      });
    });

    describe('logout error handling', () => {
      it('should reset store state even when gateway logout fails', async () => {
        const error = new Error('Logout API failed');
        mockGateway.setShouldFail(true, error);

        // First login to set some state
        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        let state = mockStore.getState();
        expect(state.result).not.toBeNull();

        // Logout should fail but still reset local state
        await expect(loginService.logout()).rejects.toThrow(
          'Logout API failed'
        );

        state = mockStore.getState();
        expect(state.result).toBeNull();
        expect(state.error).toBeNull();
        expect(state.loading).toBe(false);
      });

      it('should reset store state even when gateway throws non-Error', async () => {
        mockGateway.setShouldFail(true, 'String error' as unknown);

        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        await expect(loginService.logout()).rejects.toBe('String error');

        const state = mockStore.getState();
        expect(state.result).toBeNull();
      });

      it('should reset store state even when gateway throws null', async () => {
        mockGateway.setShouldFail(true, null as unknown);

        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        await expect(loginService.logout()).rejects.toBeNull();

        const state = mockStore.getState();
        expect(state.result).toBeNull();
      });

      it('should always reset store state in finally block', async () => {
        const error = new Error('Network error');
        mockGateway.setShouldFail(true, error);

        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        try {
          await loginService.logout();
        } catch {
          // Expected to throw
        }

        const state = mockStore.getState();
        expect(state.result).toBeNull();
      });
    });

    describe('logout parameters edge cases', () => {
      it('should handle logout with null parameters', async () => {
        await loginService.logout(null);

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toBeNull();
      });

      it('should handle logout with empty object parameters', async () => {
        await loginService.logout({});

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toEqual({});
      });

      it('should handle logout with complex parameters', async () => {
        const complexParams = {
          revokeAll: true,
          redirectUrl: '/home',
          clearCache: true,
          reason: 'User requested logout'
        };

        await loginService.logout(complexParams);

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toEqual(complexParams);
      });

      it('should handle logout with nested parameters', async () => {
        const nestedParams = {
          options: {
            revokeAll: true,
            clearCache: true
          },
          metadata: {
            timestamp: Date.now(),
            source: 'web'
          }
        };

        await loginService.logout(nestedParams);

        expect(mockGateway.getLogoutCallCount()).toBe(1);
        expect(mockGateway.getLastLogoutParams()).toEqual(nestedParams);
      });
    });

    describe('concurrent logout attempts', () => {
      it('should handle multiple concurrent logout calls', async () => {
        await Promise.all([
          loginService.logout(),
          loginService.logout(),
          loginService.logout()
        ]);

        expect(mockGateway.getLogoutCallCount()).toBe(3);
      });

      it('should handle logout during login', async () => {
        mockGateway.setDelay(100);
        const loginPromise = loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        // Logout while login is in progress
        const logoutPromise = loginService.logout();

        await Promise.allSettled([loginPromise, logoutPromise]);

        // Store should be reset (logout always resets)
        const state = mockStore.getState();
        expect(state.result).toBeNull();
      });
    });

    describe('async behavior', () => {
      it('should handle delayed gateway logout response', async () => {
        mockGateway.setDelay(100);
        const startTime = Date.now();
        await loginService.logout();
        const endTime = Date.now();

        expect(endTime - startTime).toBeGreaterThanOrEqual(90);
      });

      it('should reset store state even if logout takes time', async () => {
        mockGateway.setDelay(100);
        await loginService.login({
          email: 'test@example.com',
          password: 'password'
        });

        const logoutPromise = loginService.logout();

        // Store should be reset after logout completes
        await logoutPromise;
        const state = mockStore.getState();
        expect(state.result).toBeNull();
      });
    });
  });

  describe('integration scenarios', () => {
    it('should handle login -> logout -> login flow', async () => {
      // First login
      const result1 = await loginService.login({
        email: 'user1@example.com',
        password: 'pass1'
      });
      expect(result1.token).toBeDefined();

      // Logout
      await loginService.logout();
      let state = mockStore.getState();
      expect(state.result).toBeNull();

      // Second login
      const result2 = await loginService.login({
        email: 'user2@example.com',
        password: 'pass2'
      });
      expect(result2.token).toBeDefined();
      state = mockStore.getState();
      expect(state.result).not.toBeNull();
    });

    it('should handle multiple login failures followed by success', async () => {
      // Fail first attempt
      mockGateway.setShouldFail(true, new Error('Invalid credentials'));
      await expect(
        loginService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow();

      // Fail second attempt
      await expect(
        loginService.login({ email: 'test@example.com', password: 'wrong2' })
      ).rejects.toThrow();

      // Succeed third attempt
      mockGateway.setShouldFail(false);
      const result = await loginService.login({
        email: 'test@example.com',
        password: 'correct'
      });
      expect(result.token).toBeDefined();

      const state = mockStore.getState();
      expect(state.status).toBe('success');
      expect(state.error).toBeNull();
    });

    it('should handle logout after failed login', async () => {
      mockGateway.setShouldFail(true, new Error('Login failed'));
      await expect(
        loginService.login({ email: 'test@example.com', password: 'wrong' })
      ).rejects.toThrow();

      // Logout should still work and reset state
      await loginService.logout();
      const state = mockStore.getState();
      expect(state.result).toBeNull();
      expect(state.error).toBeNull();
    });

    it('should maintain store state consistency across operations', async () => {
      // Initial state
      let state = mockStore.getState();
      expect(state.result).toBeNull();
      expect(state.loading).toBe(false);

      // Login
      await loginService.login({
        email: 'test@example.com',
        password: 'password'
      });
      state = mockStore.getState();
      expect(state.result).not.toBeNull();
      expect(state.loading).toBe(false);
      expect(state.status).toBe('success');

      // Logout
      await loginService.logout();
      state = mockStore.getState();
      expect(state.result).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle store methods throwing errors', async () => {
      const errorStore = {
        start: () => {
          throw new Error('Store start failed');
        },
        success: () => {
          throw new Error('Store success failed');
        },
        failed: () => {
          throw new Error('Store failed failed');
        },
        reset: () => {
          throw new Error('Store reset failed');
        },
        getState: () => ({
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        }),
        updateState: () => {},
        getStore: () => ({})
      } as unknown as AsyncStoreInterface<TestCredential, TestState>;

      const service = new LoginService(errorStore, mockGateway);

      // Login should propagate store error
      await expect(
        service.login({ email: 'test@example.com', password: 'password' })
      ).rejects.toThrow('Store start failed');
    });

    it('should handle gateway login returning null', async () => {
      const nullGateway = {
        async login() {
          return null as unknown as TestCredential;
        },
        async logout() {
          return undefined;
        }
      } as LoginInterface<LoginParams, TestCredential>;

      const service = new LoginService(mockStore, nullGateway);
      const result = await service.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result).toBeNull();
      const state = mockStore.getState();
      expect(state.result).toBeNull();
    });

    it('should handle gateway login returning undefined', async () => {
      const undefinedGateway = {
        async login() {
          return undefined as unknown as TestCredential;
        },
        async logout() {
          return undefined;
        }
      } as LoginInterface<LoginParams, TestCredential>;

      const service = new LoginService(mockStore, undefinedGateway);
      const result = await service.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result).toBeUndefined();
    });

    it('should handle very large credential objects', async () => {
      const largeCredential = {
        token: 'a'.repeat(100000),
        refreshToken: 'b'.repeat(100000),
        extra: { data: 'c'.repeat(100000) }
      };

      const largeGateway = {
        async login() {
          return largeCredential as unknown as TestCredential;
        },
        async logout() {
          return undefined;
        }
      } as LoginInterface<LoginParams, TestCredential>;

      const service = new LoginService(mockStore, largeGateway);
      const result = await service.login({
        email: 'test@example.com',
        password: 'password'
      });

      expect(result.token.length).toBe(100000);
      const state = mockStore.getState();
      expect(state.result?.token.length).toBe(100000);
    });
  });

  describe('type system tests', () => {
    describe('generic type parameters', () => {
      it('should accept custom Params type extending LoginParams', () => {
        interface CustomLoginParams extends LoginParams {
          rememberMe?: boolean;
          deviceId?: string;
        }

        const customGateway: LoginInterface<CustomLoginParams, TestCredential> =
          {
            async login(_params: CustomLoginParams) {
              return { token: 'token' };
            },
            async logout<_LP, LR>(): Promise<LR> {
              return undefined as LR;
            }
          };

        const service = new LoginService<
          CustomLoginParams,
          TestCredential,
          TestState
        >(mockStore, customGateway);

        expect(service).toBeInstanceOf(LoginService);
        expect(service.getGateway()).toBe(customGateway);
      });

      it('should accept custom Credential type extending LoginCredential', () => {
        interface CustomCredential extends LoginCredential {
          token: string;
          refreshToken: string;
          expiresIn: number;
          userRole: string;
        }

        const customGateway: LoginInterface<LoginParams, CustomCredential> = {
          async login() {
            return {
              token: 'token',
              refreshToken: 'refresh',
              expiresIn: 3600,
              userRole: 'admin'
            };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const customState: AsyncStateInterface<CustomCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const customStore: AsyncStoreInterface<
          CustomCredential,
          typeof customState
        > = {
          ...mockStore,
          getState: () => customState
        } as unknown as AsyncStoreInterface<
          CustomCredential,
          typeof customState
        >;

        const service = new LoginService<
          LoginParams,
          CustomCredential,
          typeof customState
        >(customStore, customGateway);

        expect(service).toBeInstanceOf(LoginService);
      });

      it('should accept custom State type extending AsyncStateInterface', () => {
        interface CustomState extends AsyncStateInterface<TestCredential> {
          lastLoginTime?: number;
          loginCount?: number;
        }

        const customStore: AsyncStoreInterface<TestCredential, CustomState> = {
          ...mockStore,
          getState: () => ({
            loading: false,
            result: null,
            error: null,
            startTime: 0,
            endTime: 0,
            lastLoginTime: Date.now(),
            loginCount: 0
          })
        } as unknown as AsyncStoreInterface<TestCredential, CustomState>;

        const service = new LoginService<
          LoginParams,
          TestCredential,
          CustomState
        >(customStore, mockGateway);

        expect(service).toBeInstanceOf(LoginService);
        expect(service.getStore()).toBe(customStore);
      });

      it('should work with minimal Params type (empty object)', () => {
        interface MinimalParams extends LoginParams {}

        const minimalGateway: LoginInterface<MinimalParams, TestCredential> = {
          async login() {
            return { token: 'token' };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const service = new LoginService<
          MinimalParams,
          TestCredential,
          TestState
        >(mockStore, minimalGateway);

        expect(service).toBeInstanceOf(LoginService);
      });

      it('should work with minimal Credential type (empty object)', () => {
        interface MinimalCredential extends LoginCredential {}

        const minimalGateway: LoginInterface<LoginParams, MinimalCredential> = {
          async login() {
            return {};
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const minimalState: AsyncStateInterface<MinimalCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const minimalStore: AsyncStoreInterface<
          MinimalCredential,
          typeof minimalState
        > = {
          ...mockStore,
          getState: () => minimalState
        } as unknown as AsyncStoreInterface<
          MinimalCredential,
          typeof minimalState
        >;

        const service = new LoginService<
          LoginParams,
          MinimalCredential,
          typeof minimalState
        >(minimalStore, minimalGateway);

        expect(service).toBeInstanceOf(LoginService);
      });
    });

    describe('type inference', () => {
      it('should infer types correctly from gateway', async () => {
        interface SpecificParams extends LoginParams {
          tenantId: string;
        }

        interface SpecificCredential extends LoginCredential {
          token: string;
          userId: string;
        }

        const specificGateway: LoginInterface<
          SpecificParams,
          SpecificCredential
        > = {
          async login(params: SpecificParams) {
            return {
              token: 'token',
              userId: params.tenantId
            };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const specificState: AsyncStateInterface<SpecificCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const specificStore: AsyncStoreInterface<
          SpecificCredential,
          typeof specificState
        > = {
          ...mockStore,
          getState: () => specificState
        } as unknown as AsyncStoreInterface<
          SpecificCredential,
          typeof specificState
        >;

        const service = new LoginService<
          SpecificParams,
          SpecificCredential,
          typeof specificState
        >(specificStore, specificGateway);

        const result = await service.login({ tenantId: 'tenant123' });

        // Type check: result should have token and userId
        expect(result.token).toBe('token');
        expect(result.userId).toBe('tenant123');
      });

      it('should preserve return type from login method', async () => {
        interface TypedCredential extends LoginCredential {
          token: string;
          expiresAt: number;
        }

        const typedGateway: LoginInterface<LoginParams, TypedCredential> = {
          async login() {
            return {
              token: 'token',
              expiresAt: Date.now() + 3600000
            };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const typedState: AsyncStateInterface<TypedCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const typedStore: AsyncStoreInterface<
          TypedCredential,
          typeof typedState
        > = {
          ...mockStore,
          getState: () => typedState
        } as unknown as AsyncStoreInterface<TypedCredential, typeof typedState>;

        const service = new LoginService<
          LoginParams,
          TypedCredential,
          typeof typedState
        >(typedStore, typedGateway);

        const result = await service.login({ email: 'test@example.com' });

        // Type check: result should have token and expiresAt
        expect(result.token).toBe('token');
        expect(typeof result.expiresAt).toBe('number');
      });
    });

    describe('logout type parameters', () => {
      it('should handle typed logout parameters', async () => {
        interface LogoutParams {
          revokeAll: boolean;
          redirectUrl?: string;
        }

        interface LogoutResult {
          success: boolean;
          message: string;
        }

        const typedGateway = {
          async login() {
            return { token: 'token' };
          },
          async logout<LP extends LogoutParams, LR extends LogoutResult>(
            params?: LP
          ): Promise<LR> {
            return {
              success: true,
              message: params?.revokeAll ? 'All sessions revoked' : 'Logged out'
            } as LR;
          }
        } as LoginInterface<LoginParams, TestCredential>;

        const service = new LoginService(mockStore, typedGateway);

        const result = await service.logout<LogoutParams, LogoutResult>({
          revokeAll: true,
          redirectUrl: '/home'
        });

        expect(result.success).toBe(true);
        expect(result.message).toBe('All sessions revoked');
      });

      it('should handle void logout result type', async () => {
        interface LogoutParams {
          clearCache: boolean;
        }

        const voidGateway = {
          async login() {
            return { token: 'token' };
          },
          async logout<LP extends LogoutParams, LR = void>(
            _params?: LP
          ): Promise<LR> {
            return undefined as LR;
          }
        } as LoginInterface<LoginParams, TestCredential>;

        const service = new LoginService(mockStore, voidGateway);

        const result = await service.logout<LogoutParams, void>({
          clearCache: true
        });

        expect(result).toBeUndefined();
      });

      it('should handle complex logout result type', async () => {
        interface LogoutParams {
          reason: string;
        }

        interface LogoutResult {
          status: 'success' | 'partial' | 'failed';
          revokedSessions: number;
          errors?: string[];
        }

        const complexGateway = {
          async login() {
            return { token: 'token' };
          },
          async logout<LP extends LogoutParams, LR extends LogoutResult>(
            _params?: LP
          ): Promise<LR> {
            return {
              status: 'success',
              revokedSessions: 3,
              errors: []
            } as unknown as LR;
          }
        } as LoginInterface<LoginParams, TestCredential>;

        const service = new LoginService(mockStore, complexGateway);

        const result = await service.logout<LogoutParams, LogoutResult>({
          reason: 'User requested'
        });

        expect(result.status).toBe('success');
        expect(result.revokedSessions).toBe(3);
        expect(result.errors).toEqual([]);
      });
    });

    describe('type constraints', () => {
      it('should enforce Params extends LoginParams constraint', () => {
        // This test verifies TypeScript type checking
        // In actual usage, TypeScript would prevent invalid types

        interface ValidParams extends LoginParams {
          customField: string;
        }

        const validGateway: LoginInterface<ValidParams, TestCredential> = {
          async login(_params: ValidParams) {
            return { token: 'token' };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const service = new LoginService<
          ValidParams,
          TestCredential,
          TestState
        >(mockStore, validGateway);

        expect(service).toBeInstanceOf(LoginService);
      });

      it('should enforce Credential extends LoginCredential constraint', () => {
        interface ValidCredential extends LoginCredential {
          token: string;
          customField: number;
        }

        const validGateway: LoginInterface<LoginParams, ValidCredential> = {
          async login() {
            return { token: 'token', customField: 123 };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const validState: AsyncStateInterface<ValidCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const validStore: AsyncStoreInterface<
          ValidCredential,
          typeof validState
        > = {
          ...mockStore,
          getState: () => validState
        } as unknown as AsyncStoreInterface<ValidCredential, typeof validState>;

        const service = new LoginService<
          LoginParams,
          ValidCredential,
          typeof validState
        >(validStore, validGateway);

        expect(service).toBeInstanceOf(LoginService);
      });

      it('should enforce State extends AsyncStateInterface constraint', () => {
        interface ValidState extends AsyncStateInterface<TestCredential> {
          customStatus: string;
        }

        const validStore: AsyncStoreInterface<TestCredential, ValidState> = {
          ...mockStore,
          getState: () => ({
            loading: false,
            result: null,
            error: null,
            startTime: 0,
            endTime: 0,
            customStatus: 'active'
          })
        } as unknown as AsyncStoreInterface<TestCredential, ValidState>;

        const service = new LoginService<
          LoginParams,
          TestCredential,
          ValidState
        >(validStore, mockGateway);

        expect(service).toBeInstanceOf(LoginService);
      });
    });

    describe('type compatibility', () => {
      it('should handle compatible gateway and store types', async () => {
        interface CompatibleParams extends LoginParams {
          sessionId: string;
        }

        interface CompatibleCredential extends LoginCredential {
          token: string;
          sessionId: string;
        }

        const compatibleGateway: LoginInterface<
          CompatibleParams,
          CompatibleCredential
        > = {
          async login(params: CompatibleParams) {
            return {
              token: 'token',
              sessionId: params.sessionId
            };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const compatibleState: AsyncStateInterface<CompatibleCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const compatibleStore: AsyncStoreInterface<
          CompatibleCredential,
          typeof compatibleState
        > = {
          ...mockStore,
          getState: () => compatibleState
        } as unknown as AsyncStoreInterface<
          CompatibleCredential,
          typeof compatibleState
        >;

        const service = new LoginService<
          CompatibleParams,
          CompatibleCredential,
          typeof compatibleState
        >(compatibleStore, compatibleGateway);

        const result = await service.login({ sessionId: 'session123' });

        expect(result.token).toBe('token');
        expect(result.sessionId).toBe('session123');
      });

      it('should maintain type safety across method calls', async () => {
        interface TypedParams extends LoginParams {
          accountType: 'premium' | 'basic';
        }

        interface TypedCredential extends LoginCredential {
          token: string;
          accountType: 'premium' | 'basic';
          features: string[];
        }

        const typedGateway: LoginInterface<TypedParams, TypedCredential> = {
          async login(params: TypedParams) {
            return {
              token: 'token',
              accountType: params.accountType,
              features:
                params.accountType === 'premium'
                  ? ['feature1', 'feature2']
                  : ['feature1']
            };
          },
          async logout<_LP, LR>(): Promise<LR> {
            return undefined as LR;
          }
        };

        const typedState: AsyncStateInterface<TypedCredential> = {
          loading: false,
          result: null,
          error: null,
          startTime: 0,
          endTime: 0
        };

        const typedStore: AsyncStoreInterface<
          TypedCredential,
          typeof typedState
        > = {
          ...mockStore,
          getState: () => typedState
        } as unknown as AsyncStoreInterface<TypedCredential, typeof typedState>;

        const service = new LoginService<
          TypedParams,
          TypedCredential,
          typeof typedState
        >(typedStore, typedGateway);

        const result = await service.login({ accountType: 'premium' });

        // Type check: accountType should be 'premium' | 'basic'
        expect(result.accountType).toBe('premium');
        expect(result.features).toContain('feature1');
        expect(result.features).toContain('feature2');
      });
    });

    describe('default type parameters', () => {
      it('should use default State type when not specified', () => {
        const service = new LoginService<LoginParams, TestCredential>(
          mockStore,
          mockGateway
        );

        expect(service).toBeInstanceOf(LoginService);
        expect(service.getStore()).toBe(mockStore);
      });

      it('should work with default gateway parameter (null)', () => {
        const service = new LoginService<
          LoginParams,
          TestCredential,
          TestState
        >(mockStore);

        expect(service).toBeInstanceOf(LoginService);
        expect(service.getGateway()).toBeNull();
      });
    });
  });
});
