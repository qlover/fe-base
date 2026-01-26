/**
 * GatewayService test suite
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
import { GatewayService } from '../../src/core/gateway-service/impl/GatewayService';
import {
  AsyncStore,
  type AsyncStoreStateInterface
} from '../../src/core/store-state';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

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

/**
 * Mock storage implementation for testing
 */
class MockStorage<Key = string> implements SyncStorageInterface<Key> {
  public data = new Map<string, unknown>();

  public get length(): number {
    return this.data.size;
  }

  public setItem<T>(key: Key, value: T): T {
    this.data.set(String(key), value);
    return value;
  }

  public getItem<T>(key: Key): T | null {
    const value = this.data.get(String(key));
    return (value ?? null) as T | null;
  }

  public removeItem(key: Key): void {
    this.data.delete(String(key));
  }

  public clear(): void {
    this.data.clear();
  }

  public reset(): void {
    this.data.clear();
  }
}

describe('GatewayService', () => {
  let service: GatewayService<
    TestUser,
    AsyncStore<AsyncStoreStateInterface<TestUser>, string>,
    MockGateway
  >;
  let mockGateway: MockGateway;
  let mockLogger: MockLogger;
  let mockStorage: MockStorage<string>;

  beforeEach(() => {
    mockGateway = new MockGateway();
    mockLogger = new MockLogger();
    mockStorage = new MockStorage<string>();

    service = new GatewayService<
      TestUser,
      AsyncStore<AsyncStoreStateInterface<TestUser>, string>,
      MockGateway
    >({
      serviceName: 'TestService',
      gateway: mockGateway,
      logger: mockLogger
    });
  });

  // Helper method to access the serviceName since it's readonly in the interface
  class TestableGatewayService extends GatewayService<
    TestUser,
    AsyncStore<AsyncStoreStateInterface<TestUser>, string>,
    MockGateway
  > {
    public getServiceName(): string | symbol {
      return this.serviceName;
    }
  }

  describe('serviceName', () => {
    it('should return the configured service name', () => {
      const service = new TestableGatewayService({
        serviceName: 'TestService'
      });
      expect(service.getServiceName()).toBe('TestService');
    });

    it('should work with symbol service name', () => {
      const symbolName = Symbol('uniqueService');
      const serviceWithSymbol = new TestableGatewayService({
        serviceName: symbolName
      });
      expect(serviceWithSymbol.getServiceName()).toBe(symbolName);
    });
  });

  describe('constructor', () => {
    it('should create service with gateway', () => {
      const serviceWithGateway = new GatewayService({
        serviceName: 'TestService',
        gateway: mockGateway
      });
      expect(serviceWithGateway.getGateway()).toBe(mockGateway);
    });

    it('should create service without gateway', () => {
      const serviceWithoutGateway = new GatewayService({
        serviceName: 'TestService'
      });
      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });

    it('should throw error with invalid service name', () => {
      expect(() => {
        new GatewayService({
          // @ts-expect-error Testing invalid service name
          serviceName: null
        });
      }).toThrow('Invalid service name');

      expect(() => {
        new GatewayService({
          // @ts-expect-error Testing invalid service name
          serviceName: undefined
        });
      }).toThrow('Invalid service name');
    });

    it('should create service with logger', () => {
      const serviceWithLogger = new GatewayService({
        serviceName: 'TestService',
        logger: mockLogger
      });
      expect(serviceWithLogger.getLogger()).toBe(mockLogger);
    });

    it('should create service without logger', () => {
      const serviceWithoutLogger = new GatewayService({
        serviceName: 'TestService'
      });
      expect(serviceWithoutLogger.getLogger()).toBeUndefined();
    });

    it('should create store instance', () => {
      const store = service.getStore();
      expect(store).toBeDefined();
      expect(store).toBeInstanceOf(AsyncStore);
    });

    it('should create service with store instance', () => {
      const customStore = new AsyncStore<
        AsyncStoreStateInterface<TestUser>,
        string
      >();
      const serviceWithStore = new GatewayService({
        serviceName: 'TestService',
        store: customStore
      });
      expect(serviceWithStore.getStore()).toBe(customStore);
    });

    it('should create service with store options', () => {
      const serviceWithStoreOptions = new GatewayService<
        TestUser,
        AsyncStore<AsyncStoreStateInterface<TestUser>, string>,
        MockGateway
      >({
        serviceName: 'TestService',
        storage: mockStorage,
        storageKey: 'test-key'
      });
      const store = serviceWithStoreOptions.getStore();
      expect(store).toBeDefined();
      // Verify store was created with storage configuration
      expect(store.getStorage()).toBeDefined();
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
      const serviceWithoutGateway = new GatewayService({
        serviceName: 'TestService'
      });
      expect(serviceWithoutGateway.getGateway()).toBeUndefined();
    });

    it('should allow calling gateway methods', async () => {
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
      const logger = service.getLogger();
      expect(logger).toBe(mockLogger);
    });

    it('should return undefined when logger is not configured', () => {
      const serviceWithoutLogger = new GatewayService({
        serviceName: 'TestService'
      });
      expect(serviceWithoutLogger.getLogger()).toBeUndefined();
    });

    it('should allow calling logger methods', () => {
      const logger = service.getLogger();
      if (logger) {
        logger.info('Test message');
        expect(mockLogger.info).toHaveBeenCalledWith('Test message');
      }
    });
  });

  describe('integration', () => {
    it('should work with all components together', async () => {
      const fullService = new GatewayService<
        TestUser,
        AsyncStore<AsyncStoreStateInterface<TestUser>, string>,
        MockGateway
      >({
        serviceName: 'FullService',
        gateway: mockGateway,
        logger: mockLogger,
        storage: mockStorage,
        storageKey: 'test-key'
      });

      // Verify all components are accessible
      expect(fullService.serviceName).toBe('FullService');
      expect(fullService.getStore()).toBeDefined();
      expect(fullService.getGateway()).toBe(mockGateway);
      expect(fullService.getLogger()).toBe(mockLogger);

      // Verify gateway works
      const gateway = fullService.getGateway();
      if (gateway) {
        const user = await gateway.getUser({ id: 1 });
        expect(user).toBeDefined();
      }

      // Verify logger works
      const logger = fullService.getLogger();
      if (logger) {
        logger.info('Integration test');
        expect(mockLogger.info).toHaveBeenCalledWith('Integration test');
      }
    });
  });
});
