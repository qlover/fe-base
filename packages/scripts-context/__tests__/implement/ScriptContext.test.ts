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
import ScriptContext from '../../src/implement/ScriptContext';
import { Env } from '@qlover/env-loader';
import { Logger } from '@qlover/logger';
import { Shell } from '../../src/implement/Shell';
import type { ScriptSharedInterface } from '../../src/interface/ScriptSharedInterface';

interface TestOptions extends ScriptSharedInterface {
  testValue?: string;
  nested?: {
    value?: string;
  };
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
  });
});
