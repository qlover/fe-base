/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import ScriptContext from '../../src/plugin/ScriptContext';
import { ScriptShared } from '../../src/plugin/ScriptShared';
import { Env } from '@qlover/env-loader';
import { FeScriptContext } from '../../src/implement/ScriptContext';

// Mock dependencies
vi.mock('../../src/implement/ScriptContext');

interface TestOptions extends ScriptShared {
  testProp?: string;
  nested?: {
    value?: string;
    deep?: {
      property: string;
    };
  };
  array?: string[];
  nullValue?: null;
  undefinedValue?: undefined;
  circular?: any;
  step1?: string;
  step2?: string;
  [key: string]: any; // Allow additional properties for testing
}

describe('ScriptContext', () => {
  let mockEnv: any;
  let mockLogger: any;
  let mockShell: any;
  let mockFeConfig: any;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Mock Env
    mockEnv = {
      get: vi.fn(),
      searchEnv: vi.fn()
    };
    (Env.searchEnv as Mock).mockReturnValue(mockEnv);

    // Mock logger
    mockLogger = {
      log: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      debug: vi.fn()
    };

    // Mock shell
    mockShell = {
      exec: vi.fn(),
      run: vi.fn()
    };

    // Mock feConfig
    mockFeConfig = {
      envOrder: ['.env.local', '.env'],
      release: {
        branch: 'main',
        version: '1.0.0'
      }
    };

    // Mock FeScriptContext
    (FeScriptContext as any).mockImplementation(function (
      this: any,
      opts: any
    ) {
      this.logger = mockLogger;
      this.shell = mockShell;
      this.feConfig = mockFeConfig;
      this.options = opts?.options || {};
    });
  });

  describe('constructor', () => {
    it('should create ScriptContext with default options', () => {
      const context = new ScriptContext<TestOptions>({});

      expect(context).toBeInstanceOf(ScriptContext);
      expect(FeScriptContext).toHaveBeenCalledWith({});
    });

    it('should merge rootProp from feConfig when rootPropName is provided', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          rootPropName: 'release'
        }
      });

      // Data from rootProp should be available in store
      const store = context.getStore();
      expect(store).toMatchObject(
        expect.objectContaining({
          branch: 'main',
          version: '1.0.0'
        })
      );
    });

    it('should use entire feConfig when rootPropName is not provided', () => {
      const context = new ScriptContext<TestOptions>();

      // When no rootPropName, feConfig should be used as rootProp
      const store = context.getStore();
      expect(store).toMatchObject(
        expect.objectContaining({
          envOrder: ['.env.local', '.env']
        })
      );
    });

    it('should handle nested rootPropName that points to primitive value', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          rootPropName: ['release', 'branch']
        }
      });

      // When rootPropName points to a primitive value like 'main',
      // it should warn and use empty object, so store will be empty
      // but options should contain default values
      expect(mockLogger.warn).toHaveBeenCalledWith(
        expect.stringContaining('rootProp')
      );

      // Check that default options are set
      expect(context.options).toMatchObject(
        expect.objectContaining({
          sourceBranch: 'master',
          rootPath: process.cwd()
        })
      );
    });
  });

  describe('env getter', () => {
    it('should return env when it exists', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      expect(context.env).toBe(mockEnv);
    });

    it('should throw error when env is not initialized', () => {
      const context = new ScriptContext<TestOptions>({});
      context.options.env = undefined;
      expect(() => context.env).toThrow('Environment is not initialized');
    });
  });

  describe('getDefaultOptions', () => {
    it('should return default options with master branch', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockReturnValue(undefined);

      const defaultOptions = (context as any).getDefaultOptions({});

      expect(defaultOptions).toMatchObject({
        sourceBranch: 'master',
        rootPath: process.cwd(),
        env: mockEnv
      });
    });

    it('should use FE_RELEASE_BRANCH when available', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockImplementation((key: string) => {
        if (key === 'FE_RELEASE_BRANCH') return 'develop';
        return undefined;
      });

      const defaultOptions = (context as any).getDefaultOptions({});

      expect(defaultOptions.sourceBranch).toBe('develop');
    });

    it('should use FE_RELEASE_SOURCE_BRANCH when FE_RELEASE_BRANCH is not available', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockImplementation((key: string) => {
        if (key === 'FE_RELEASE_SOURCE_BRANCH') return 'feature/test';
        return undefined;
      });

      const defaultOptions = (context as any).getDefaultOptions({});

      expect(defaultOptions.sourceBranch).toBe('feature/test');
    });

    it('should preserve provided options', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      const props: TestOptions = {
        testProp: 'test-value',
        sourceBranch: 'custom-branch'
      };

      const defaultOptions = (context as any).getDefaultOptions(props);

      expect(defaultOptions).toMatchObject({
        testProp: 'test-value',
        sourceBranch: 'custom-branch',
        rootPath: process.cwd(),
        env: mockEnv
      });
    });

    it('should create new Env when not provided', () => {
      const context = new ScriptContext<TestOptions>({});

      (context as any).getDefaultOptions({});

      expect(Env.searchEnv).toHaveBeenCalledWith({
        logger: mockLogger,
        preloadList: ['.env.local', '.env']
      });
    });

    it('should use custom envOrder from feConfig', () => {
      mockFeConfig.envOrder = ['.env.production', '.env.staging'];
      const context = new ScriptContext<TestOptions>({});

      (context as any).getDefaultOptions({});

      expect(Env.searchEnv).toHaveBeenCalledWith({
        logger: mockLogger,
        preloadList: ['.env.production', '.env.staging']
      });
    });

    it('should use custom rootPath when provided', () => {
      const customPath = '/custom/path';
      const context = new ScriptContext<TestOptions>({
        options: {
          rootPath: customPath,
          env: mockEnv
        }
      });

      const defaultOptions = (context as any).getDefaultOptions({
        rootPath: customPath
      });

      expect(defaultOptions.rootPath).toBe(customPath);
    });
  });

  describe('setOptions', () => {
    it('should merge new options with existing ones', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          testProp: 'original'
        }
      });

      context.setOptions({
        testProp: 'updated',
        nested: { value: 'new' }
      });

      expect(context.options).toMatchObject({
        testProp: 'updated',
        nested: { value: 'new' }
      });
    });

    it('should handle deep merge correctly', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          nested: { value: 'original' }
        }
      });

      context.setOptions({
        testProp: 'new'
      });

      expect(context.options).toMatchObject({
        nested: { value: 'original' },
        testProp: 'new'
      });
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockReturnValue('test-value');

      const result = context.getEnv('TEST_KEY');

      expect(result).toBe('test-value');
      expect(mockEnv.get).toHaveBeenCalledWith('TEST_KEY');
    });

    it('should return default value when env variable is not set', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockReturnValue(undefined);

      const result = context.getEnv('TEST_KEY', 'default-value');

      expect(result).toBe('default-value');
    });

    it('should return undefined when no default value is provided', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockReturnValue(undefined);

      const result = context.getEnv('TEST_KEY');

      expect(result).toBeUndefined();
    });
  });

  describe('setStore', () => {
    it('should merge config into store', () => {
      const context = new ScriptContext<TestOptions>({});

      context.setStore({
        testProp: 'test-value'
      });

      expect(context.getStore('testProp')).toBe('test-value');
    });

    it('should handle deep merge in store', () => {
      const context = new ScriptContext<TestOptions>({});

      context.setStore({
        nested: { value: 'original' }
      });

      context.setStore({
        testProp: 'new'
      });

      expect(context.getStore()).toMatchObject({
        nested: { value: 'original' },
        testProp: 'new'
      });
    });
  });

  describe('getStore', () => {
    it('should return entire store when no key is provided', () => {
      const context = new ScriptContext<TestOptions>({});
      context.setStore({ testProp: 'test' });

      const store = context.getStore();

      expect(store).toMatchObject({
        testProp: 'test'
      });
    });

    it('should return value for string key', () => {
      const context = new ScriptContext<TestOptions>({});
      context.setStore({ testProp: 'test-value' });

      const result = context.getStore('testProp');

      expect(result).toBe('test-value');
    });

    it('should return value for array key path', () => {
      const context = new ScriptContext<TestOptions>({});
      context.setStore({
        nested: {
          value: 'nested-value'
        }
      });

      const result = context.getStore(['nested', 'value']);

      expect(result).toBe('nested-value');
    });

    it('should return default value when key is not found', () => {
      const context = new ScriptContext<TestOptions>({});

      const result = context.getStore('nonexistent', 'default-value');

      expect(result).toBe('default-value');
    });

    it('should handle deep nested paths', () => {
      const context = new ScriptContext<TestOptions>({});
      context.setStore({
        nested: {
          deep: {
            property: 'deep-value'
          }
        }
      });

      const result = context.getStore(['nested', 'deep', 'property']);

      expect(result).toBe('deep-value');
    });

    it('should return undefined for non-existent nested path', () => {
      const context = new ScriptContext<TestOptions>({});

      const result = context.getStore(['nonexistent', 'path']);

      expect(result).toBeUndefined();
    });

    it('should handle array access in store', () => {
      const context = new ScriptContext<TestOptions>({});
      context.setStore({
        array: ['item1', 'item2']
      });

      const result = context.getStore('array');

      expect(result).toEqual(['item1', 'item2']);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty options gracefully', () => {
      expect(() => {
        new ScriptContext<TestOptions>({});
      }).not.toThrow();
    });

    it('should handle null/undefined values in store operations', () => {
      const context = new ScriptContext<TestOptions>({});

      expect(() => {
        context.setStore({
          nullValue: null,
          undefinedValue: undefined
        });
      }).not.toThrow();

      expect(context.getStore('nullValue')).toBeNull();
      expect(context.getStore('undefinedValue')).toBeUndefined();
    });

    it('should handle circular references in store data', () => {
      const context = new ScriptContext<TestOptions>({});
      const circularObj: any = { prop: 'value' };
      circularObj.self = circularObj;

      expect(() => {
        context.setStore({
          circular: circularObj
        });
      }).not.toThrow();
    });

    it('should handle very deep nested paths', () => {
      const context = new ScriptContext<TestOptions>({});
      const deepPath = Array.from({ length: 10 }, (_, i) => `level${i}`);

      let deepObj: any = { value: 'deep-value' };
      for (let i = deepPath.length - 1; i >= 0; i--) {
        deepObj = { [deepPath[i]]: deepObj };
      }

      context.setStore(deepObj);

      const result = context.getStore([...deepPath, 'value']);
      expect(result).toBe('deep-value');
    });

    it('should handle special characters in keys', () => {
      const context = new ScriptContext<TestOptions>({});
      const specialKey = 'key-with.special@chars#';

      context.setStore({
        [specialKey]: 'special-value'
      });

      expect(context.getStore(specialKey)).toBe('special-value');
    });
  });

  describe('integration scenarios', () => {
    it('should work with real-world configuration', () => {
      const realWorldConfig = {
        release: {
          branch: 'main',
          version: '2.1.0',
          tags: ['latest', 'stable'],
          build: {
            target: 'production',
            optimization: true
          }
        },
        deployment: {
          staging: {
            url: 'https://staging.example.com',
            env: 'staging'
          },
          production: {
            url: 'https://production.example.com',
            env: 'production'
          }
        }
      };

      mockFeConfig = realWorldConfig;

      const context = new ScriptContext<TestOptions>({
        options: {
          rootPropName: 'release',
          env: mockEnv
        }
      });

      expect(context.getStore('branch')).toBe('main');
      expect(context.getStore('version')).toBe('2.1.0');
      expect(context.getStore(['build', 'target'])).toBe('production');
      expect(context.getStore(['build', 'optimization'])).toBe(true);
    });

    it('should handle multiple environment variable sources', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      mockEnv.get.mockImplementation((key: string) => {
        const envVars: Record<string, string> = {
          FE_RELEASE_BRANCH: 'main',
          NODE_ENV: 'production',
          BUILD_TARGET: 'dist',
          DEPLOY_ENV: 'staging'
        };
        return envVars[key];
      });

      expect(context.getEnv('FE_RELEASE_BRANCH')).toBe('main');
      expect(context.getEnv('NODE_ENV')).toBe('production');
      expect(context.getEnv('BUILD_TARGET')).toBe('dist');
      expect(context.getEnv('DEPLOY_ENV')).toBe('staging');
    });

    it('should support chaining operations', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          env: mockEnv
        }
      });

      // Chain multiple operations
      context.setStore({ step1: 'completed' });
      context.setOptions({ testProp: 'updated' });
      context.setStore({ step2: 'completed' });

      expect(context.getStore('step1')).toBe('completed');
      expect(context.getStore('step2')).toBe('completed');
      expect(context.options.testProp).toBe('updated');
    });

    it('should maintain separation between store and options', () => {
      const context = new ScriptContext<TestOptions>({
        options: {
          testProp: 'option-value'
        }
      });

      context.setStore({
        testProp: 'store-value'
      });

      // Store and options should be separate
      expect(context.getStore('testProp')).toBe('store-value');
      expect(context.options.testProp).toBe('option-value');
    });
  });
});
