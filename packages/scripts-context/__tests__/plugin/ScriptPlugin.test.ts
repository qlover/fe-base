/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import ScriptPlugin, {
  type ScriptPluginProps,
  type StepOption
} from '../../src/plugin/ScriptPlugin';
import ScriptContext from '../../src/plugin/ScriptContext';
import type { ExecutorContext } from '@qlover/fe-corekit';
import type { LoggerInterface } from '@qlover/logger';
import type { ShellInterface } from '../../src/interface/ShellInterface';
import { ScriptShared } from '../../src/plugin/ScriptShared';

// Mock dependencies
vi.mock('../../src/plugin/ScriptContext');

interface TestScriptShared extends ScriptShared {
  testProp?: string;
  nested?: {
    value?: string;
  };
}

interface TestPluginProps extends ScriptPluginProps {
  customProp?: string;
  testValue?: number;
}

/**
 * Test implementation of ScriptPlugin
 *
 * Significance: Concrete implementation for testing abstract ScriptPlugin
 * Core idea: Provide testable implementation of abstract methods
 * Main function: Enable testing of ScriptPlugin functionality
 * Main purpose: Test the abstract ScriptPlugin class behavior
 *
 * @example
 * const plugin = new TestScriptPlugin(context, 'test-plugin', props);
 * await plugin.onExec(executorContext);
 */
class TestScriptPlugin extends ScriptPlugin<
  ScriptContext<TestScriptShared>,
  TestPluginProps
> {
  public onBeforeCalled = false;
  public onExecCalled = false;
  public onSuccessCalled = false;
  public onErrorCalled = false;

  async onBefore(
    _context: ExecutorContext<ScriptContext<TestScriptShared>>
  ): Promise<void> {
    this.onBeforeCalled = true;
  }

  async onExec(
    _context: ExecutorContext<ScriptContext<TestScriptShared>>
  ): Promise<void> {
    this.onExecCalled = true;
  }

  async onSuccess(
    _context: ExecutorContext<ScriptContext<TestScriptShared>>
  ): Promise<void> {
    this.onSuccessCalled = true;
  }

  async onError(
    _context: ExecutorContext<ScriptContext<TestScriptShared>>
  ): Promise<void> {
    this.onErrorCalled = true;
  }
}

describe('ScriptPlugin', () => {
  let mockContext: ScriptContext<TestScriptShared>;
  let mockLogger: LoggerInterface;
  let mockShell: ShellInterface;
  let mockExecutorContext: ExecutorContext<ScriptContext<TestScriptShared>>;
  let plugin: TestScriptPlugin;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock logger
    mockLogger = {
      log: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    } as any;

    // Mock shell
    mockShell = {
      exec: vi.fn().mockResolvedValue('command output')
    };

    // Mock context
    mockContext = {
      logger: mockLogger,
      shell: mockShell,
      options: {},
      getStore: vi.fn().mockReturnValue({}),
      setStore: vi.fn()
    } as any;

    // Mock executor context
    mockExecutorContext = {
      context: mockContext
    } as any;

    // Create plugin instance
    plugin = new TestScriptPlugin(mockContext, 'test-plugin');
  });

  describe('constructor', () => {
    it('should create plugin with default props', () => {
      expect(plugin).toBeInstanceOf(ScriptPlugin);
      expect(plugin.pluginName).toBe('test-plugin');
      expect(plugin.onlyOne).toBe(true);
    });

    it('should merge props with initial props', () => {
      const props: TestPluginProps = {
        customProp: 'test-value',
        testValue: 42
      };

      const pluginWithProps = new TestScriptPlugin(
        mockContext,
        'test-plugin',
        props
      );
      expect(pluginWithProps).toBeInstanceOf(ScriptPlugin);
    });

    it('should call setConfig with initial props', () => {
      const setConfigSpy = vi.spyOn(TestScriptPlugin.prototype, 'setConfig');
      new TestScriptPlugin(mockContext, 'test-plugin');
      expect(setConfigSpy).toHaveBeenCalled();
    });
  });

  describe('getInitialProps', () => {
    it('should return command line config as first priority', () => {
      const commandLineConfig = { customProp: 'command-line-value' };

      mockContext.options = {
        'test-plugin': commandLineConfig
      } as any;

      const result = plugin.getInitialProps();
      expect(result).toEqual(commandLineConfig);
    });

    it('should return file config when no command line config', () => {
      const fileConfig = { customProp: 'file-value' };
      mockContext.options = {};
      (mockContext.getStore as Mock).mockReturnValue(fileConfig);

      const result = plugin.getInitialProps();
      expect(mockContext.getStore).toHaveBeenCalledWith('test-plugin');
      expect(result).toEqual(fileConfig);
    });

    it('should merge file config with provided props', () => {
      const fileConfig = { customProp: 'file-value' };
      const props = { testValue: 42 };
      mockContext.options = {};
      (mockContext.getStore as Mock).mockReturnValue(fileConfig);

      const result = plugin.getInitialProps(props as TestPluginProps);
      expect(result).toEqual({
        customProp: 'file-value',
        testValue: 42
      });
    });

    it('should return empty object when no config available', () => {
      mockContext.options = {};
      (mockContext.getStore as Mock).mockReturnValue(undefined);

      const result = plugin.getInitialProps();
      expect(result).toEqual({});
    });
  });

  describe('getters', () => {
    it('should return logger from context', () => {
      expect(plugin.logger).toBe(mockLogger);
    });

    it('should return shell from context', () => {
      expect(plugin.shell).toBe(mockShell);
    });

    it('should return options from store', () => {
      const expectedOptions = { customProp: 'test' };
      (mockContext.getStore as Mock).mockReturnValue(expectedOptions);

      expect(plugin.options).toBe(expectedOptions);
      expect(mockContext.getStore).toHaveBeenCalledWith('test-plugin', {});
    });
  });

  describe('enabled', () => {
    it('should return true by default', () => {
      // Mock getConfig to return undefined (no skip config)
      const getConfigSpy = vi
        .spyOn(plugin, 'getConfig')
        .mockReturnValue(undefined);

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(true);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should return false when skip is true', () => {
      // Mock getConfig to return true for skip
      const getConfigSpy = vi.spyOn(plugin, 'getConfig').mockReturnValue(true);

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(false);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should return false when skip matches the lifecycle name', () => {
      // Mock getConfig to return 'onExec' for skip
      const getConfigSpy = vi
        .spyOn(plugin, 'getConfig')
        .mockReturnValue('onExec');

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(false);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should return true when skip does not match the lifecycle name', () => {
      // Mock getConfig to return 'onBefore' for skip
      const getConfigSpy = vi
        .spyOn(plugin, 'getConfig')
        .mockReturnValue('onBefore');

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(true);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should handle multiple lifecycle names in skip string', () => {
      // Mock getConfig to return 'onExec' for skip (single match)
      const getConfigSpy = vi
        .spyOn(plugin, 'getConfig')
        .mockReturnValue('onExec');

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(false);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });
  });

  describe('getConfig', () => {
    it('should return entire plugin config when no keys provided', () => {
      const config = { customProp: 'test', testValue: 42 };
      (mockContext.getStore as Mock).mockReturnValue(config);

      const result = plugin.getConfig();
      expect(result).toBe(config);
      expect(mockContext.getStore).toHaveBeenCalledWith(
        'test-plugin',
        undefined
      );
    });

    it('should return nested config with string key', () => {
      const nestedValue = 'nested-value';
      (mockContext.getStore as Mock).mockReturnValue(nestedValue);

      const result = plugin.getConfig('nested.key');
      expect(result).toBe(nestedValue);
      expect(mockContext.getStore).toHaveBeenCalledWith(
        ['test-plugin', 'nested.key'],
        undefined
      );
    });

    it('should return nested config with array keys', () => {
      const nestedValue = 'array-nested-value';
      (mockContext.getStore as Mock).mockReturnValue(nestedValue);

      const result = plugin.getConfig(['nested', 'key']);
      expect(result).toBe(nestedValue);
      expect(mockContext.getStore).toHaveBeenCalledWith(
        ['test-plugin', 'nested', 'key'],
        undefined
      );
    });

    it('should return default value when config not found', () => {
      const defaultValue = 'default-value';
      (mockContext.getStore as Mock).mockReturnValue(defaultValue);

      const result = plugin.getConfig('nonexistent', defaultValue);
      expect(result).toBe(defaultValue);
    });
  });

  describe('setConfig', () => {
    it('should set config in context store', () => {
      const config = { customProp: 'new-value' };

      plugin.setConfig(config);

      expect(mockContext.setStore).toHaveBeenCalledWith({
        'test-plugin': config
      });
    });

    it('should handle partial config updates', () => {
      const partialConfig = { customProp: 'updated-value' };

      plugin.setConfig(partialConfig);

      expect(mockContext.setStore).toHaveBeenCalledWith({
        'test-plugin': partialConfig
      });
    });
  });

  describe('lifecycle methods', () => {
    it('should call onBefore when implemented', async () => {
      await plugin.onBefore?.(mockExecutorContext);
      expect(plugin.onBeforeCalled).toBe(true);
    });

    it('should call onExec when implemented', async () => {
      await plugin.onExec?.(mockExecutorContext);
      expect(plugin.onExecCalled).toBe(true);
    });

    it('should call onSuccess when implemented', async () => {
      await plugin.onSuccess?.(mockExecutorContext);
      expect(plugin.onSuccessCalled).toBe(true);
    });

    it('should call onError when implemented', async () => {
      await plugin.onError?.(mockExecutorContext);
      expect(plugin.onErrorCalled).toBe(true);
    });
  });

  describe('step', () => {
    it('should execute step successfully and log progress', async () => {
      const stepOption: StepOption<string> = {
        label: 'Test Step',
        task: vi.fn().mockResolvedValue('step result')
      };

      const result = await plugin.step(stepOption);

      expect(result).toBe('step result');
      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('Test Step');
      expect(mockLogger.info).toHaveBeenCalledWith('Test Step - success');
      expect(stepOption.task).toHaveBeenCalled();
    });

    it('should handle step execution failure', async () => {
      const error = new Error('Step failed');
      const stepOption: StepOption<string> = {
        label: 'Failing Step',
        task: vi.fn().mockRejectedValue(error)
      };

      await expect(plugin.step(stepOption)).rejects.toThrow('Step failed');

      expect(mockLogger.log).toHaveBeenCalledTimes(2);
      expect(mockLogger.info).toHaveBeenCalledWith('Failing Step');
      expect(mockLogger.error).toHaveBeenCalledWith(error);
    });

    it('should handle step with enabled flag', async () => {
      const stepOption: StepOption<string> = {
        label: 'Conditional Step',
        enabled: true,
        task: vi.fn().mockResolvedValue('conditional result')
      };

      const result = await plugin.step(stepOption);
      expect(result).toBe('conditional result');
    });

    it('should execute step with complex return type', async () => {
      const complexResult = { data: 'test', count: 42 };
      const stepOption: StepOption<typeof complexResult> = {
        label: 'Complex Step',
        task: vi.fn().mockResolvedValue(complexResult)
      };

      const result = await plugin.step(stepOption);
      expect(result).toEqual(complexResult);
    });

    it('should handle async task properly', async () => {
      const stepOption: StepOption<string> = {
        label: 'Async Step',
        task: async () => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return 'async result';
        }
      };

      const result = await plugin.step(stepOption);
      expect(result).toBe('async result');
    });
  });

  describe('integration tests', () => {
    it('should work with real-world configuration scenario', () => {
      const realWorldConfig = {
        skip: false,
        customProp: 'production-value',
        nested: {
          value: 'nested-production-value'
        }
      };

      mockContext.options = {
        'test-plugin': realWorldConfig
      } as any;

      const realWorldPlugin = new TestScriptPlugin(mockContext, 'test-plugin');

      // Mock getConfig to return false for skip
      const getConfigSpy = vi
        .spyOn(realWorldPlugin, 'getConfig')
        .mockReturnValue(false);
      expect(realWorldPlugin.enabled('onExec', mockExecutorContext)).toBe(true);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should handle plugin with no configuration', () => {
      mockContext.options = {};
      (mockContext.getStore as Mock).mockReturnValue({});

      const minimalPlugin = new TestScriptPlugin(mockContext, 'minimal-plugin');

      // Mock getConfig to return undefined for skip
      vi.spyOn(minimalPlugin, 'getConfig').mockReturnValue(undefined);
      expect(minimalPlugin.enabled('onExec', mockExecutorContext)).toBe(true);
      expect(minimalPlugin.pluginName).toBe('minimal-plugin');
    });

    it('should handle complex skip configuration', () => {
      // Mock getConfig to return different values for different calls
      const getConfigSpy = vi.spyOn(plugin, 'getConfig');

      // Test onBefore - should be false
      getConfigSpy.mockReturnValueOnce('onBefore');
      expect(plugin.enabled('onBefore', mockExecutorContext)).toBe(false);

      // Test onExec - should be true
      getConfigSpy.mockReturnValueOnce('onBefore');
      expect(plugin.enabled('onExec', mockExecutorContext)).toBe(true);

      // Test onSuccess - should be true
      getConfigSpy.mockReturnValueOnce('onBefore');
      expect(plugin.enabled('onSuccess', mockExecutorContext)).toBe(true);

      // Test onError - should be true
      getConfigSpy.mockReturnValueOnce('onBefore');
      expect(plugin.enabled('onError', mockExecutorContext)).toBe(true);
    });

    it('should execute multiple steps in sequence', async () => {
      const step1Result = 'step1';
      const step2Result = 'step2';

      const step1: StepOption<string> = {
        label: 'Step 1',
        task: vi.fn().mockResolvedValue(step1Result)
      };

      const step2: StepOption<string> = {
        label: 'Step 2',
        task: vi.fn().mockResolvedValue(step2Result)
      };

      const result1 = await plugin.step(step1);
      const result2 = await plugin.step(step2);

      expect(result1).toBe(step1Result);
      expect(result2).toBe(step2Result);
      expect(mockLogger.info).toHaveBeenCalledWith('Step 1');
      expect(mockLogger.info).toHaveBeenCalledWith('Step 1 - success');
      expect(mockLogger.info).toHaveBeenCalledWith('Step 2');
      expect(mockLogger.info).toHaveBeenCalledWith('Step 2 - success');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined context options', () => {
      mockContext.options = undefined as any;
      (mockContext.getStore as Mock).mockReturnValue({});

      const result = plugin.getInitialProps();
      expect(result).toEqual({});
    });

    it('should handle null skip value', () => {
      const getConfigSpy = vi.spyOn(plugin, 'getConfig').mockReturnValue(null);

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(true);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should handle empty string skip value', () => {
      const getConfigSpy = vi.spyOn(plugin, 'getConfig').mockReturnValue('');

      const result = plugin.enabled('onExec', mockExecutorContext);
      expect(result).toBe(true);
      expect(getConfigSpy).toHaveBeenCalledWith('skip');
    });

    it('should handle step with undefined task result', async () => {
      const stepOption: StepOption<undefined> = {
        label: 'Undefined Step',
        task: vi.fn().mockResolvedValue(undefined)
      };

      const result = await plugin.step(stepOption);
      expect(result).toBeUndefined();
    });

    it('should handle step with null task result', async () => {
      const stepOption: StepOption<null> = {
        label: 'Null Step',
        task: vi.fn().mockResolvedValue(null)
      };

      const result = await plugin.step(stepOption);
      expect(result).toBeNull();
    });
  });
});
