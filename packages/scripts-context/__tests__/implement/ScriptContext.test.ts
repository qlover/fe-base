/**
 * ScriptContext test suite
 *
 * Coverage:
 * 1. constructor       - Constructor initialization and validation
 * 2. env              - Environment variable management
 * 3. options          - Options management and defaults
 * 4. getEnv           - Environment variable retrieval
 * 5. getOptions       - Options retrieval with path support
 * 6. setOptions       - Options update functionality
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ScriptContext } from '../../src/implement/ScriptContext';
import { Env } from '@qlover/env-loader';
import { Logger } from '@qlover/logger';
import { Shell } from '../../src/implement/Shell';
import type { ScriptSharedInterface } from '../../src/interface/ScriptSharedInterface';

interface TestOptions extends ScriptSharedInterface {
  testValue?: string;
  nested?: {
    value?: string;
  };
  build?: {
    target?: string;
    minify?: boolean;
    sourcemap?: boolean;
  };
  deploy?: {
    aws?: {
      region?: string;
    };
  };
  option1?: string;
  option2?: string;
  option3?: string;
  [key: string]: unknown;
}

interface MockEnvVars {
  TEST_VAR: string;
  FE_RELEASE_BRANCH: string;
  [key: string]: string | undefined;
}

describe('ScriptContext', () => {
  // Test data and mock objects
  let context: ScriptContext<TestOptions>;
  let mockLogger: Logger;
  let mockShell: Shell;
  let mockEnv: Env;

  // Mock environment variables
  const mockEnvVars: MockEnvVars = {
    TEST_VAR: 'test_value',
    FE_RELEASE_BRANCH: 'develop'
  };

  beforeEach(() => {
    // Setup mocks
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    } as unknown as Logger;

    mockShell = {
      exec: vi.fn(),
      execSync: vi.fn()
    } as unknown as Shell;

    mockEnv = {
      get: vi.fn((key: string) => mockEnvVars[key]),
      set: vi.fn(),
      has: vi.fn()
    } as unknown as Env;

    // Initialize context with test configuration
    context = new ScriptContext<TestOptions>('test-script', {
      logger: mockLogger,
      shell: mockShell,
      options: {
        env: mockEnv,
        testValue: 'initial',
        rootPath: '/test/path'
      }
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with valid parameters', () => {
      expect(context).toBeInstanceOf(ScriptContext);
      expect(context.name).toBe('test-script');
      expect(context.logger).toBe(mockLogger);
      expect(context.shell).toBe(mockShell);
    });

    it('should throw error when name is not provided', () => {
      expect(() => new ScriptContext<TestOptions>('', {})).toThrow(
        'ScriptContext name is required'
      );

      expect(
        () => new ScriptContext<TestOptions>(null as unknown as string, {})
      ).toThrow('ScriptContext name is required');
    });

    it('should initialize with default options when not provided', () => {
      const defaultContext = new ScriptContext('default-test');
      expect(defaultContext.options).toBeDefined();
      expect(defaultContext.logger).toBeDefined();
      expect(defaultContext.shell).toBeDefined();
    });
  });

  describe('env', () => {
    it('should return env instance when available', () => {
      expect(context.env).toStrictEqual(mockEnv);
    });

    it('should throw error when env is not initialized', () => {
      const contextWithoutEnv = new ScriptContext<TestOptions>('test-script');
      // Force env to be undefined
      contextWithoutEnv.options.env = undefined;
      expect(() => contextWithoutEnv.env).toThrow(
        'Environment is not initialized'
      );
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      const value = context.getEnv('TEST_VAR');
      expect(value).toBe('test_value');
      expect(mockEnv.get).toHaveBeenCalledWith('TEST_VAR');
    });

    it('should return default value when env variable not found', () => {
      const defaultValue = 'default';
      const value = context.getEnv('NON_EXISTENT', defaultValue);
      expect(value).toBe(defaultValue);
    });
  });

  describe('getOptions', () => {
    beforeEach(() => {
      context.setOptions({
        testValue: 'test',
        nested: {
          value: 'nested-value'
        }
      });
    });

    it('should return all options when no key provided', () => {
      const options = context.getOptions();
      expect(options).toEqual(context.options);
    });

    it('should return specific option value by key', () => {
      const value = context.getOptions('testValue');
      expect(value).toBe('test');
    });

    it('should return nested option value by path', () => {
      const value = context.getOptions(['nested', 'value']);
      expect(value).toBe('nested-value');
    });

    it('should return default value when option not found', () => {
      const defaultValue = 'default';
      const value = context.getOptions('nonExistent', defaultValue);
      expect(value).toBe(defaultValue);
    });
  });

  describe('setOptions', () => {
    it('should merge new options with existing ones', () => {
      const newOptions = {
        testValue: 'updated',
        nested: {
          value: 'new-nested'
        }
      };

      context.setOptions(newOptions);

      expect(context.options.testValue).toBe('updated');
      expect(context.options.nested?.value).toBe('new-nested');
      // Should preserve existing options
      expect(context.options.env).toStrictEqual(mockEnv);
    });

    it('should handle partial updates', () => {
      const initialValue = context.options.testValue;
      context.setOptions({
        nested: {
          value: 'partial-update'
        }
      });

      expect(context.options.testValue).toBe(initialValue);
      expect(context.options.nested?.value).toBe('partial-update');
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow with options and env', () => {
      // Setup initial state
      context.setOptions({
        testValue: 'initial',
        rootPath: '/test/path'
      });

      // Update options
      context.setOptions({
        testValue: 'updated'
      });

      // Verify environment and options interaction
      const envValue = context.getEnv('TEST_VAR');
      const optionValue = context.getOptions('testValue');

      expect(envValue).toBe('test_value');
      expect(optionValue).toBe('updated');
    });

    it('should handle source branch resolution', () => {
      // Test branch resolution priority
      const branchContext = new ScriptContext<TestOptions>('test-script', {
        options: {
          env: mockEnv
        }
      });

      expect(branchContext.options.sourceBranch).toBe('develop');

      // Clear FE_RELEASE_BRANCH and test fallback
      vi.spyOn(mockEnv, 'get').mockImplementation((key: string) => {
        if (key === 'FE_RELEASE_BRANCH') return undefined;
        if (key === 'FE_RELEASE_SOURCE_BRANCH') return 'fallback';
        return mockEnvVars[key];
      });

      const fallbackContext = new ScriptContext<TestOptions>('test-script', {
        options: {
          env: mockEnv
        }
      });

      expect(fallbackContext.options.sourceBranch).toBe('fallback');
    });

    it('should handle default branch fallback', () => {
      const mockEnvWithoutBranch = {
        get: vi.fn(() => undefined)
      } as unknown as Env;

      const defaultBranchContext = new ScriptContext<TestOptions>(
        'test-script',
        {
          options: {
            env: mockEnvWithoutBranch
          }
        }
      );

      expect(defaultBranchContext.options.sourceBranch).toBe('master');
    });
  });

  describe('feConfig integration', () => {
    it('should merge feConfig with defaults', () => {
      const customContext = new ScriptContext<TestOptions>('test-script', {
        feConfig: {
          protectedBranches: ['main', 'develop'],
          customOption: 'custom-value'
        },
        options: {
          env: mockEnv
        }
      });

      // feConfig merges with defaults, so it includes default protectedBranches
      expect(customContext.feConfig.protectedBranches).toContain('main');
      expect(customContext.feConfig.protectedBranches).toContain('develop');
      expect(customContext.feConfig.customOption).toBe('custom-value');
    });

    it('should access feConfig through context', () => {
      expect(context.feConfig).toBeDefined();
      expect(context.feConfig).toHaveProperty('protectedBranches');
    });
  });

  describe('dryRun and verbose flags', () => {
    it('should set dryRun flag', () => {
      const dryRunContext = new ScriptContext<TestOptions>('test-script', {
        dryRun: true,
        options: {
          env: mockEnv
        }
      });

      expect(dryRunContext.dryRun).toBe(true);
    });

    it('should set verbose flag', () => {
      const verboseContext = new ScriptContext<TestOptions>('test-script', {
        verbose: true,
        options: {
          env: mockEnv
        }
      });

      expect(verboseContext.verbose).toBe(true);
    });

    it('should default dryRun and verbose to false', () => {
      const defaultContext = new ScriptContext<TestOptions>('test-script', {
        options: {
          env: mockEnv
        }
      });

      expect(defaultContext.dryRun).toBe(false);
      expect(defaultContext.verbose).toBe(false);
    });
  });

  describe('options property', () => {
    it('should return options through options property', () => {
      const options = context.options;
      expect(options).toBeDefined();
      expect(options.env).toBe(mockEnv);
    });

    it('should maintain reference to parameters', () => {
      const options1 = context.options;
      const options2 = context.options;
      expect(options1).toBe(options2);
    });
  });

  describe('getOptions with string path', () => {
    beforeEach(() => {
      context.setOptions({
        build: {
          target: 'production',
          minify: true
        }
      });
    });

    it('should access nested options with string path', () => {
      const target = context.getOptions('build.target');
      expect(target).toBe('production');
    });

    it('should access deeply nested options', () => {
      context.setOptions({
        deploy: {
          aws: {
            region: 'us-east-1'
          }
        }
      });

      const region = context.getOptions('deploy.aws.region');
      expect(region).toBe('us-east-1');
    });
  });

  describe('setOptions deep merge', () => {
    it('should deep merge nested objects', () => {
      context.setOptions({
        build: {
          target: 'production',
          minify: true
        }
      });

      context.setOptions({
        build: {
          sourcemap: false
        }
      });

      const buildOptions = context.getOptions('build');
      expect(buildOptions).toEqual({
        target: 'production',
        minify: true,
        sourcemap: false
      });
    });

    it('should preserve unrelated options', () => {
      context.setOptions({
        option1: 'value1',
        option2: 'value2'
      });

      context.setOptions({
        option3: 'value3'
      });

      expect(context.getOptions('option1')).toBe('value1');
      expect(context.getOptions('option2')).toBe('value2');
      expect(context.getOptions('option3')).toBe('value3');
    });
  });
});
