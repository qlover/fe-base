import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RegisterService } from '../../src/core/gateway-auth/impl/RegisterService';
import { AsyncStore } from '../../src/core/store-state';
import type { RegisterInterface } from '../../src/core/gateway-auth/interface/RegisterInterface';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import { ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

interface TestUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface RegisterParams {
  email?: string;
  phone?: string;
  password: string;
  code?: string;
}

class MockRegisterGateway implements RegisterInterface<TestUser> {
  register = vi.fn<() => Promise<TestUser | null>>();
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

describe('RegisterService', () => {
  let registerService: RegisterService<TestUser>;
  let mockGateway: MockRegisterGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockRegisterGateway();
    mockLogger = new MockLogger();
    registerService = new RegisterService<TestUser>('RegisterService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null
    });
    registerService.use(
      new GatewayBasePlguin<unknown, TestUser, RegisterInterface<TestUser>>()
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      const service = new RegisterService<TestUser>('TestRegisterService', {
        defaultState: () => null
      });
      expect(service.serviceName).toBe('TestRegisterService');
    });

    it('should create service with gateway', () => {
      const service = new RegisterService<TestUser>('TestRegisterService', {
        gateway: mockGateway,
        defaultState: () => null
      });
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const service = new RegisterService<TestUser>('TestRegisterService', {
        defaultState: () => null
      });
      expect(service.getGateway()).toBeNull();
    });

    it('should create store instance', () => {
      const store = registerService.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });
  });

  describe('getUser', () => {
    it('should return null when no user', () => {
      const user = registerService.getUser();
      expect(user).toBeNull();
    });

    it('should return user from store', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      await registerService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      const user = registerService.getUser();
      expect(user).toEqual(testUser);
    });

    it('should return null after failed registration', async () => {
      const error = new Error('Registration failed');
      mockGateway.register.mockRejectedValue(error);

      await expect(
        registerService.register({
          email: 'john@example.com',
          password: 'password123',
          code: '123456'
        })
      ).rejects.toThrow('Registration failed');

      const user = registerService.getUser();
      // When failed, result may be undefined or null
      expect(user === null || user === undefined).toBe(true);
    });
  });

  describe('register', () => {
    it('should register with email and password', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const params: RegisterParams = {
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      };

      const result = await registerService.register(params);

      expect(mockGateway.register).toHaveBeenCalledTimes(1);
      expect(mockGateway.register).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
      expect(registerService.getUser()).toEqual(testUser);
    });

    it('should register with phone and password', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        phone: '13800138000'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const params: RegisterParams = {
        phone: '13800138000',
        password: 'password123',
        code: '123456'
      };

      const result = await registerService.register(params);

      expect(mockGateway.register).toHaveBeenCalledWith(params);
      expect(result).toEqual(testUser);
    });

    it('should update store state during registration', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);
      const store = registerService.getStore();

      expect(store.getLoading()).toBe(false);

      const promise = registerService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      await Promise.resolve();
      expect(store.getLoading()).toBe(true);

      await promise;
      expect(store.getLoading()).toBe(false);
      expect(store.getResult()).toEqual(testUser);
    });

    it('should handle registration failure', async () => {
      const error = new Error('Email already exists');
      mockGateway.register.mockRejectedValue(error);

      await expect(
        registerService.register({
          email: 'existing@example.com',
          password: 'password123',
          code: '123456'
        })
      ).rejects.toThrow('Email already exists');

      const store = registerService.getStore();
      expect(store.getLoading()).toBe(false);
      expect(store.getError()).toBe(error);
      // When failed, result may be undefined or null
      const result = registerService.getUser();
      expect(result === null || result === undefined).toBe(true);
    });

    it('should throw error when gateway returns null', async () => {
      mockGateway.register.mockResolvedValue(null);

      await expect(
        registerService.register({
          email: 'john@example.com',
          password: 'password123',
          code: '123456'
        })
      ).rejects.toThrow(ExecutorError);
    });

    it('should trigger plugin hooks', async () => {
      const onRegisterBeforeHook = vi.fn();
      const onRegisterSuccessHook = vi.fn();

      registerService.use({
        pluginName: 'TestPlugin',
        onRegisterBefore: onRegisterBeforeHook,
        onRegisterSuccess: onRegisterSuccessHook
      } as unknown as Parameters<typeof registerService.use>[0]);

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      await registerService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      expect(onRegisterBeforeHook).toHaveBeenCalled();
      expect(onRegisterSuccessHook).toHaveBeenCalled();
    });

    it('should handle custom register parameters', async () => {
      interface CustomParams extends RegisterParams {
        nickname?: string;
        age?: number;
      }

      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const customParams: CustomParams = {
        email: 'john@example.com',
        password: 'password123',
        code: '123456',
        nickname: 'Johnny',
        age: 25
      };

      const result = await registerService.register(customParams);

      expect(mockGateway.register).toHaveBeenCalledWith(customParams);
      expect(result).toEqual(testUser);
    });
  });

  describe('integration', () => {
    it('should handle complete registration flow', async () => {
      const testUser: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      mockGateway.register.mockResolvedValue(testUser);

      const result = await registerService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      expect(result).toEqual(testUser);
      expect(registerService.getUser()).toEqual(testUser);

      const store = registerService.getStore();
      expect(store.getResult()).toEqual(testUser);
      expect(store.isSuccess()).toBe(true);
    });

    it('should handle multiple registration attempts', async () => {
      const user1: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const user2: TestUser = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com'
      };

      mockGateway.register
        .mockResolvedValueOnce(user1)
        .mockResolvedValueOnce(user2);

      const result1 = await registerService.register({
        email: 'john@example.com',
        password: 'password123',
        code: '123456'
      });

      expect(result1).toEqual(user1);
      expect(registerService.getUser()).toEqual(user1);

      const result2 = await registerService.register({
        email: 'jane@example.com',
        password: 'password456',
        code: '654321'
      });

      expect(result2).toEqual(user2);
      expect(registerService.getUser()).toEqual(user2);
    });

    it('should handle registration with different parameter types', async () => {
      const emailUser: TestUser = {
        id: 1,
        name: 'Email User',
        email: 'email@example.com'
      };

      const phoneUser: TestUser = {
        id: 2,
        name: 'Phone User',
        phone: '13800138000'
      };

      mockGateway.register
        .mockResolvedValueOnce(emailUser)
        .mockResolvedValueOnce(phoneUser);

      const emailResult = await registerService.register({
        email: 'email@example.com',
        password: 'password123',
        code: '123456'
      });

      expect(emailResult).toEqual(emailUser);

      const phoneResult = await registerService.register({
        phone: '13800138000',
        password: 'password456',
        code: '654321'
      });

      expect(phoneResult).toEqual(phoneUser);
    });
  });
});
