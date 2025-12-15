/**
 * GatewayExecutor test suite
 *
 * Coverage:
 * 1. getHookName       – Hook name generation tests
 * 2. runExec           – Task execution tests
 * 3. runBeforeAction   – Action-specific before hook tests
 * 4. runSuccessAction  – Action-specific success hook tests
 * 5. inheritance       – Inherited AsyncExecutor functionality tests
 * 6. edge cases        – Error handling and boundary tests
 * 7. integration       – Complete execution flow tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  GatewayExecutor,
  GatewayExecutorOptions
} from '../../src/core/gateway-auth/impl/GatewayExecutor';
import { AsyncStore, AsyncStoreState } from '../../src/core/store-state';
import {
  ExecutorPlugin,
  ExecutorContext,
  ExecutorError
} from '@qlover/fe-corekit';
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

  public async login(_params: {
    username: string;
    password: string;
  }): Promise<{ token: string }> {
    return { token: 'mock-token-123' };
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

describe('GatewayExecutor', () => {
  let executor: GatewayExecutor<TestUser, MockGateway>;
  let mockGateway: MockGateway;
  let mockLogger: MockLogger;
  let mockStore: AsyncStore<TestUserState, string>;

  beforeEach(() => {
    mockGateway = new MockGateway();
    mockLogger = new MockLogger();
    mockStore = new AsyncStore<TestUserState, string>();
    executor = new GatewayExecutor<TestUser, MockGateway>();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getHookName', () => {
    it('should generate hook name for before hook', () => {
      const hookName = executor.getHookName('login', 'before');
      expect(hookName).toBe('onLoginBefore');
    });

    it('should generate hook name for success hook', () => {
      const hookName = executor.getHookName('login', 'success');
      expect(hookName).toBe('onLoginSuccess');
    });

    it('should handle lowercase action names', () => {
      expect(executor.getHookName('getuser', 'before')).toBe('onGetuserBefore');
      expect(executor.getHookName('logout', 'success')).toBe('onLogoutSuccess');
    });

    it('should handle mixed case action names', () => {
      expect(executor.getHookName('getUser', 'before')).toBe('onGetUserBefore');
      expect(executor.getHookName('LOGIN', 'success')).toBe('onLOGINSuccess');
    });

    it('should handle single character action names', () => {
      expect(executor.getHookName('a', 'before')).toBe('onABefore');
      expect(executor.getHookName('x', 'success')).toBe('onXSuccess');
    });

    it('should handle action names with numbers', () => {
      expect(executor.getHookName('action1', 'before')).toBe('onAction1Before');
      expect(executor.getHookName('test123', 'success')).toBe(
        'onTest123Success'
      );
    });

    it('should handle empty string action name', () => {
      expect(executor.getHookName('', 'before')).toBe('onBefore');
      expect(executor.getHookName('', 'success')).toBe('onSuccess');
    });
  });

  describe('runExec', () => {
    it('should execute actual task and set returnValue', async () => {
      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      const actualTask = vi.fn(async () => {
        return await mockGateway.getUser({ id: 1 });
      });

      const executorWithRunExec = executor as unknown as {
        runExec: (
          context: ExecutorContext<unknown>,
          task: () => Promise<unknown>
        ) => Promise<void>;
      };
      await executorWithRunExec.runExec(context, actualTask);

      expect(actualTask).toHaveBeenCalledWith(context);
      expect(context.returnValue).toEqual({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });
    });

    it('should handle task that returns null', async () => {
      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      const actualTask = vi.fn(async () => null);

      const executorWithRunExec = executor as unknown as {
        runExec: (
          context: ExecutorContext<unknown>,
          task: () => Promise<unknown>
        ) => Promise<void>;
      };
      await executorWithRunExec.runExec(context, actualTask);

      expect(actualTask).toHaveBeenCalled();
      expect(context.returnValue).toBeNull();
    });

    it('should propagate errors from task', async () => {
      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      const error = new Error('Task execution failed');
      const actualTask = vi.fn(async () => {
        throw error;
      });

      const executorWithRunExec = executor as unknown as {
        runExec: (
          context: ExecutorContext<unknown>,
          task: () => Promise<unknown>
        ) => Promise<void>;
      };
      await expect(
        executorWithRunExec.runExec(context, actualTask)
      ).rejects.toThrow('Task execution failed');
      expect(actualTask).toHaveBeenCalled();
    });
  });

  describe('runBeforeAction', () => {
    it('should execute action-specific before hook', async () => {
      const onLoginBeforeHook = vi.fn();
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginBefore: onLoginBeforeHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      await executor.runBeforeAction(context);

      expect(onLoginBeforeHook).toHaveBeenCalledTimes(1);
      expect(onLoginBeforeHook).toHaveBeenCalledWith(context);
    });

    it('should not execute hook if action name does not match', async () => {
      const onLoginBeforeHook = vi.fn();
      const onGetUserBeforeHook = vi.fn();
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
        onGetUserBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginBefore: onLoginBeforeHook,
        onGetUserBefore: onGetUserBeforeHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      await executor.runBeforeAction(context);

      expect(onLoginBeforeHook).not.toHaveBeenCalled();
      expect(onGetUserBeforeHook).toHaveBeenCalledTimes(1);
    });

    it('should execute multiple plugins with same hook', async () => {
      const hook1 = vi.fn();
      const hook2 = vi.fn();
      const plugin1: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'Plugin1',
        onLoginBefore: hook1
      };
      const plugin2: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'Plugin2',
        onLoginBefore: hook2
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      await executor.runBeforeAction(context);

      expect(hook1).toHaveBeenCalledTimes(1);
      expect(hook2).toHaveBeenCalledTimes(1);
    });

    it('should handle hook that throws error', async () => {
      const error = new Error('Hook error');
      const onLoginBeforeHook = vi.fn(async () => {
        throw error;
      });
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginBefore: onLoginBeforeHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      await expect(executor.runBeforeAction(context)).rejects.toThrow(
        'Hook error'
      );
      expect(onLoginBeforeHook).toHaveBeenCalled();
    });

    it('should not throw if hook does not exist', async () => {
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'TestPlugin',
        onBefore: vi.fn()
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      // Should not throw even if onGetUserBefore hook doesn't exist
      await expect(executor.runBeforeAction(context)).resolves.not.toThrow();
    });
  });

  describe('runSuccessAction', () => {
    it('should execute action-specific success hook', async () => {
      const onLoginSuccessHook = vi.fn();
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginSuccess: onLoginSuccessHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
      > = {
        parameters: options,
        returnValue: { token: 'mock-token-123' },
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

      await executor.runSuccessAction(context);

      expect(onLoginSuccessHook).toHaveBeenCalledTimes(1);
      expect(onLoginSuccessHook).toHaveBeenCalledWith(context);
    });

    it('should not execute hook if action name does not match', async () => {
      const onLoginSuccessHook = vi.fn();
      const onGetUserSuccessHook = vi.fn();
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
        onGetUserSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginSuccess: onLoginSuccessHook,
        onGetUserSuccess: onGetUserSuccessHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
      > = {
        parameters: options,
        returnValue: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        },
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

      await executor.runSuccessAction(context);

      expect(onLoginSuccessHook).not.toHaveBeenCalled();
      expect(onGetUserSuccessHook).toHaveBeenCalledTimes(1);
    });

    it('should execute multiple plugins with same hook', async () => {
      const hook1 = vi.fn();
      const hook2 = vi.fn();
      const plugin1: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'Plugin1',
        onLoginSuccess: hook1
      };
      const plugin2: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'Plugin2',
        onLoginSuccess: hook2
      };

      executor.use(plugin1);
      executor.use(plugin2);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
      > = {
        parameters: options,
        returnValue: { token: 'mock-token-123' },
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

      await executor.runSuccessAction(context);

      expect(hook1).toHaveBeenCalledTimes(1);
      expect(hook2).toHaveBeenCalledTimes(1);
    });

    it('should handle hook that throws error', async () => {
      const error = new Error('Hook error');
      const onLoginSuccessHook = vi.fn(async () => {
        throw error;
      });
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginSuccess: onLoginSuccessHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
      > = {
        parameters: options,
        returnValue: { token: 'mock-token-123' },
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

      await expect(executor.runSuccessAction(context)).rejects.toThrow(
        'Hook error'
      );
      expect(onLoginSuccessHook).toHaveBeenCalled();
    });

    it('should not throw if hook does not exist', async () => {
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'TestPlugin',
        onSuccess: vi.fn()
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
      > = {
        parameters: options,
        returnValue: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        },
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

      // Should not throw even if onGetUserSuccess hook doesn't exist
      await expect(executor.runSuccessAction(context)).resolves.not.toThrow();
    });
  });

  describe('inheritance from AsyncExecutor', () => {
    it('should support use method for plugin registration', () => {
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > = {
        pluginName: 'TestPlugin',
        onBefore: vi.fn()
      };

      executor.use(plugin);
      // use method returns void, so we just verify it doesn't throw
      expect(executor).toBeDefined();
    });

    it('should support exec method for task execution', async () => {
      const result = await executor.exec(async () => {
        return 'test result';
      });

      expect(result).toBe('test result');
    });

    it('should support execNoError method', async () => {
      const result = await executor.execNoError(async () => {
        return 'test result';
      });

      expect(result).toBe('test result');
    });

    it('should handle errors through execNoError', async () => {
      const error = new Error('Test error');
      const result = await executor.execNoError(async () => {
        throw error;
      });

      expect(result).toBeInstanceOf(ExecutorError);
    });
  });

  describe('integration tests', () => {
    it('should execute complete flow with action-specific hooks', async () => {
      const executionOrder: string[] = [];
      const onBeforeHook = vi.fn(() => {
        executionOrder.push('onBefore');
      });
      const onLoginBeforeHook = vi.fn(() => {
        executionOrder.push('onLoginBefore');
      });
      const onLoginSuccessHook = vi.fn(() => {
        executionOrder.push('onLoginSuccess');
      });
      const onSuccessHook = vi.fn(() => {
        executionOrder.push('onSuccess');
      });

      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onBefore: onBeforeHook,
        onLoginBefore: onLoginBeforeHook,
        onLoginSuccess: onLoginSuccessHook,
        onSuccess: onSuccessHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      // Simulate execution flow
      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      // Execute before hooks (general first, then action-specific)
      const executorWithAccess = executor as unknown as {
        runHook: (
          plugins: ExecutorPlugin[],
          hookName: string,
          context: ExecutorContext<unknown>
        ) => Promise<void>;
        plugins: ExecutorPlugin[];
        runExec: (
          context: ExecutorContext<unknown>,
          task: () => Promise<unknown>
        ) => Promise<void>;
      };
      await executorWithAccess.runHook(
        executorWithAccess.plugins,
        'onBefore',
        context
      );
      await executor.runBeforeAction(context);

      // Execute task
      await executorWithAccess.runExec(context, async () => {
        executionOrder.push('task');
        return await mockGateway.login({ username: 'test', password: 'pass' });
      });

      // Execute success hooks (action-specific first, then general)
      await executor.runSuccessAction(context);
      await executorWithAccess.runHook(
        executorWithAccess.plugins,
        'onSuccess',
        context
      );

      expect(executionOrder).toEqual([
        'onBefore',
        'onLoginBefore',
        'task',
        'onLoginSuccess',
        'onSuccess'
      ]);
    });

    it('should handle error in action-specific hook correctly', async () => {
      const onErrorHook = vi.fn();
      const onLoginBeforeHook = vi.fn(async () => {
        throw new Error('Before hook error');
      });

      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginBefore?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginBefore: onLoginBeforeHook,
        onError: onErrorHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      await expect(executor.runBeforeAction(context)).rejects.toThrow(
        'Before hook error'
      );
      expect(onLoginBeforeHook).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle empty plugins array', async () => {
      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { id: number }
      > = {
        actionName: 'getUser',
        serviceName: 'TestService',
        params: { id: 1 },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<TestUser, MockGateway, { id: number }>
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

      // Should not throw even with no plugins
      await expect(executor.runBeforeAction(context)).resolves.not.toThrow();
      await expect(executor.runSuccessAction(context)).resolves.not.toThrow();
    });

    it('should handle context with undefined returnValue', async () => {
      const onLoginSuccessHook = vi.fn();
      const plugin: ExecutorPlugin<
        GatewayExecutorOptions<TestUser, MockGateway, unknown>
      > & {
        onLoginSuccess?: (
          context: ExecutorContext<
            GatewayExecutorOptions<TestUser, MockGateway, unknown>
          >
        ) => Promise<void> | void;
      } = {
        pluginName: 'TestPlugin',
        onLoginSuccess: onLoginSuccessHook
      };

      executor.use(plugin);

      const options: GatewayExecutorOptions<
        TestUser,
        MockGateway,
        { username: string; password: string }
      > = {
        actionName: 'login',
        serviceName: 'TestService',
        params: { username: 'test', password: 'pass' },
        store: mockStore,
        gateway: mockGateway,
        logger: mockLogger
      };

      const context: ExecutorContext<
        GatewayExecutorOptions<
          TestUser,
          MockGateway,
          { username: string; password: string }
        >
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

      await executor.runSuccessAction(context);
      expect(onLoginSuccessHook).toHaveBeenCalledWith(context);
    });
  });
});
