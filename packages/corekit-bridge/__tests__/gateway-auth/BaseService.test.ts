/**
 * BaseService test suite
 *
 * Coverage:
 * 1. constructor       – Constructor tests with various configurations
 * 2. getStore          – Store instance retrieval tests
 * 3. getGateway        – Gateway instance retrieval tests
 * 4. getLogger         – Logger instance retrieval tests
 * 5. serviceName       – Service name property tests
 * 6. edge cases        – Error handling and boundary tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BaseService } from '../../src/core/gateway-auth/impl/BaseService';
import {
  AsyncStore,
  AsyncStoreStateInterface
} from '../../src/core/store-state';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';
import { SyncStorageInterface } from '@qlover/fe-corekit';

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
  public context<Value>(value?: Value): LogContext<Value> {
    return new LogContext<Value>(value);
  }
}

interface TestUserState extends AsyncStoreStateInterface<TestUser> {}

/**
 * Concrete implementation of BaseService for testing
 */
class TestBaseService extends BaseService<
  TestUser,
  AsyncStore<TestUserState, string>,
  MockGateway
> {
  constructor(options?: {
    serviceName?: string | symbol;
    gateway?: MockGateway;
    logger?: LoggerInterface;
    defaultState?: <State extends AsyncStoreStateInterface<TestUser>>(
      storage?: SyncStorageInterface<string, unknown> | null,
      storageKey?: string | null
    ) => State | null;
  }) {
    super({
      serviceName: options?.serviceName ?? 'TestService',
      gateway: options?.gateway as MockGateway &
        Record<string, (...args: unknown[]) => Promise<unknown>>,
      logger: options?.logger,
      defaultState: options?.defaultState ?? (() => null),
      store: undefined
    });
  }
}

describe('BaseService', () => {
  let mockGateway: MockGateway;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGateway = new MockGateway();
    mockLogger = new MockLogger();
  });

  describe('constructor', () => {
    it('should create service with service name', () => {
      const service = new TestBaseService({
        serviceName: 'MyService'
      });
      expect(service.serviceName).toBe('MyService');
    });

    it('should create service with symbol as service name', () => {
      const symbolName = Symbol('TestService');
      const service = new TestBaseService({
        serviceName: symbolName
      });
      expect(service.serviceName).toBe(symbolName);
    });

    it('should create service with gateway', () => {
      const service = new TestBaseService({
        gateway: mockGateway
      });
      expect(service.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const service = new TestBaseService();
      expect(service.getGateway()).toBeUndefined();
    });

    it('should create service with logger', () => {
      const service = new TestBaseService({
        logger: mockLogger
      });
      expect(service.getLogger()).toBe(mockLogger);
    });

    it('should create service without logger', () => {
      const service = new TestBaseService();
      expect(service.getLogger()).toBeUndefined();
    });

    it('should create store instance', () => {
      const service = new TestBaseService();
      const store = service.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });

    it('should create store with default state', () => {
      const service = new TestBaseService();
      const store = service.getStore();
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('result');
      expect(state).toHaveProperty('error');
      expect(state).toHaveProperty('status');
    });

    it('should create service with all options', () => {
      const service = new TestBaseService({
        serviceName: 'FullService',
        gateway: mockGateway,
        logger: mockLogger
      });
      expect(service.serviceName).toBe('FullService');
      expect(service.getGateway()).toBe(mockGateway);
      expect(service.getLogger()).toBe(mockLogger);
      expect(service.getStore()).toBeDefined();
    });
  });

  describe('getStore', () => {
    it('should return the store instance', () => {
      const service = new TestBaseService();
      const store = service.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });

    it('should return the same store instance', () => {
      const service = new TestBaseService();
      const store1 = service.getStore();
      const store2 = service.getStore();
      expect(store1).toBe(store2);
    });

    it('should allow accessing store state', () => {
      const service = new TestBaseService();
      const store = service.getStore();
      const state = store.getState();
      expect(state).toBeDefined();
      expect(state).toHaveProperty('loading');
      expect(state).toHaveProperty('result');
      expect(state).toHaveProperty('error');
    });

    it('should allow modifying store state', () => {
      const service = new TestBaseService();
      const store = service.getStore();
      const testUser: TestUser = {
        id: 1,
        name: 'Test',
        email: 'test@example.com'
      };
      store.success(testUser);
      expect(store.getResult()).toEqual(testUser);
    });
  });

  describe('getGateway', () => {
    it('should return gateway when configured', () => {
      const service = new TestBaseService({
        gateway: mockGateway
      });
      const gateway = service.getGateway();
      expect(gateway).toBe(mockGateway);
    });

    it('should return undefined when gateway is not configured', () => {
      const service = new TestBaseService();
      expect(service.getGateway()).toBeUndefined();
    });

    it('should allow calling gateway methods', async () => {
      const service = new TestBaseService({
        gateway: mockGateway
      });
      const gateway = service.getGateway();
      if (gateway) {
        const user = await gateway.getUser({ id: 1 });
        expect(user).toEqual({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        });
      }
    });
  });

  describe('getLogger', () => {
    it('should return logger when configured', () => {
      const service = new TestBaseService({
        logger: mockLogger
      });
      const logger = service.getLogger();
      expect(logger).toBe(mockLogger);
    });

    it('should return undefined when logger is not configured', () => {
      const service = new TestBaseService();
      expect(service.getLogger()).toBeUndefined();
    });

    it('should allow using logger methods', () => {
      const service = new TestBaseService({
        logger: mockLogger
      });
      const logger = service.getLogger();
      if (logger) {
        logger.info('Test message');
        expect(mockLogger.info).toHaveBeenCalledWith('Test message');
      }
    });
  });

  describe('serviceName', () => {
    it('should be readonly (TypeScript compile-time check)', () => {
      const service = new TestBaseService({
        serviceName: 'TestService'
      });
      // readonly is a TypeScript compile-time feature, not runtime
      // TypeScript will show an error if you try to reassign: service.serviceName = 'NewName'
      // But at runtime, JavaScript doesn't prevent property reassignment
      // This test verifies the property exists and has the correct value
      expect(service.serviceName).toBe('TestService');
      // Note: Actual readonly enforcement happens at compile time via TypeScript
    });

    it('should support string names', () => {
      const service = new TestBaseService({
        serviceName: 'StringService'
      });
      expect(typeof service.serviceName).toBe('string');
      expect(service.serviceName).toBe('StringService');
    });

    it('should support symbol names', () => {
      const symbolName = Symbol('SymbolService');
      const service = new TestBaseService({
        serviceName: symbolName
      });
      expect(typeof service.serviceName).toBe('symbol');
      expect(service.serviceName).toBe(symbolName);
    });
  });

  describe('edge cases', () => {
    it('should handle service with minimal configuration', () => {
      const service = new TestBaseService({
        serviceName: 'MinimalService'
      });
      expect(service.serviceName).toBe('MinimalService');
      expect(service.getGateway()).toBeUndefined();
      expect(service.getLogger()).toBeUndefined();
      expect(service.getStore()).toBeDefined();
    });

    it('should handle multiple service instances independently', () => {
      const service1 = new TestBaseService({
        serviceName: 'Service1',
        gateway: mockGateway
      });
      const service2 = new TestBaseService({
        serviceName: 'Service2'
      });

      expect(service1.serviceName).toBe('Service1');
      expect(service2.serviceName).toBe('Service2');
      expect(service1.getGateway()).toBe(mockGateway);
      expect(service2.getGateway()).toBeUndefined();
      expect(service1.getStore()).not.toBe(service2.getStore());
    });

    it('should handle store operations independently', () => {
      const service1 = new TestBaseService();
      const service2 = new TestBaseService();

      const user1: TestUser = {
        id: 1,
        name: 'User1',
        email: 'user1@example.com'
      };
      const user2: TestUser = {
        id: 2,
        name: 'User2',
        email: 'user2@example.com'
      };

      service1.getStore().success(user1);
      service2.getStore().success(user2);

      expect(service1.getStore().getResult()).toEqual(user1);
      expect(service2.getStore().getResult()).toEqual(user2);
    });
  });
});
