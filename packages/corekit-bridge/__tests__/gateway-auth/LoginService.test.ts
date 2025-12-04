import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LoginService } from '../../src/core/gateway-auth/impl/LoginService';
import { AsyncStore } from '../../src/core/store-state';
import type {
  LoginInterface,
  LoginParams
} from '../../src/core/gateway-auth/interface/LoginInterface';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import { ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

interface TestCredential {
  token: string;
  refreshToken: string;
  expiresIn: number;
}

class MockLoginGateway implements LoginInterface<TestCredential> {
  login = vi.fn<() => Promise<TestCredential | null>>();
  logout = vi.fn();
}

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

describe('LoginService', () => {
  let loginService: LoginService<TestCredential>;
  let mockGateway: MockLoginGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockLoginGateway();
    mockLogger = new MockLogger();
    loginService = new LoginService<TestCredential>('LoginService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null
    });
    loginService.use(
      new GatewayBasePlguin<
        unknown,
        TestCredential,
        LoginInterface<TestCredential>
      >()
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      const service = new LoginService<TestCredential>('TestLoginService', {
        defaultState: () => null
      });
      expect(service.serviceName).toBe('TestLoginService');
    });

    it('should create service with gateway', () => {
      const service = new LoginService<TestCredential>('TestLoginService', {
        gateway: mockGateway,
        defaultState: () => null
      });
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const service = new LoginService<TestCredential>('TestLoginService', {
        defaultState: () => null
      });
      expect(service.getGateway()).toBeNull();
    });

    it('should create store instance', () => {
      const store = loginService.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });
  });

  describe('getCredential', () => {
    it('should return null when no credential', () => {
      const credential = loginService.getCredential();
      expect(credential).toBeNull();
    });

    it('should return credential from store', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      const credential = loginService.getCredential();
      expect(credential).toEqual(testCredential);
    });

    it('should return null after logout', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.logout.mockResolvedValue(undefined);

      await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(loginService.getCredential()).toEqual(testCredential);

      await loginService.logout();

      expect(loginService.getCredential()).toBeNull();
    });
  });

  describe('login', () => {
    it('should login with email and password', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      const params: LoginParams = {
        email: 'user@example.com',
        password: 'password123'
      };

      const result = await loginService.login(params);

      expect(mockGateway.login).toHaveBeenCalledTimes(1);
      expect(mockGateway.login).toHaveBeenCalledWith(params);
      expect(result).toEqual(testCredential);
      expect(loginService.getCredential()).toEqual(testCredential);
    });

    it('should login with phone and password', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      const params: LoginParams = {
        phone: '13800138000',
        password: 'password123'
      };

      const result = await loginService.login(params);

      expect(mockGateway.login).toHaveBeenCalledWith(params);
      expect(result).toEqual(testCredential);
    });

    it('should login with phone and code', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      const params: LoginParams = {
        phone: '13800138000',
        code: '123456'
      };

      const result = await loginService.login(params);

      expect(mockGateway.login).toHaveBeenCalledWith(params);
      expect(result).toEqual(testCredential);
    });

    it('should update store state during login', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      const store = loginService.getStore();

      expect(store.getLoading()).toBe(false);

      const promise = loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      await Promise.resolve();
      expect(store.getLoading()).toBe(true);

      await promise;
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(testCredential);
    });

    it('should handle login failure', async () => {
      const error = new Error('Invalid credentials');
      mockGateway.login.mockRejectedValue(error);

      await expect(
        loginService.login({
          email: 'user@example.com',
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials');

      const store = loginService.getStore();
      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
    });

    it('should throw error when gateway returns null', async () => {
      mockGateway.login.mockResolvedValue(null);

      await expect(
        loginService.login({
          email: 'user@example.com',
          password: 'password123'
        })
      ).rejects.toThrow(ExecutorError);
    });

    it('should trigger plugin hooks', async () => {
      const onLoginBeforeHook = vi.fn();
      const onLoginSuccessHook = vi.fn();

      loginService.use({
        pluginName: 'TestPlugin',
        onLoginBefore: onLoginBeforeHook,
        onLoginSuccess: onLoginSuccessHook
      } as unknown as Parameters<typeof loginService.use>[0]);

      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);

      await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(onLoginBeforeHook).toHaveBeenCalled();
      expect(onLoginSuccessHook).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockGateway.logout.mockResolvedValue(undefined);

      await loginService.logout();

      expect(mockGateway.logout).toHaveBeenCalledTimes(1);
      expect(mockGateway.logout).toHaveBeenCalledWith(undefined);
    });

    it('should logout with parameters', async () => {
      const logoutParams = { revokeAll: true };
      mockGateway.logout.mockResolvedValue(undefined);

      await loginService.logout(logoutParams);

      expect(mockGateway.logout).toHaveBeenCalledWith(logoutParams);
    });

    it('should reset store state after logout', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.logout.mockResolvedValue(undefined);

      await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      const store = loginService.getStore();
      expect(store.getResult()).toEqual(testCredential);

      await loginService.logout();

      expect(store.getResult()).toBeNull();
      expect(store.getError()).toBeNull();
      expect(store.getLoading()).toBe(false);
    });

    it('should reset store even if gateway logout fails', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      const logoutError = new Error('Logout API failed');
      mockGateway.logout.mockRejectedValue(logoutError);

      await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      const store = loginService.getStore();
      expect(store.getResult()).toEqual(testCredential);

      await expect(loginService.logout()).rejects.toThrow('Logout API failed');

      // Store should still be reset for security
      expect(store.getResult()).toBeNull();
      expect(store.getError()).toBeNull();
      expect(store.getLoading()).toBe(false);
    });

    it('should handle logout without gateway', async () => {
      const serviceWithoutGateway = new LoginService<TestCredential>(
        'LoginService',
        {
          defaultState: () => null
        }
      );
      serviceWithoutGateway.use(
        new GatewayBasePlguin<
          unknown,
          TestCredential,
          LoginInterface<TestCredential>
        >()
      );

      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      // Manually set credential in store
      const store = serviceWithoutGateway.getStore();
      store.success(testCredential);

      await serviceWithoutGateway.logout();

      // Store should be reset
      expect(store.getResult()).toBeNull();
    });

    it('should return logout result from gateway', async () => {
      const logoutResult = {
        success: true,
        message: 'Logged out successfully'
      };
      mockGateway.logout.mockResolvedValue(logoutResult);

      const result = await loginService.logout<unknown, typeof logoutResult>();

      expect(result).toEqual(logoutResult);
    });

    it('should return undefined when no gateway', async () => {
      const serviceWithoutGateway = new LoginService<TestCredential>(
        'LoginService',
        {
          defaultState: () => null
        }
      );
      serviceWithoutGateway.use(
        new GatewayBasePlguin<
          unknown,
          TestCredential,
          LoginInterface<TestCredential>
        >()
      );

      const result = await serviceWithoutGateway.logout();

      expect(result).toBeUndefined();
    });
  });

  describe('integration', () => {
    it('should handle complete login and logout flow', async () => {
      const testCredential: TestCredential = {
        token: 'test-token-123',
        refreshToken: 'refresh-token-456',
        expiresIn: 3600
      };

      mockGateway.login.mockResolvedValue(testCredential);
      mockGateway.logout.mockResolvedValue(undefined);

      // Login
      const loginResult = await loginService.login({
        email: 'user@example.com',
        password: 'password123'
      });

      expect(loginResult).toEqual(testCredential);
      expect(loginService.getCredential()).toEqual(testCredential);

      const store = loginService.getStore();
      expect(store.getResult()).toEqual(testCredential);
      expect(store.isSuccess()).toBe(true);

      // Logout
      await loginService.logout();

      expect(loginService.getCredential()).toBeNull();
      expect(store.getResult()).toBeNull();
      expect(store.isSuccess()).toBe(false);
    });

    it('should handle multiple login attempts', async () => {
      const credential1: TestCredential = {
        token: 'token-1',
        refreshToken: 'refresh-1',
        expiresIn: 3600
      };

      const credential2: TestCredential = {
        token: 'token-2',
        refreshToken: 'refresh-2',
        expiresIn: 3600
      };

      mockGateway.login
        .mockResolvedValueOnce(credential1)
        .mockResolvedValueOnce(credential2);

      const result1 = await loginService.login({
        email: 'user1@example.com',
        password: 'password1'
      });

      expect(result1).toEqual(credential1);
      expect(loginService.getCredential()).toEqual(credential1);

      const result2 = await loginService.login({
        email: 'user2@example.com',
        password: 'password2'
      });

      expect(result2).toEqual(credential2);
      expect(loginService.getCredential()).toEqual(credential2);
    });
  });
});
