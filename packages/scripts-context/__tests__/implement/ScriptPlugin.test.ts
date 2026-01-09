import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { LoggerInterface } from '@qlover/logger';
import type { ShellInterface } from '../../src/interface/ShellInterface';
import type { ScriptSharedInterface } from '../../src/interface/ScriptSharedInterface';
import { ScriptPlugin } from '../../src/implement/ScriptPlugin';
import { ScriptContext } from '../../src/implement/ScriptContext';
import { LogContext } from '@qlover/logger';

/**
 * TestPlugin test-suite
 *
 * Coverage:
 * 1. constructor       - Constructor and configuration tests
 * 2. getInitialProps   - Configuration merging tests
 * 3. enabled          - Lifecycle execution control tests
 * 4. step             - Step execution and logging tests
 * 5. lifecycle        - Lifecycle method tests
 */

// Mock implementations
class MockLogger implements LoggerInterface {
  public log = vi.fn();
  public info = vi.fn();
  public error = vi.fn();
  public warn = vi.fn();
  public debug = vi.fn();
  public fatal = vi.fn();
  public trace = vi.fn();
  public addAppender = vi.fn();
  public context = vi.fn(<Value>(value?: Value) => new LogContext(value));
}

class MockShell implements ShellInterface {
  public exec = vi.fn();
  public exists = vi.fn();
  public mkdir = vi.fn();
  public rm = vi.fn();
  public pwd = vi.fn();
  public cd = vi.fn();
}

interface TestScriptShared extends ScriptSharedInterface {
  'test-plugin'?: {
    outputDir?: string;
    verbose?: boolean;
    nested?: {
      value?: string;
    };
  };
  execPromise?: (
    command: string | string[],
    options: unknown
  ) => Promise<string>;
}

// Test plugin implementation
interface TestPluginProps {
  skip?: boolean | string;
  outputDir?: string;
  verbose?: boolean;
  nested?: {
    value?: string;
  };
}

class TestPlugin extends ScriptPlugin<
  ScriptContext<TestScriptShared>,
  TestPluginProps
> {
  /**
   * @override
   */
  public async onExec(
    _context: ScriptContext<TestScriptShared>
  ): Promise<void> {
    await this.step({
      label: 'Test step',
      task: async () => {
        return 'test completed';
      }
    });
  }
}

describe('ScriptPlugin', () => {
  let context: ScriptContext<TestScriptShared>;
  let plugin: TestPlugin;
  let mockLogger: MockLogger;
  let mockShell: MockShell;

  beforeEach(() => {
    mockLogger = new MockLogger();
    mockShell = new MockShell();
    context = new ScriptContext('test-script', {
      logger: mockLogger,
      shell: mockShell,
      options: {}
    });
    plugin = new TestPlugin(context, 'test-plugin');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default props', () => {
      expect(plugin).toBeInstanceOf(TestPlugin);
      expect(plugin.pluginName).toBe('test-plugin');
    });

    it('should create instance with custom props', () => {
      const customPlugin = new TestPlugin(context, 'test-plugin', {
        outputDir: './custom-dist',
        verbose: true
      });
      expect(customPlugin).toBeInstanceOf(TestPlugin);
    });
  });

  describe('getInitialProps', () => {
    it('should merge props with command line config', () => {
      // Object.assign(context, {
      //   options: {
      //     'test-plugin': {
      //       outputDir: './cmd-dist'
      //     }
      //   }
      // });
      context.setOptions({
        'test-plugin': {
          outputDir: './cmd-dist'
        }
      });

      const props = {
        verbose: true
      };

      const mergedProps = plugin.getInitialProps(props);
      expect(mergedProps).toEqual({
        outputDir: './cmd-dist',
        verbose: true
      });
    });

    it('should prioritize runtime props over command line config', () => {
      // Object.assign(context, {
      //   options: {
      //     'test-plugin': {
      //       outputDir: './cmd-dist'
      //     }
      //   }
      // });
      context.setOptions({
        'test-plugin': {
          outputDir: './cmd-dist'
        }
      });

      const props = {
        outputDir: './runtime-dist'
      };

      const mergedProps = plugin.getInitialProps(props);
      expect(mergedProps.outputDir).toBe('./runtime-dist');
    });
  });

  describe('enabled', () => {
    it('should return true by default', () => {
      expect(
        plugin.enabled('onBefore', {} as ScriptContext<TestScriptShared>)
      ).toBe(true);
    });

    it('should return false when skip is true', () => {
      const skipPlugin = new TestPlugin(context, 'test-plugin', { skip: true });
      expect(
        skipPlugin.enabled('onBefore', {} as ScriptContext<TestScriptShared>)
      ).toBe(false);
    });

    it('should return false only for specified lifecycle when skip is string', () => {
      const skipPlugin = new TestPlugin(context, 'test-plugin', {
        skip: 'onBefore'
      });
      expect(
        skipPlugin.enabled('onBefore', {} as ScriptContext<TestScriptShared>)
      ).toBe(false);
      expect(
        skipPlugin.enabled('onExec', {} as ScriptContext<TestScriptShared>)
      ).toBe(true);
    });
  });

  describe('step', () => {
    it('should execute step and log success', async () => {
      const result = await plugin.step({
        label: 'Test step',
        task: async () => 'success'
      });

      expect(result).toBe('success');
      expect(mockLogger.log).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Test step');
      expect(mockLogger.info).toHaveBeenCalledWith('Test step - success');
    });

    it('should handle and log errors', async () => {
      const error = new Error('Test error');
      await expect(
        plugin.step({
          label: 'Error step',
          task: async () => {
            throw error;
          }
        })
      ).rejects.toThrow('Test error');

      expect(mockLogger.error).toHaveBeenCalledWith(error);
    });
  });

  describe('lifecycle methods', () => {
    it('should execute onExec with step', async () => {
      const execContext = {} as ScriptContext<TestScriptShared>;
      await plugin.onExec?.(execContext);

      expect(mockLogger.info).toHaveBeenCalledWith('Test step');
      expect(mockLogger.info).toHaveBeenCalledWith('Test step - success');
    });

    it('should call onBefore if defined', async () => {
      class TestPluginWithBefore extends TestPlugin {
        /**
         * @override
         */
        public async onBefore(
          _context: ScriptContext<TestScriptShared>
        ): Promise<void> {
          this.logger.info('Before execution');
        }
      }

      const pluginWithBefore = new TestPluginWithBefore(
        context,
        'test-plugin'
      );
      await pluginWithBefore.onBefore?.(context);

      expect(mockLogger.info).toHaveBeenCalledWith('Before execution');
    });

    it('should call onSuccess if defined', async () => {
      class TestPluginWithSuccess extends TestPlugin {
        /**
         * @override
         */
        public async onSuccess(
          _context: ScriptContext<TestScriptShared>
        ): Promise<void> {
          this.logger.info('Success execution');
        }
      }

      const pluginWithSuccess = new TestPluginWithSuccess(
        context,
        'test-plugin'
      );
      await pluginWithSuccess.onSuccess?.(context);

      expect(mockLogger.info).toHaveBeenCalledWith('Success execution');
    });

    it('should call onError if defined', async () => {
      class TestPluginWithError extends TestPlugin {
        /**
         * @override
         */
        public async onError(
          _context: ScriptContext<TestScriptShared>
        ): Promise<void> {
          this.logger.error('Error execution');
        }
      }

      const pluginWithError = new TestPluginWithError(context, 'test-plugin');
      await pluginWithError.onError?.(context);

      expect(mockLogger.error).toHaveBeenCalledWith('Error execution');
    });

    it('should call onFinally if defined', async () => {
      class TestPluginWithFinally extends TestPlugin {
        /**
         * @override
         */
        public async onFinally(
          _context: ScriptContext<TestScriptShared>
        ): Promise<void> {
          this.logger.info('Finally execution');
        }
      }

      const pluginWithFinally = new TestPluginWithFinally(
        context,
        'test-plugin'
      );
      await pluginWithFinally.onFinally?.(context);

      expect(mockLogger.info).toHaveBeenCalledWith('Finally execution');
    });
  });

  describe('getConfig', () => {
    beforeEach(() => {
      context.setOptions({
        'test-plugin': {
          outputDir: './dist',
          verbose: true,
          nested: {
            value: 'nested-value'
          }
        }
      });
    });

    it('should get full config when no keys provided', () => {
      const config = plugin.getConfig();
      expect(config).toEqual({
        outputDir: './dist',
        verbose: true,
        nested: {
          value: 'nested-value'
        }
      });
    });

    it('should get specific config value by key', () => {
      const outputDir = plugin.getConfig('outputDir');
      expect(outputDir).toBe('./dist');
    });

    it('should get nested config value by array path', () => {
      const nestedValue = plugin.getConfig(['nested', 'value']);
      expect(nestedValue).toBe('nested-value');
    });

    it('should return default value when config not found', () => {
      const defaultValue = 'default';
      const value = plugin.getConfig('nonExistent', defaultValue);
      expect(value).toBe(defaultValue);
    });
  });

  describe('setConfig', () => {
    it('should update plugin configuration', () => {
      plugin.setConfig({
        outputDir: './custom-dist',
        verbose: false
      });

      expect(plugin.getConfig('outputDir')).toBe('./custom-dist');
      expect(plugin.getConfig('verbose')).toBe(false);
    });

    it('should merge with existing configuration', () => {
      context.setOptions({
        'test-plugin': {
          outputDir: './dist',
          verbose: true
        }
      });

      plugin.setConfig({
        verbose: false
      });

      expect(plugin.getConfig('outputDir')).toBe('./dist');
      expect(plugin.getConfig('verbose')).toBe(false);
    });
  });

  describe('logger and shell access', () => {
    it('should provide access to logger', () => {
      expect(plugin.logger).toBe(mockLogger);
    });

    it('should provide access to shell', () => {
      expect(plugin.shell).toBe(mockShell);
    });
  });

  describe('options access', () => {
    it('should return plugin options from context', () => {
      context.setOptions({
        'test-plugin': {
          outputDir: './dist'
        }
      });

      const options = plugin.options;
      expect(options).toEqual({
        outputDir: './dist'
      });
    });
  });

  describe('step with enabled flag', () => {
    it('should execute step when enabled is true', async () => {
      const result = await plugin.step({
        label: 'Enabled step',
        enabled: true,
        task: async () => 'success'
      });

      expect(result).toBe('success');
      expect(mockLogger.info).toHaveBeenCalledWith('Enabled step');
    });

    it('should execute step when enabled is undefined (default true)', async () => {
      const result = await plugin.step({
        label: 'Default enabled step',
        task: async () => 'success'
      });

      expect(result).toBe('success');
      expect(mockLogger.info).toHaveBeenCalledWith('Default enabled step');
    });
  });
});
