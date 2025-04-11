import '../MockReleaseContextDep';

import { describe, it, expect, vi, beforeEach } from 'vitest';
import Plugin from '../../src/plugins/Plugin';
import { createTestReleaseContext } from '../helpers';
import type { ReleaseContext } from '../../src';
import type { DeepPartial } from '../../src/type';

interface TestPluginProps {
  testValue: string;
  nestedConfig?: {
    value: string;
  };
}

class TestPlugin extends Plugin<TestPluginProps> {
  constructor(
    context: ReleaseContext,
    props: TestPluginProps = { testValue: 'default' }
  ) {
    super(context, 'test-plugin', props);
  }

  async testStep<T>(label: string, task: () => Promise<T>): Promise<T> {
    return this.step({ label, task });
  }
}

describe('Plugin Class', () => {
  let context: ReleaseContext;
  let plugin: TestPlugin;
  let defaultProps: TestPluginProps;

  beforeEach(() => {
    context = createTestReleaseContext();
    defaultProps = { testValue: 'test-value' };
    plugin = new TestPlugin(context, defaultProps);
  });

  describe('init and config', () => {
    it('should use the correct plugin name and properties to initialize', () => {
      expect(plugin.pluginName).toBe('test-plugin');
      expect(plugin.options.testValue).toBe('test-value');
    });

    it('should set onlyOne to true', () => {
      expect(plugin.onlyOne).toBe(true);
    });

    it('should merge command line config and plugin config', () => {
      const contextWithOptions = createTestReleaseContext({
        options: {
          // @ts-expect-error
          'test-plugin': {
            testValue: 'cli-value'
          }
        }
      });

      const pluginWithCliConfig = new TestPlugin(
        contextWithOptions,
        defaultProps
      );
      expect(pluginWithCliConfig.options.testValue).toBe('cli-value');
    });

    it('getInitialProps should correctly merge config items', () => {
      const props = { testValue: 'prop-value' };
      const contextWithOptions = createTestReleaseContext({
        options: {
          // @ts-expect-error
          'test-plugin': {
            nestedConfig: {
              value: 'nested-cli-value'
            }
          }
        }
      });

      const pluginWithMergedConfig = new TestPlugin(contextWithOptions, props);

      expect(pluginWithMergedConfig.options.testValue).toBe('prop-value');
      expect(pluginWithMergedConfig.options.nestedConfig?.value).toBe(
        'nested-cli-value'
      );
    });
  });

  describe('config get and set', () => {
    it('should be able to get config', () => {
      expect(plugin.getConfig()).toEqual(defaultProps);
    });

    it('should be able to get nested config', () => {
      const pluginWithNestedConfig = new TestPlugin(context, {
        testValue: 'test',
        nestedConfig: { value: 'nested-value' }
      });

      expect(pluginWithNestedConfig.getConfig('nestedConfig')).toEqual({
        value: 'nested-value'
      });
      expect(pluginWithNestedConfig.getConfig(['nestedConfig', 'value'])).toBe(
        'nested-value'
      );
    });

    it('should be able to set config', () => {
      const newConfig: DeepPartial<TestPluginProps> = {
        testValue: 'new-value'
      };

      plugin.setConfig(newConfig);
      expect(plugin.getConfig('testValue')).toBe('new-value');
    });
  });

  describe('tool properties accessor', () => {
    it('should be able to access logger', () => {
      expect(plugin.logger).toBeDefined();
      expect(plugin.logger.info).toBeDefined();
    });

    it('should be able to access shell', () => {
      expect(plugin.shell).toBeDefined();
      expect(plugin.shell.exec).toBeDefined();
    });

    it('should be able to get env', () => {
      const mockEnvValue = 'test-env-value';
      vi.spyOn(context.env, 'get').mockReturnValue(mockEnvValue);

      expect(plugin.getEnv('TEST_KEY')).toBe(mockEnvValue);
      expect(context.env.get).toHaveBeenCalledWith('TEST_KEY');
    });

    it('should be able to get env', () => {
      const defaultEnvValue = 'default-env-value';
      vi.spyOn(context.env, 'get').mockReturnValue(undefined);

      expect(plugin.getEnv('NON_EXISTENT_KEY', defaultEnvValue)).toBe(
        defaultEnvValue
      );
    });
  });

  describe('lifecycle methods', () => {
    it('default enabled method should return true', () => {
      expect(plugin.enabled()).toBe(true);
    });

    it('should have optional lifecycle methods', () => {
      expect(typeof plugin.onBefore).toBe('function');
      expect(typeof plugin.onExec).toBe('function');
      expect(typeof plugin.onSuccess).toBe('function');
      expect(typeof plugin.onError).toBe('function');
    });
  });

  describe('step method', () => {
    it('should successfully execute the task and record the step', async () => {
      const expectedResult = 'task-result';
      const task = vi.fn().mockResolvedValue(expectedResult);

      const result = await plugin.testStep('Test Step', task);

      expect(result).toBe(expectedResult);
      expect(task).toHaveBeenCalled();
      expect(plugin.logger.obtrusive).toHaveBeenCalledWith('Test Step');
      expect(plugin.logger.info).toHaveBeenCalledWith('Test Step - success');
    });

    it('should handle task failure and record error', async () => {
      const taskError = new Error('Task failed');
      const task = vi.fn().mockRejectedValue(taskError);

      await expect(plugin.testStep('Failing Step', task)).rejects.toThrow(
        taskError
      );

      expect(task).toHaveBeenCalled();
      expect(plugin.logger.obtrusive).toHaveBeenCalledWith('Failing Step');
      expect(plugin.logger.error).toHaveBeenCalledWith(taskError);
    });
  });
});
