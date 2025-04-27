import '../MockReleaseContextDep';
import type { ReleaseConfig, ReleaseContextOptions } from '../../src/type';
import ReleaseContext from '../../src/implments/ReleaseContext';

import { createTestReleaseContext } from '../helpers';
import { Env } from '@qlover/env-loader';

describe.skip('ReleaseContext', () => {
  const defaultPackageJson = {
    name: 'test-package-name',
    version: '99.1020-test'
  };
  let contextOptions: ReleaseContextOptions<ReleaseConfig>;

  beforeEach(() => {
    vi.clearAllMocks();

    contextOptions = createTestReleaseContext({
      options: {
        workspaces: {
          workspace: {
            packageJson: defaultPackageJson
          }
        }
      }
    });
  });

  describe('constructor', () => {
    it('should correctly initialize ReleaseContext instance', async () => {
      const context = new ReleaseContext(contextOptions);
      expect(context).toBeInstanceOf(ReleaseContext);
      expect(Env.searchEnv).toHaveBeenCalled();
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
      expect(context.getPkg('name')).toBe(defaultPackageJson.name);
    });
  });

  describe('getConfig', () => {
    it('should return the correct config value', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getPkg('name')).toBe(defaultPackageJson.name);
      expect(context.getPkg('version')).toBe(defaultPackageJson.version);
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

      expect(context.getPkg('name')).toBe(defaultPackageJson.name);
      expect(context.getPkg('version')).toBe(defaultPackageJson.version);
    });

    it('should return undefined when the package.json does not have the key', () => {
      const context = new ReleaseContext(contextOptions);

      expect(context.getPkg('nonExistentKey')).toBeUndefined();
    });
  });

  describe('releasePublishPath', () => {
    it('should return undefined when publishPath is not set', () => {
      const context = new ReleaseContext(contextOptions);
      expect(context.workspace!.path).toBeUndefined();
    });

    it('should return the correct path when publishPath is set', () => {
      const context = new ReleaseContext(contextOptions);
      context.setShared({
        publishPath: '/path/to/publish'
      });
      expect(context.shared.publishPath).toBe('/path/to/publish');
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
        publishPath: '/new/publish/path'
      };

      context.setShared(newShared);

      expect(context.shared.publishPath).toBe('/new/publish/path');
    });
  });
});
