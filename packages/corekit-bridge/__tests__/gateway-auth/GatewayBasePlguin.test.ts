import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GatewayBasePlguin } from '../../src/core/gateway-auth/impl/GatewayBasePlguin';
import { GatewayExecutorOptions } from '../../src/core/gateway-auth/impl/GatewayExecutor';
import { AsyncStore, AsyncStoreState } from '../../src/core/store-state';
import { ExecutorContext, ExecutorError } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import { LogContext } from '@qlover/logger';

interface TestUser {
  id: number;
  name: string;
  email: string;
}

class MockGateway {
  public async getUser(_params: { id: number }): Promise<TestUser> {
    return {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    };
  }
}

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

interface TestUserState extends AsyncStoreState<TestUser> {}

describe('GatewayBasePlguin', () => {
  let plugin: GatewayBasePlguin<unknown, TestUser, MockGateway>;
  let mockStore: AsyncStore<TestUserState, string>;
  let mockLogger: MockLogger;
  let mockGateway: MockGateway;

  beforeEach(() => {
    plugin = new GatewayBasePlguin<unknown, TestUser, MockGateway>();
    mockStore = new AsyncStore<TestUserState, string>();
    mockLogger = new MockLogger();
    mockGateway = new MockGateway();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('pluginName', () => {
    it('should have correct plugin name', () => {
      expect(plugin.pluginName).toBe('GatewayBasePlguin');
    });
  });

  describe('onBefore', () => {
    it('should call store.start() when store is provided', async () => {
      const startSpy = vi.spyOn(mockStore, 'start');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onBefore(context);

      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(mockStore.getLoading()).toBe(true);
    });

    it('should not throw when store is undefined', async () => {
      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: undefined,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onBefore(context)).resolves.not.toThrow();
    });

    it('should not throw when store is null', async () => {
      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: null as unknown as AsyncStore<TestUserState, string>,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onBefore(context)).resolves.not.toThrow();
    });
  });

  describe('onSuccess', () => {
    it('should call store.success() with returnValue when store is provided', async () => {
      const successSpy = vi.spyOn(mockStore, 'success');
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onSuccess(context);

      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledWith(result);
      expect(mockStore.getResult()).toEqual(result);
    });

    it('should throw ExecutorError when returnValue is null', async () => {
      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: null,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onSuccess(context)).rejects.toThrow(ExecutorError);
      await expect(plugin.onSuccess(context)).rejects.toThrow(
        'TestService: getUser - Result is null'
      );
    });

    it('should throw ExecutorError when returnValue is undefined', async () => {
      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onSuccess(context)).rejects.toThrow(ExecutorError);
      await expect(plugin.onSuccess(context)).rejects.toThrow(
        'TestService: getUser - Result is null'
      );
    });

    it('should log success event when logger is provided', async () => {
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      // Start store to set startTime for duration calculation
      mockStore.start();

      await plugin.onSuccess(context);

      expect(mockLogger.debug).toHaveBeenCalledTimes(1);
      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringContaining('TestService: getUser - success'),
        result
      );
    });

    it('should not log when logger is not provided', async () => {
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: undefined
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onSuccess(context);

      expect(mockLogger.debug).not.toHaveBeenCalled();
    });

    it('should not throw when store is undefined', async () => {
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: undefined,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onSuccess(context)).resolves.not.toThrow();
      expect(mockLogger.debug).toHaveBeenCalled();
    });

    it('should include duration in log message', async () => {
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      mockStore.start();
      // Wait a bit to ensure duration > 0
      await new Promise((resolve) => setTimeout(resolve, 10));

      await plugin.onSuccess(context);

      expect(mockLogger.debug).toHaveBeenCalledWith(
        expect.stringMatching(/TestService: getUser - success\(\d+ms\)/),
        result
      );
    });
  });

  describe('onError', () => {
    it('should call store.failed() with error when store is provided', async () => {
      const failedSpy = vi.spyOn(mockStore, 'failed');
      const error = new Error('Test error');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onError(context);

      expect(failedSpy).toHaveBeenCalledTimes(1);
      expect(failedSpy).toHaveBeenCalledWith(error);
      expect(mockStore.getError()).toBe(error);
    });

    it('should not throw when store is undefined', async () => {
      const error = new Error('Test error');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: undefined,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onError(context)).resolves.not.toThrow();
    });

    it('should not throw when store is null', async () => {
      const error = new Error('Test error');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: null as unknown as AsyncStore<TestUserState, string>,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await expect(plugin.onError(context)).resolves.not.toThrow();
    });

    it('should handle different error types', async () => {
      const failedSpy = vi.spyOn(mockStore, 'failed');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const error1 = new Error('String error');
      const context1: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error1,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onError(context1);
      expect(failedSpy).toHaveBeenCalledWith(error1);

      const error2 = new TypeError('Type error');
      const context2: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error2,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onError(context2);
      expect(failedSpy).toHaveBeenCalledWith(error2);
    });
  });

  describe('integration', () => {
    it('should handle complete execution flow', async () => {
      const result: TestUser = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      };

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      // onBefore
      const beforeContext: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onBefore(beforeContext);
      expect(mockStore.getLoading()).toBe(true);

      // onSuccess
      const successContext: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: result,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onSuccess(successContext);
      expect(mockStore.getLoading()).toBe(false);
      expect(mockStore.getResult()).toEqual(result);
      expect(mockStore.getError()).toBeNull();
    });

    it('should handle error flow', async () => {
      const error = new Error('Operation failed');

      const options: GatewayExecutorOptions<TestUser, MockGateway, unknown> = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: {},
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      // onBefore
      const beforeContext: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onBefore(beforeContext);
      expect(mockStore.getLoading()).toBe(true);

      // onError
      const errorContext: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        parameters: options,
        returnValue: undefined,
        error: error,
        hooksRuntimes: {
          pluginName: '',
          hookName: '',
          returnValue: undefined,
          returnBreakChain: false,
          times: 0,
          breakChain: false,
          index: undefined
        }
      };

      await plugin.onError(errorContext);
      expect(mockStore.getLoading()).toBe(false);
      expect(mockStore.getError()).toBe(error);
      // When failed is called without result parameter, result becomes undefined
      // So we check for null or undefined using toBeFalsy or explicit check
      const result = mockStore.getResult();
      expect(result === null || result === undefined).toBe(true);
    });
  });
});
