import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { ExecutorContext } from '@qlover/fe-corekit';
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
  log = vi.fn();
  info = vi.fn();
  error = vi.fn();
  warn = vi.fn();
  debug = vi.fn();
  fatal = vi.fn();
  trace = vi.fn();
  addAppender = vi.fn();
  context = vi.fn(<Value>(value?: Value) => new LogContext(value));
}

class MockShell implements ShellInterface {
  exec = vi.fn();
  exists = vi.fn();
  mkdir = vi.fn();
  rm = vi.fn();
  pwd = vi.fn();
  cd = vi.fn();
}

interface TestScriptShared extends ScriptSharedInterface {
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
}

class TestPlugin extends ScriptPlugin<
  ScriptContext<TestScriptShared>,
  TestPluginProps
> {
  async onExec(
    _context: ExecutorContext<ScriptContext<TestScriptShared>>
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
      Object.assign(context, {
        options: {
          'test-plugin': {
            outputDir: './cmd-dist'
          }
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
      Object.assign(context, {
        options: {
          'test-plugin': {
            outputDir: './cmd-dist'
          }
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
        plugin.enabled(
          'onBefore',
          {} as ExecutorContext<ScriptContext<TestScriptShared>>
        )
      ).toBe(true);
    });

    it('should return false when skip is true', () => {
      const skipPlugin = new TestPlugin(context, 'test-plugin', { skip: true });
      expect(
        skipPlugin.enabled(
          'onBefore',
          {} as ExecutorContext<ScriptContext<TestScriptShared>>
        )
      ).toBe(false);
    });

    it('should return false only for specified lifecycle when skip is string', () => {
      const skipPlugin = new TestPlugin(context, 'test-plugin', {
        skip: 'onBefore'
      });
      expect(
        skipPlugin.enabled(
          'onBefore',
          {} as ExecutorContext<ScriptContext<TestScriptShared>>
        )
      ).toBe(false);
      expect(
        skipPlugin.enabled(
          'onExec',
          {} as ExecutorContext<ScriptContext<TestScriptShared>>
        )
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
      const execContext = {} as ExecutorContext<
        ScriptContext<TestScriptShared>
      >;
      await plugin.onExec?.(execContext);

      expect(mockLogger.info).toHaveBeenCalledWith('Test step');
      expect(mockLogger.info).toHaveBeenCalledWith('Test step - success');
    });
  });
});
