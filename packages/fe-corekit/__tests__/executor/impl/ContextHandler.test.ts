/**
 * ContextHandler test suite
 *
 * Coverage:
 * 1. context creation - Test context factory function
 * 2. runtime management - Test runtime state handling
 * 3. plugin validation - Test plugin hook validation
 * 4. error handling - Test error state management
 * 5. chain control - Test execution chain control
 */

import {
  ContextHandler,
  createContext
} from '../../../src/executor/impl/ContextHandler';
import { ExecutorPlugin } from '../../../src/executor/interface';

// Test data factory functions
function createTestPlugin(overrides = {}): ExecutorPlugin {
  return {
    pluginName: 'testPlugin',
    ...overrides
  } as unknown as ExecutorPlugin;
}

describe('ContextHandler', () => {
  describe('Context Creation', () => {
    it('should create context with default values', () => {
      const parameters = { test: 'value' };
      const context = createContext(parameters);

      expect(context.parameters).toBe(parameters);
      expect(context.returnValue).toBeUndefined();
      expect(context.error).toBeUndefined();
      expect(context.hooksRuntimes).toEqual({
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0,
        breakChain: false,
        index: undefined
      });
    });
  });

  describe('Runtime Management', () => {
    let handler: ContextHandler;

    beforeEach(() => {
      handler = new ContextHandler();
    });

    it('should reset hooks runtime state', () => {
      const context = createContext({});
      context.hooksRuntimes.pluginName = 'test';
      context.hooksRuntimes.hookName = 'onTest';
      context.hooksRuntimes.returnValue = 'value';
      context.hooksRuntimes.returnBreakChain = true;
      context.hooksRuntimes.times = 1;
      context.hooksRuntimes.breakChain = true;
      context.hooksRuntimes.index = 0;

      handler.resetHooksRuntimes(context.hooksRuntimes);

      expect(context.hooksRuntimes).toEqual({
        pluginName: '',
        hookName: '',
        returnValue: undefined,
        returnBreakChain: false,
        times: 0,
        breakChain: false,
        index: undefined
      });
    });

    it('should reset entire context', () => {
      const context = createContext({});
      context.returnValue = 'test';
      context.error = new Error('test');
      context.hooksRuntimes.pluginName = 'test';

      handler.reset(context);

      expect(context.returnValue).toBeUndefined();
      expect(context.error).toBeUndefined();
      expect(context.hooksRuntimes.pluginName).toBe('');
    });

    it('should update runtime tracking information', () => {
      const context = createContext({});
      const plugin = createTestPlugin();

      handler.runtimes(context, plugin, 'onTest', 1);

      expect(context.hooksRuntimes.pluginName).toBe('testPlugin');
      expect(context.hooksRuntimes.hookName).toBe('onTest');
      expect(context.hooksRuntimes.times).toBe(1);
      expect(context.hooksRuntimes.index).toBe(1);
    });

    it('should set runtime return value', () => {
      const context = createContext({});
      const returnValue = 'test';

      handler.runtimeReturnValue(context, returnValue);

      expect(context.hooksRuntimes.returnValue).toBe(returnValue);
    });
  });

  describe('Plugin Validation', () => {
    let handler: ContextHandler;

    beforeEach(() => {
      handler = new ContextHandler();
    });

    it('should skip plugin hook if method does not exist', () => {
      const plugin = createTestPlugin();
      const context = createContext({});

      expect(
        handler.shouldSkipPluginHook(plugin, 'nonExistentHook', context)
      ).toBe(true);
    });

    it('should skip plugin hook if enabled function returns false', () => {
      const plugin = createTestPlugin({
        onTest: () => {},
        enabled: () => false
      });
      const context = createContext({});

      expect(handler.shouldSkipPluginHook(plugin, 'onTest', context)).toBe(
        true
      );
    });

    it('should not skip plugin hook if method exists and enabled', () => {
      const plugin = createTestPlugin({
        onTest: () => {},
        enabled: () => true
      });
      const context = createContext({});

      expect(handler.shouldSkipPluginHook(plugin, 'onTest', context)).toBe(
        false
      );
    });
  });

  describe('Chain Control', () => {
    let handler: ContextHandler;

    beforeEach(() => {
      handler = new ContextHandler();
    });

    it('should check if chain should be broken', () => {
      const context = createContext({});
      context.hooksRuntimes.breakChain = true;

      expect(handler.shouldBreakChain(context)).toBe(true);
    });

    it('should check if chain should be broken on return', () => {
      const context = createContext({});
      context.hooksRuntimes.returnBreakChain = true;

      expect(handler.shouldBreakChainOnReturn(context)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    let handler: ContextHandler;

    beforeEach(() => {
      handler = new ContextHandler();
    });

    it('should set error in context', () => {
      const context = createContext({});
      const error = new Error('test error');

      handler.setError(context, error);

      expect(context.error).toBe(error);
    });
  });
});
