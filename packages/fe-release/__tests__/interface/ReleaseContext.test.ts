import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { Logger } from '@qlover/fe-utils';
import type { ReleaseConfig, ReleaseContextOptions } from '../../src/type';
import type {
  FeConfig,
  FeScriptContextOptions,
  ScriptContextOptions,
  Shell
} from '@qlover/scripts-context';
import ReleaseContext from '../../src/interface/ReleaseContext';
import { Env } from '@qlover/env-loader';

vi.mock('@qlover/env-loader', () => {
  return {
    Env: class {
      static searchEnv = vi.fn().mockImplementation(() => {
        return {
          get: vi.fn().mockImplementation((key: string) => {
            return process.env[key];
          }),
          set: vi.fn(),
          remove: vi.fn(),
          load: vi.fn(),
          getDestroy: vi.fn()
        };
      });
    }
  };
});

vi.mock('@qlover/scripts-context', () => {
  return {
    FeScriptContext: class {
      public readonly logger: Logger;
      public readonly shell: Shell;
      public readonly feConfig: FeConfig;
      public readonly dryRun: boolean;
      public readonly verbose: boolean;
      public readonly options: ScriptContextOptions<ReleaseConfig>;
      constructor(context: Required<FeScriptContextOptions<ReleaseConfig>>) {
        const { logger, shell, feConfig, dryRun, verbose, options } = context;
        this.logger = logger;
        this.shell = shell;
        this.feConfig = feConfig;
        this.dryRun = !!dryRun;
        this.verbose = !!verbose;
        this.options = options;
      }
    }
  };
});

describe('ReleaseContext', () => {
  let logger: Logger;
  let shell: Shell;
  let mockReleaseIt: ReturnType<typeof vi.fn>;
  let contextOptions: Required<ReleaseContextOptions>;

  beforeEach(() => {
    vi.clearAllMocks();

    logger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
      exec: vi.fn()
    } as unknown as Logger;

    shell = {
      exec: vi.fn()
    } as unknown as Shell;

    mockReleaseIt = vi.fn().mockResolvedValue({
      changelog: '## 1.0.0\n* Feature 1\n* Feature 2',
      version: '1.0.0'
    });

    contextOptions = {
      logger,
      shell,
      dryRun: false,
      verbose: false,
      options: {
        releaseIt: { releaseIt: mockReleaseIt }
      },
      shared: {
        packageJson: {
          name: 'test-package',
          version: '0.9.0'
        },
        releasePR: false
      },
      feConfig: {
        envOrder: ['.env.test', '.env']
      }
    };

    (Env.searchEnv as ReturnType<typeof vi.fn>).mockImplementation(() => {
      return {
        get: vi.fn().mockImplementation((key: string) => {
          return process.env[key];
        }),
        set: vi.fn(),
        remove: vi.fn(),
        load: vi.fn(),
        getDestroy: vi.fn()
      };
    });
  });

  describe('constructor', () => {
    it('should correctly initialize ReleaseContext instance', () => {
      const context = new ReleaseContext(contextOptions);
      expect(context).toBeInstanceOf(ReleaseContext);
      expect(Env.searchEnv).toHaveBeenCalled();
    });
  });

  describe('releasePR', () => {
    it('should return false when releasePR is false', () => {
      const context = new ReleaseContext(contextOptions);
      expect(context.releasePR).toBe(false);
    });

    it('should return true when releasePR is true', () => {
      contextOptions.shared!.releasePR = true;
      const context = new ReleaseContext(contextOptions);
      expect(context.releasePR).toBe(true);
    });
  });

  describe('setConfig', () => {
    it('should correctly merge configs', () => {
      const context = new ReleaseContext(contextOptions);
      const newConfig = {
        environment: {
          skipCheckPackage: true
        }
      };

      // @ts-expect-error
      context.setConfig(newConfig);

      // @ts-expect-error
      expect(context.options!.environment!.skipCheckPackage).toBe(true);
      expect(context.getPkg('name')).toBe('test-package');
    });
  });

  describe('getConfig', () => {
    it('should return the correct config value', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getPkg('name')).toBe('test-package');
      expect(context.getPkg('version')).toBe('0.9.0');
    });

    it('should return the default value when the config does not exist', () => {
      const context = new ReleaseContext(contextOptions);

      const defaultValue = 'default-value';
      expect(context.getConfig('nonExistentKey', defaultValue)).toBe(
        defaultValue
      );
    });
  });

  describe('getEnv', () => {
    it('should return the environment instance', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.env).toBeDefined();
    });
  });

  describe('getPkg', () => {
    it('should return the package.json value', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getPkg('name')).toBe('test-package');
      expect(context.getPkg('version')).toBe('0.9.0');
    });

    it('should return undefined when the package.json does not have the key', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getPkg('nonExistentKey')).toBeUndefined();
    });
  });

  describe('releasePackageName', () => {
    it('should return the correct package name', () => {
      const context = new ReleaseContext(contextOptions);
      expect(context.releasePackageName).toBe('test-package');
    });
  });

  describe('releasePublishPath', () => {
    it('should return undefined when publishPath is not set', () => {
      const context = new ReleaseContext(contextOptions);
      expect(context.releasePublishPath).toBeUndefined();
    });

    it('should return the correct path when publishPath is set', () => {
      contextOptions.shared!.publishPath = '/path/to/publish';
      const context = new ReleaseContext(contextOptions);
      expect(context.releasePublishPath).toBe('/path/to/publish');
    });
  });

  describe('rootPath', () => {
    it('should return the correct root path', () => {
      contextOptions.shared!.rootPath = '/root/path';
      const context = new ReleaseContext(contextOptions);
      expect(context.rootPath).toBe('/root/path');
    });

    it('should use the default value (current working directory) when rootPath is not set', () => {
      // delete the explicitly set rootPath
      if (contextOptions.shared!.rootPath) {
        delete contextOptions.shared!.rootPath;
      }
      const context = new ReleaseContext(contextOptions);
      expect(context.rootPath).toBe(process.cwd());
    });
  });

  describe('sourceBranch', () => {
    it('should return the correct source branch', () => {
      contextOptions.shared!.sourceBranch = 'feature/test';
      const context = new ReleaseContext(contextOptions);
      expect(context.sourceBranch).toBe('feature/test');
    });

    it('should use the default value when sourceBranch is not set', () => {
      // delete the explicitly set sourceBranch
      if (contextOptions.shared!.sourceBranch) {
        delete contextOptions.shared!.sourceBranch;
      }
      const context = new ReleaseContext(contextOptions);
      expect(context.sourceBranch).toBe('master'); // assume the default value is 'master'
    });

    it('should prioritize the value from the environment variable', () => {
      process.env.FE_RELEASE_BRANCH = 'env-branch';
      // delete the explicitly set sourceBranch
      if (contextOptions.shared!.sourceBranch) {
        delete contextOptions.shared!.sourceBranch;
      }
      const context = new ReleaseContext(contextOptions);
      expect(context.sourceBranch).toBe('env-branch');
      delete process.env.FE_RELEASE_BRANCH;
    });
  });

  describe('releaseEnv', () => {
    it('should return the correct release environment', () => {
      contextOptions.shared!.releaseEnv = 'production';
      const context = new ReleaseContext(contextOptions);
      expect(context.releaseEnv).toBe('production');
    });

    it('should use the default value when releaseEnv is not set', () => {
      // delete the explicitly set releaseEnv
      if (contextOptions.shared!.releaseEnv) {
        delete contextOptions.shared!.releaseEnv;
      }
      const context = new ReleaseContext(contextOptions);
      // because test env is 'test', NODE_ENV is 'test', so the default value is 'development'
      expect(context.releaseEnv).toBe('test');
    });

    it('should prioritize the value from the environment variable', () => {
      process.env.FE_RELEASE_ENV = 'staging';
      // delete the explicitly set releaseEnv
      if (contextOptions.shared!.releaseEnv) {
        delete contextOptions.shared!.releaseEnv;
      }
      const context = new ReleaseContext(contextOptions);
      expect(context.releaseEnv).toBe('staging');
      delete process.env.FE_RELEASE_ENV;
    });
  });

  describe('setShared', () => {
    it('should correctly merge shared configs', () => {
      const context = new ReleaseContext(contextOptions);
      const newShared = {
        publishPath: '/new/publish/path',
        releasePR: true
      };

      context.setShared(newShared);

      expect(context.releasePublishPath).toBe('/new/publish/path');
      expect(context.releasePR).toBe(true);
    });
  });
});
