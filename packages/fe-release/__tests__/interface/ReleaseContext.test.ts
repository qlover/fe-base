import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
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
          get: vi.fn(),
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
    process.env = { ...process.env };

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
        releaseIt: mockReleaseIt,
        environment: {
          packageJson: {
            name: 'test-package',
            version: '0.9.0'
          },
          releasePR: false
        }
      },
      feConfig: {
        envOrder: ['.env.test', '.env']
      }
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
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
      contextOptions.options!.environment!.releasePR = true;
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

      context.setConfig(newConfig);

      expect(context.options!.environment!.skipCheckPackage).toBe(true);
      expect(context.options!.environment!.packageJson?.name).toBe(
        'test-package'
      );
    });
  });

  describe('getConfig', () => {
    it('should return the correct config value', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getConfig('environment.packageJson.name')).toBe(
        'test-package'
      );
      expect(context.getConfig(['environment', 'packageJson', 'version'])).toBe(
        '0.9.0'
      );
    });

    it('should return the default value when the config does not exist', () => {
      const context = new ReleaseContext(contextOptions);

      const defaultValue = 'default-value';
      expect(context.getConfig('nonExistentKey', defaultValue)).toBe(
        defaultValue
      );
    });
  });

  describe('getInitEnv', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      (Env.searchEnv as ReturnType<typeof vi.fn>).mockImplementation(() => {
        return {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          load: vi.fn(),
          getDestroy: vi.fn()
        };
      });
    });

    it('should use feConfig.envOrder to initialize environment', () => {
      const context = new ReleaseContext(contextOptions);

      expect(Env.searchEnv).toHaveBeenCalledWith({
        logger: context.logger,
        preloadList: ['.env.test', '.env']
      });
    });

    it('should record an error and return a default Env instance when initialization fails', () => {
      (Env.searchEnv as ReturnType<typeof vi.fn>).mockImplementation(() => {
        throw new Error('Failed to initialize environment');
      });

      const context = new ReleaseContext(contextOptions);

      expect(logger.error).toHaveBeenCalledWith(
        'Failed to initialize environment:',
        expect.any(Error)
      );
      expect(context.env).toBeDefined();
    });
  });

  describe('getEnv', () => {
    beforeEach(() => {
      (Env.searchEnv as ReturnType<typeof vi.fn>).mockImplementation(() => {
        return {
          get: vi.fn(),
          set: vi.fn(),
          remove: vi.fn(),
          load: vi.fn(),
          getDestroy: vi.fn()
        };
      });
    });

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
});
