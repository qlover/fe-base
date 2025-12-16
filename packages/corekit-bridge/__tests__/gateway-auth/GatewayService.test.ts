/**
 * GatewayService test suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests with various configurations
 * 2. getStore          – Store instance retrieval tests
 * 3. getGateway        – Gateway instance retrieval tests
 * 4. use               – Plugin registration tests
 * 5. execute           – Gateway action execution tests
 * 6. createDefaultFn   – Default function creation tests
 * 7. edge cases        – Error handling and boundary tests
 * 8. integration       – Complete execution flow tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GatewayService,
  GatewayServiceOptions
} from '../../src/core/gateway-auth/impl/GatewayService';
import { AsyncStore, AsyncStoreState } from '../../src/core/store-state';
import {
  GatewayExecutor,
  GatewayExecutorOptions
} from '../../src/core/gateway-auth/impl/GatewayExecutor';
import {
  ExecutorPlugin,
  ExecutorError,
  ExecutorContext
} from '@qlover/fe-corekit';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

/**
 * Test data type
 */
interface TestUser {
  id: number;
  name: string;
  email: string;
}

/**
 * Mock gateway implementation for testing
 */
class MockGateway {
  public async getUser(params: { id: number }): Promise<TestUser> {
    return {
      id: params.id,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }

  public async getUsers(): Promise<TestUser[]> {
    return [
      { id: 1, name: 'John', email: 'john@example.com' },
      { id: 2, name: 'Jane', email: 'jane@example.com' }
    ];
  }

  public async createUser(params: {
    name: string;
    email: string;
  }): Promise<TestUser> {
    return {
      id: Date.now(),
      name: params.name,
      email: params.email
    };
  }
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

interface TestUserState extends AsyncStoreState<TestUser> {}

/**
 * Concrete implementation of GatewayService for testing
 */
class TestGatewayService extends GatewayService<
  TestUser,
  MockGateway,
  AsyncStore<TestUserState, string>
> {
  constructor(
    serviceName: string | symbol,
    options?: Omit<
      GatewayServiceOptions<TestUser, MockGateway, string>,
      'serviceName' | 'actionName'
    >
  ) {
    super({
      serviceName,
      ...options
    });
  }

  /**
   * @override
   */
  public async getUser(id: number): Promise<TestUser | null> {
    return this.execute('getUser', { id });
  }

  /**
   * @override
   */
  public async getUsers(): Promise<TestUser[] | null> {
    return this.execute('getUsers', {});
  }

  /**
   * @override
   */
  public async createUser(params: {
    name: string;
    email: string;
  }): Promise<TestUser | null> {
    return this.execute('createUser', params);
  }

  /**
   * @override
   */
  public async customAction(_params: unknown): Promise<unknown> {
    return this.execute('getUser', _params, async () => {
      return { id: 999, name: 'Custom', email: 'custom@example.com' };
    });
  }
}

describe('GatewayService', () => {
  let service: TestGatewayService;
  let mockGateway: MockGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockGateway();
    mockLogger = new MockLogger();
    service = new TestGatewayService('TestService', {
      gateway: mockGateway,
      logger: mockLogger,
      defaultState: () => null,
      executor: new GatewayExecutor<TestUser, MockGateway>()
    });
    // Register GatewayBasePlugin for automatic state management
    service.use(new GatewayBasePlguin<unknown, TestUser, MockGateway>());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      expect(service.serviceName).toBe('TestService');
    });

    it('should create service with gateway', () => {
      const serviceWithGateway = new TestGatewayService('TestService', {
        gateway: mockGateway,
        defaultState: () => null
      });
      expect(serviceWithGateway.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const serviceWithoutGateway = new TestGatewayService('TestService', {
        defaultState: () => null
      });
      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });

    it('should create service with logger', () => {
      const serviceWithLogger = new TestGatewayService('TestService', {
        logger: mockLogger,
        defaultState: () => null
      });
      expect(serviceWithLogger.getGateway()).toBeUndefined();
    });

    it('should create store instance', () => {
      const store = service.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });
  });

  describe('getStore', () => {
    it('should return the store instance', () => {
      const store = service.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });

    it('should return the same store instance', () => {
      const store1 = service.getStore();
      const store2 = service.getStore();
      expect(store1).toBe(store2);
    });

    it('should allow accessing store state', () => {
      const store = service.getStore();
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('result');
      expect(state).toHaveProperty('error');
    });
  });

  describe('getGateway', () => {
    it('should return gateway when configured', () => {
      const gateway = service.getGateway();
      expect(gateway).toBe(mockGateway);
    });

    it('should return undefined when gateway is not configured', () => {
      const serviceWithoutGateway = new TestGatewayService('TestService');
      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });
  });

  describe('use', () => {
    it('should register a single plugin', () => {
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'TestPlugin',
        onBefore: vi.fn()
      };

      const result = service.use(plugin);
      expect(result).toBe(service);
    });

    it('should register multiple plugins', () => {
      const plugin1: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'Plugin1',
        onBefore: vi.fn()
      };
      const plugin2: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'Plugin2',
        onSuccess: vi.fn()
      };

      const result = service.use([plugin1, plugin2]);
      expect(result).toBe(service);
    });

    it('should allow method chaining', () => {
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'TestPlugin',
        onBefore: vi.fn()
      };

      service.use(plugin).use(plugin);
      // Should not throw
    });
  });

  describe('execute', () => {
    describe('Pattern 1: execute(action) - no parameters', () => {
      it('should execute gateway method without parameters', async () => {
        const noParamsGateway = {
          async getUsers(): Promise<TestUser[]> {
            return [
              { id: 1, name: 'John', email: 'john@example.com' },
              { id: 2, name: 'Jane', email: 'jane@example.com' }
            ];
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: noParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute('getUsers');
        expect(result).toEqual([
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' }
        ]);
      });

      it('should handle action without gateway method', async () => {
        const testService = new TestGatewayService('TestService', {
          defaultState: () => null
        });
        // Without executor, should return null
        const result = await testService.execute('nonExistentMethod');
        expect(result).toBeNull();
      });
    });

    describe('Pattern 2: execute(action, params) - single parameter', () => {
      it('should execute gateway method with single parameter', async () => {
        const user = await service.execute('getUser', { id: 1 });
        expect(user).toEqual({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        });
      });

      it('should handle object parameter', async () => {
        const createParams = { name: 'New User', email: 'new@example.com' };
        const result = await service.execute('createUser', createParams);
        expect(result).toBeDefined();
        expect(result).toHaveProperty('name', 'New User');
        expect(result).toHaveProperty('email', 'new@example.com');
      });

      it('should handle primitive parameter', async () => {
        const primitiveGateway = {
          async getUserById(id: number): Promise<TestUser> {
            return { id, name: 'User', email: 'user@example.com' };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: primitiveGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute('getUserById', 123);
        expect(result).toEqual({
          id: 123,
          name: 'User',
          email: 'user@example.com'
        });
      });
    });

    describe('Pattern 3: execute(action, ...params) - multiple parameters', () => {
      it('should execute gateway method with multiple parameters', async () => {
        const multiParamsGateway = {
          async createUserWithRole(
            name: string,
            email: string,
            role: string
          ): Promise<TestUser & { role: string }> {
            return {
              id: Date.now(),
              name,
              email,
              role
            };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: multiParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute(
          'createUserWithRole',
          'John Doe',
          'john@example.com',
          'admin'
        );
        expect(result).toHaveProperty('name', 'John Doe');
        expect(result).toHaveProperty('email', 'john@example.com');
        expect(result).toHaveProperty('role', 'admin');
      });

      it('should handle multiple parameters with different types', async () => {
        const mixedParamsGateway = {
          async updateUser(
            id: number,
            updates: Partial<TestUser>
          ): Promise<TestUser> {
            return {
              id,
              name: updates.name ?? 'Updated',
              email: updates.email ?? 'updated@example.com'
            };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: mixedParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute(
          'updateUser',
          1,
          { name: 'Updated Name' },
          true
        );
        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('name', 'Updated Name');
      });
    });

    describe('Pattern 4: execute(action, fn) - custom function', () => {
      it('should execute with custom function', async () => {
        const result = await service.execute('getUser', () => {
          return Promise.resolve({
            id: 999,
            name: 'Custom',
            email: 'custom@example.com'
          } as TestUser);
        });
        expect(result).toEqual({
          id: 999,
          name: 'Custom',
          email: 'custom@example.com'
        });
      });

      it('should pass gateway to custom function', async () => {
        const customFn = vi.fn(async (gateway: MockGateway | null) => {
          if (gateway) {
            return await gateway.getUser({ id: 1 });
          }
          return null;
        });

        await service.execute('getUser', customFn);
        expect(customFn).toHaveBeenCalledWith(mockGateway);
      });

      it('should handle null gateway in custom function', async () => {
        const serviceWithoutGateway = new TestGatewayService('TestService', {
          defaultState: () => null
        });

        const result = await serviceWithoutGateway.execute(
          'getUser',
          (gateway: MockGateway | null) => {
            expect(gateway).toBeNull();
            return Promise.resolve({
              id: 0,
              name: 'No Gateway',
              email: 'no@example.com'
            } as TestUser);
          }
        );
        expect(result).toEqual({
          id: 0,
          name: 'No Gateway',
          email: 'no@example.com'
        });
      });

      it('should allow custom function to call multiple gateway methods', async () => {
        const multiCallGateway: MockGateway = {
          async getUser(params: { id: number }): Promise<TestUser> {
            return { id: params.id, name: 'User', email: 'user@example.com' };
          },
          async getUsers(): Promise<TestUser[]> {
            return [{ id: 1, name: 'User1', email: 'user1@example.com' }];
          }
        } as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: multiCallGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute('getUser', async (gateway) => {
          if (!gateway) return null;
          const user = await gateway.getUser({ id: 1 });
          const users = await gateway.getUsers();
          return { ...user, relatedUsers: users };
        });

        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('relatedUsers');
      });
    });

    describe('Pattern 1.5: execute(action, params, fn) - custom function with params', () => {
      it('should execute with custom function and params', async () => {
        const result = await service.execute('getUser', { id: 1 }, async () => {
          return {
            id: 999,
            name: 'Custom with Params',
            email: 'custom@example.com'
          } as TestUser;
        });
        expect(result).toEqual({
          id: 999,
          name: 'Custom with Params',
          email: 'custom@example.com'
        });
      });

      it('should pass gateway to custom function when params provided', async () => {
        const customFn = vi.fn(async (gateway: MockGateway | null) => {
          if (gateway) {
            return await gateway.getUser({ id: 1 });
          }
          return null;
        });

        await service.execute('getUser', { id: 1 }, customFn);
        expect(customFn).toHaveBeenCalledWith(mockGateway);
      });

      it('should use params but execute custom function instead of gateway method', async () => {
        const gatewayMethodSpy = vi.spyOn(mockGateway, 'getUser');
        const customFn = vi.fn(async () => {
          return {
            id: 888,
            name: 'Custom Execution',
            email: 'custom@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', { id: 1 }, customFn);

        // Custom function should be called
        expect(customFn).toHaveBeenCalled();
        // Gateway method should NOT be called
        expect(gatewayMethodSpy).not.toHaveBeenCalled();
        // Result should be from custom function
        expect(result).toEqual({
          id: 888,
          name: 'Custom Execution',
          email: 'custom@example.com'
        });
      });

      it('should handle null gateway in custom function with params', async () => {
        const serviceWithoutGateway = new TestGatewayService('TestService', {
          defaultState: () => null
        });

        const result = await serviceWithoutGateway.execute(
          'getUser',
          { id: 1 },
          (gateway: MockGateway | null) => {
            expect(gateway).toBeNull();
            return Promise.resolve({
              id: 0,
              name: 'No Gateway With Params',
              email: 'no@example.com'
            } as TestUser);
          }
        );
        expect(result).toEqual({
          id: 0,
          name: 'No Gateway With Params',
          email: 'no@example.com'
        });
      });

      it('should allow custom function to use params and gateway', async () => {
        const customFn = vi.fn(
          async (gateway: MockGateway | null): Promise<TestUser> => {
            if (gateway) {
              // Use gateway but modify result
              const user = await gateway.getUser({ id: 1 });
              return {
                ...user,
                name: 'Modified Name'
              };
            }
            return {
              id: 0,
              name: 'No Gateway',
              email: 'no@example.com'
            };
          }
        );

        const result = await service.execute('getUser', { id: 1 }, customFn);
        expect(customFn).toHaveBeenCalledWith(mockGateway);
        expect(result).toEqual({
          id: 1,
          name: 'Modified Name',
          email: 'john@example.com'
        });
      });

      it('should work with TestGatewayService.customAction method', async () => {
        const result = await service.customAction({ id: 1 });
        expect(result).toEqual({
          id: 999,
          name: 'Custom',
          email: 'custom@example.com'
        });
      });

      it('should handle primitive params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 777,
            name: 'Primitive Params',
            email: 'primitive@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', 123, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 777,
          name: 'Primitive Params',
          email: 'primitive@example.com'
        });
      });

      it('should handle object params with custom function', async () => {
        const params = { id: 1, extra: 'data' };
        const customFn = vi.fn(async () => {
          return {
            id: 666,
            name: 'Object Params',
            email: 'object@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', params, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 666,
          name: 'Object Params',
          email: 'object@example.com'
        });
      });

      it('should handle array params with custom function', async () => {
        const params = [1, 2, 3];
        const customFn = vi.fn(async () => {
          return {
            id: 555,
            name: 'Array Params',
            email: 'array@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', params, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 555,
          name: 'Array Params',
          email: 'array@example.com'
        });
      });

      it('should execute custom function without executor', async () => {
        const serviceWithoutExecutor = new TestGatewayService('TestService', {
          gateway: mockGateway,
          defaultState: () => null
        });

        const result = await serviceWithoutExecutor.execute(
          'getUser',
          { id: 1 },
          (_gateway: MockGateway | null) => {
            return Promise.resolve({
              id: 999,
              name: 'Direct With Params',
              email: 'direct@example.com'
            } as TestUser);
          }
        );
        expect(result).toEqual({
          id: 999,
          name: 'Direct With Params',
          email: 'direct@example.com'
        });
      });
    });

    describe('Pattern distinction - ensure correct pattern detection', () => {
      it('should distinguish execute(action, params, fn) from execute(action, ...params)', async () => {
        // This should be treated as execute(action, params, fn) not execute(action, ...params)
        const customFn = vi.fn(async () => {
          return { id: 999, name: 'Custom', email: 'custom@example.com' };
        });

        const result = await service.execute('getUser', { id: 1 }, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 999,
          name: 'Custom',
          email: 'custom@example.com'
        });
      });

      it('should distinguish execute(action, fn) from execute(action, params, fn)', async () => {
        // When second param is function, should use Pattern 4
        const fn1 = vi.fn(async () => {
          return { id: 111, name: 'Pattern 4', email: 'pattern4@example.com' };
        });

        // When third param is function, should use Pattern 1.5
        const fn2 = vi.fn(async () => {
          return {
            id: 222,
            name: 'Pattern 1.5',
            email: 'pattern1.5@example.com'
          };
        });

        const result1 = await service.execute('getUser', fn1);
        expect(result1).toEqual({
          id: 111,
          name: 'Pattern 4',
          email: 'pattern4@example.com'
        });

        const result2 = await service.execute('getUser', { id: 1 }, fn2);
        expect(result2).toEqual({
          id: 222,
          name: 'Pattern 1.5',
          email: 'pattern1.5@example.com'
        });
      });

      it('should handle execute(action, params1, params2) as multiple params when last is not function', async () => {
        const multiParamsGateway = {
          async createUser(name: string, email: string): Promise<TestUser> {
            return {
              id: Date.now(),
              name,
              email
            };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: multiParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        // This should be treated as execute(action, ...params) not execute(action, params, fn)
        const result = await testService.execute(
          'createUser',
          'John',
          'john@example.com'
        );

        expect(result).toHaveProperty('name', 'John');
        expect(result).toHaveProperty('email', 'john@example.com');
      });

      it('should handle execute(action, params, nonFunction) as multiple params', async () => {
        const multiParamsGateway = {
          async updateUser(
            id: number,
            name: string,
            active: boolean
          ): Promise<TestUser & { active: boolean }> {
            return {
              id,
              name,
              email: 'test@example.com',
              active
            };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: multiParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        // This should be treated as execute(action, ...params) because last param is not a function
        const result = await testService.execute('updateUser', 1, 'John', true);

        expect(result).toHaveProperty('id', 1);
        expect(result).toHaveProperty('name', 'John');
        expect(result).toHaveProperty('active', true);
      });
    });

    describe('execute without executor', () => {
      it('should execute directly without executor', async () => {
        const serviceWithoutExecutor = new TestGatewayService('TestService', {
          gateway: mockGateway,
          defaultState: () => null
          // No executor provided
        });

        const result = await serviceWithoutExecutor.execute('getUser', {
          id: 1
        });
        expect(result).toEqual({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        });
      });

      it('should execute custom function without executor', async () => {
        const serviceWithoutExecutor = new TestGatewayService('TestService', {
          gateway: mockGateway,
          defaultState: () => null
        });

        const result = await serviceWithoutExecutor.execute(
          'getUser',
          (_gateway: MockGateway | null) => {
            return Promise.resolve({
              id: 999,
              name: 'Direct',
              email: 'direct@example.com'
            } as TestUser);
          }
        );
        expect(result).toEqual({
          id: 999,
          name: 'Direct',
          email: 'direct@example.com'
        });
      });
    });

    describe('execute with store state updates', () => {
      it('should update store state during execution', async () => {
        const store = service.getStore();
        expect(store.getLoading()).toBe(false);

        const promise = service.execute('getUser', { id: 1 });
        // Wait for async execution to start and GatewayBasePlugin.onBefore to be called
        await Promise.resolve();
        expect(store.getLoading()).toBe(true);

        await promise;
        expect(store.getLoading()).toBe(false);
        expect(store.getResult()).toEqual({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        });
      });

      it('should handle errors and update store state', async () => {
        const errorGateway = {
          async getUser(): Promise<TestUser> {
            throw new Error('Gateway error');
          }
        } as unknown as MockGateway;

        const errorService = new TestGatewayService('TestService', {
          gateway: errorGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        errorService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        await expect(
          errorService.execute('getUser', { id: 1 })
        ).rejects.toThrow('Gateway error');

        const store = errorService.getStore();
        expect(store.getLoading()).toBe(false);
        expect(store.getError()).toBeDefined();
      });
    });

    describe('execute edge cases', () => {
      it('should handle gateway method that returns array', async () => {
        const users = await service.execute('getUsers', {});
        expect(users).toEqual([
          { id: 1, name: 'John', email: 'john@example.com' },
          { id: 2, name: 'Jane', email: 'jane@example.com' }
        ]);
      });

      it('should return null when gateway method does not exist', async () => {
        const serviceWithoutGateway = new TestGatewayService('TestService', {
          defaultState: () => null
        });
        const result = await serviceWithoutGateway.execute('nonExistentMethod');
        expect(result).toBeNull();
      });

      it('should preserve gateway this context', async () => {
        class GatewayWithThis {
          private value = 'test-value';

          public async getValue(): Promise<string> {
            return this.value;
          }
        }

        const gatewayWithThis = new GatewayWithThis();
        const testService = new TestGatewayService('TestService', {
          gateway: gatewayWithThis as unknown as MockGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );

        const result = await testService.execute('getValue');
        expect(result).toBe('test-value');
      });

      it('should handle undefined params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 999,
            name: 'Undefined Params',
            email: 'undefined@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', undefined, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 999,
          name: 'Undefined Params',
          email: 'undefined@example.com'
        });
      });

      it('should handle null params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 888,
            name: 'Null Params',
            email: 'null@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', null, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 888,
          name: 'Null Params',
          email: 'null@example.com'
        });
      });

      it('should handle empty object params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 777,
            name: 'Empty Object',
            email: 'empty@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', {}, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 777,
          name: 'Empty Object',
          email: 'empty@example.com'
        });
      });

      it('should handle empty array params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 666,
            name: 'Empty Array',
            email: 'empty@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', [], customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 666,
          name: 'Empty Array',
          email: 'empty@example.com'
        });
      });

      it('should handle string params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 555,
            name: 'String Params',
            email: 'string@example.com'
          } as TestUser;
        });

        const result = await service.execute(
          'getUser',
          'test-string',
          customFn
        );
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 555,
          name: 'String Params',
          email: 'string@example.com'
        });
      });

      it('should handle boolean params with custom function', async () => {
        const customFn = vi.fn(async () => {
          return {
            id: 444,
            name: 'Boolean Params',
            email: 'boolean@example.com'
          } as TestUser;
        });

        const result = await service.execute('getUser', true, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 444,
          name: 'Boolean Params',
          email: 'boolean@example.com'
        });
      });

      it('should correctly identify function when second param is object with call property', async () => {
        // An object with a 'call' property might be mistaken for a function
        const objWithCall = { call: 'not a function', other: 'property' };
        const customFn = vi.fn(async () => {
          return {
            id: 333,
            name: 'Object With Call',
            email: 'object@example.com'
          } as TestUser;
        });

        // Should still recognize customFn as function, not objWithCall
        const result = await service.execute('getUser', objWithCall, customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 333,
          name: 'Object With Call',
          email: 'object@example.com'
        });
      });

      it('should correctly identify function as last param even with extra params', async () => {
        // Edge case: When more than 3 params are passed and last is a function,
        // it should be treated as custom function (runtime behavior, not type-safe)
        const customFn = vi.fn(async () => {
          return {
            id: 222,
            name: 'Last Param Function',
            email: 'last@example.com'
          } as TestUser;
        });

        // Runtime: execute(action, param1, param2, fn)
        // Should recognize last param as function and use it
        // Note: This is a runtime edge case, type system only allows execute(action, params, fn)
        const result = await (
          service.execute as unknown as (
            action: string,
            ...args: unknown[]
          ) => Promise<TestUser>
        )('getUser', { id: 1 }, 'extra', customFn);
        expect(customFn).toHaveBeenCalled();
        expect(result).toEqual({
          id: 222,
          name: 'Last Param Function',
          email: 'last@example.com'
        });
      });

      it('should handle execute(action, fn) when fn is arrow function', async () => {
        const arrowFn = async () => {
          return {
            id: 111,
            name: 'Arrow Function',
            email: 'arrow@example.com'
          } as TestUser;
        };

        const result = await service.execute('getUser', arrowFn);
        expect(result).toEqual({
          id: 111,
          name: 'Arrow Function',
          email: 'arrow@example.com'
        });
      });

      it('should handle execute(action, params, fn) when fn is arrow function', async () => {
        const arrowFn = async () => {
          return {
            id: 100,
            name: 'Arrow Function With Params',
            email: 'arrow@example.com'
          } as TestUser;
        };

        const result = await service.execute('getUser', { id: 1 }, arrowFn);
        expect(result).toEqual({
          id: 100,
          name: 'Arrow Function With Params',
          email: 'arrow@example.com'
        });
      });

      it('should handle execute(action, params, fn) when fn is named function', async () => {
        async function namedFunction() {
          return {
            id: 99,
            name: 'Named Function',
            email: 'named@example.com'
          } as TestUser;
        }

        const result = await service.execute(
          'getUser',
          { id: 1 },
          namedFunction
        );
        expect(result).toEqual({
          id: 99,
          name: 'Named Function',
          email: 'named@example.com'
        });
      });
    });
  });

  describe('integration with GatewayBasePlugin', () => {
    it('should use GatewayBasePlugin by default', async () => {
      const user = await service.getUser(1);
      expect(user).toBeDefined();

      const store = service.getStore();
      expect(store.getResult()).toEqual(user);
      expect(store.getLoading()).toBe(false);
    });

    it('should log success events when logger is provided', async () => {
      await service.getUser(1);
      expect(mockLogger.debug).toHaveBeenCalled();
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('TestService: getUser - success'),
        expect.any(Object)
      );
    });

    it('should throw error when result is null', async () => {
      const nullGateway = {
        async getUser(): Promise<TestUser | null> {
          return null;
        }
      } as unknown as MockGateway;

      const nullService = new TestGatewayService('TestService', {
        gateway: nullGateway,
        logger: mockLogger,
        defaultState: () => null,
        executor: new GatewayExecutor<TestUser, MockGateway>()
      });
      // Register GatewayBasePlugin to enable null result validation
      nullService.use(new GatewayBasePlguin<unknown, TestUser, MockGateway>());

      await expect(nullService.getUser(1)).rejects.toThrow(ExecutorError);
    });
  });

  describe('plugin hooks', () => {
    describe('general hooks', () => {
      it('should call onBefore hook', async () => {
        const onBeforeHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: onBeforeHook
        };

        service.use(plugin);
        await service.getUser(1);

        expect(onBeforeHook).toHaveBeenCalled();
        expect(onBeforeHook).toHaveBeenCalledWith(
          expect.objectContaining({
            parameters: expect.objectContaining({
              actionName: 'getUser',
              serviceName: 'TestService'
            })
          })
        );
      });

      it('should call onSuccess hook', async () => {
        const onSuccessHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onSuccess: onSuccessHook
        };

        service.use(plugin);
        await service.getUser(1);

        expect(onSuccessHook).toHaveBeenCalled();
        const callArgs = onSuccessHook.mock.calls[0][0];
        expect(callArgs).toHaveProperty('returnValue');
        expect(callArgs).toHaveProperty('parameters');
      });

      it('should call onError hook when error occurs', async () => {
        const onErrorHook = vi.fn();
        const errorGateway = {
          async getUser(): Promise<TestUser> {
            throw new Error('Test error');
          }
        } as unknown as MockGateway;

        const errorService = new TestGatewayService('TestService', {
          gateway: errorGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });

        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onError: onErrorHook
        };

        errorService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );
        errorService.use(plugin);

        await expect(errorService.getUser(1)).rejects.toThrow('Test error');
        expect(onErrorHook).toHaveBeenCalled();
      });

      it('should call hooks in correct order', async () => {
        const callOrder: string[] = [];
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'OrderPlugin',
          onBefore: async () => {
            callOrder.push('onBefore');
          },
          onSuccess: async () => {
            callOrder.push('onSuccess');
          }
        };

        service.use(plugin);
        await service.getUser(1);

        expect(callOrder).toContain('onBefore');
        expect(callOrder).toContain('onSuccess');
        expect(callOrder.indexOf('onBefore')).toBeLessThan(
          callOrder.indexOf('onSuccess')
        );
      });
    });

    describe('action-specific hooks', () => {
      it('should call action-specific before hook', async () => {
        const onGetUserBeforeHook = vi.fn();
        const plugin = {
          pluginName: 'TestPlugin',
          onGetUserBefore: onGetUserBeforeHook
        } as ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > & {
          onGetUserBefore?: (
            context: ExecutorContext<
              GatewayExecutorOptions<TestUser, MockGateway, unknown>
            >
          ) => Promise<void> | void;
        };

        service.use(plugin);
        await service.getUser(1);

        expect(onGetUserBeforeHook).toHaveBeenCalled();
        const callArgs = onGetUserBeforeHook.mock.calls[0][0];
        expect(callArgs.parameters.actionName).toBe('getUser');
      });

      it('should call action-specific success hook', async () => {
        const onGetUserSuccessHook = vi.fn();
        const plugin = {
          pluginName: 'TestPlugin',
          onGetUserSuccess: onGetUserSuccessHook
        } as ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > & {
          onGetUserSuccess?: (
            context: ExecutorContext<
              GatewayExecutorOptions<TestUser, MockGateway, unknown>
            >
          ) => Promise<void> | void;
        };

        service.use(plugin);
        await service.getUser(1);

        expect(onGetUserSuccessHook).toHaveBeenCalled();
      });

      it('should call action-specific hooks for different actions', async () => {
        const onGetUserBeforeHook = vi.fn();
        const onCreateUserBeforeHook = vi.fn();
        const plugin = {
          pluginName: 'TestPlugin',
          onGetUserBefore: onGetUserBeforeHook,
          onCreateUserBefore: onCreateUserBeforeHook
        } as ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > & {
          onGetUserBefore?: (
            context: ExecutorContext<
              GatewayExecutorOptions<TestUser, MockGateway, unknown>
            >
          ) => Promise<void> | void;
          onCreateUserBefore?: (
            context: ExecutorContext<
              GatewayExecutorOptions<TestUser, MockGateway, unknown>
            >
          ) => Promise<void> | void;
        };

        service.use(plugin);
        await service.getUser(1);
        await service.createUser({ name: 'Test', email: 'test@example.com' });

        expect(onGetUserBeforeHook).toHaveBeenCalledTimes(1);
        expect(onCreateUserBeforeHook).toHaveBeenCalledTimes(1);
      });
    });

    describe('plugin registration', () => {
      it('should register multiple plugins', async () => {
        const plugin1Hook = vi.fn();
        const plugin2Hook = vi.fn();
        const plugin1: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'Plugin1',
          onBefore: plugin1Hook
        };
        const plugin2: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'Plugin2',
          onBefore: plugin2Hook
        };

        service.use([plugin1, plugin2]);
        await service.getUser(1);

        expect(plugin1Hook).toHaveBeenCalled();
        expect(plugin2Hook).toHaveBeenCalled();
      });

      it('should allow method chaining', () => {
        const plugin1: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'Plugin1',
          onBefore: vi.fn()
        };
        const plugin2: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'Plugin2',
          onBefore: vi.fn()
        };

        const result = service.use(plugin1).use(plugin2);
        expect(result).toBe(service);
      });

      it('should throw error when executor is not set', () => {
        const serviceWithoutExecutor = new TestGatewayService('TestService', {
          gateway: mockGateway,
          defaultState: () => null
          // No executor provided
        });

        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: vi.fn()
        };

        expect(() => {
          serviceWithoutExecutor.use(plugin);
        }).toThrow('TestService Executor is not set');
      });
    });

    describe('plugin with execute patterns', () => {
      it('should call hooks for execute(action)', async () => {
        const onBeforeHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: onBeforeHook
        };

        const noParamsGateway = {
          async getUsers(): Promise<TestUser[]> {
            return [];
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: noParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );
        testService.use(plugin);

        await testService.execute('getUsers');
        expect(onBeforeHook).toHaveBeenCalled();
      });

      it('should call hooks for execute(action, params)', async () => {
        const onBeforeHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: onBeforeHook
        };

        service.use(plugin);
        await service.execute('getUser', { id: 1 });
        expect(onBeforeHook).toHaveBeenCalled();
      });

      it('should call hooks for execute(action, ...params)', async () => {
        const onBeforeHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: onBeforeHook
        };

        const multiParamsGateway = {
          async createUser(name: string, email: string): Promise<TestUser> {
            return { id: 1, name, email };
          }
        } as unknown as MockGateway;

        const testService = new TestGatewayService('TestService', {
          gateway: multiParamsGateway,
          defaultState: () => null,
          executor: new GatewayExecutor<TestUser, MockGateway>()
        });
        testService.use(
          new GatewayBasePlguin<unknown, TestUser, MockGateway>()
        );
        testService.use(plugin);

        await testService.execute('createUser', 'John', 'john@example.com');
        expect(onBeforeHook).toHaveBeenCalled();
      });

      it('should call hooks for execute(action, fn)', async () => {
        const onBeforeHook = vi.fn();
        const plugin: ExecutorPlugin<
          GatewayExecutorOptions<TestUser, MockGateway, unknown>
        > = {
          pluginName: 'TestPlugin',
          onBefore: onBeforeHook
        };

        service.use(plugin);
        await service.execute('getUser', async () => {
          return { id: 1, name: 'Test', email: 'test@example.com' };
        });
        expect(onBeforeHook).toHaveBeenCalled();
      });
    });
  });

  describe('edge cases', () => {
    it('should handle concurrent executions', async () => {
      const promises = [
        service.getUser(1),
        service.getUser(2),
        service.getUser(3)
      ];

      const results = await Promise.all(promises);
      expect(results).toHaveLength(3);
      expect(results[0]).toBeDefined();
      expect(results[1]).toBeDefined();
      expect(results[2]).toBeDefined();
    });

    it('should handle service without base plugin', async () => {
      const serviceWithoutPlugin = new TestGatewayService('TestService', {
        gateway: mockGateway,
        defaultState: () => null,
        executor: new GatewayExecutor<TestUser, MockGateway>()
      });

      // Remove base plugin
      const executor = serviceWithoutPlugin.getExecutor();
      if (executor) {
        (executor as unknown as { plugins: unknown[] }).plugins = [];
      }

      const result = await serviceWithoutPlugin.getUser(1);
      expect(result).toBeDefined();
    });
  });
});
