import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock
} from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import CheckEnvironment from '../../src/plugins/CheckEnvironment';
import ReleaseContext from '../../src/interface/ReleaseContext';
import { DEFAULT_SOURCE_BRANCH } from '../../src/defaults';

// 模拟 fs 和 path 模块
vi.mock('node:fs', () => ({
  readFileSync: vi.fn()
}));

vi.mock('node:path', () => ({
  join: vi.fn(),
  resolve: vi.fn((path) => path)
}));

describe('CheckEnvironment', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let context: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let releaseIt: any;
  let checkEnv: CheckEnvironment;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();

    // 模拟 context
    context = {
      options: {
        rootPath: '/test/root',
        skipCheckPackage: false
      },
      getConfig: vi.fn(),
      setConfig: vi.fn(),
      getEnv: vi.fn().mockReturnValue({
        get: vi.fn().mockImplementation((key: string) => {
          if (key === 'FE_RELEASE') return 'true';
          if (key === 'FE_RELEASE_BRANCH') return 'main';
          return undefined;
        })
      }),
      logger: {
        verbose: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        obtrusive: vi.fn()
      },
      shell: {
        exec: vi.fn().mockResolvedValue('')
      }
    };

    // 模拟 releaseIt
    releaseIt = {};

    // 默认配置
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'publishPath') return './';
      if (key === 'sourceBranch') return 'main';
      if (key === 'packageJson')
        return { name: 'test-package', version: '1.0.0' };
      if (key === 'rootPath') return '/test/root';
      return undefined;
    });

    // 模拟 readFileSync 返回一个有效的 package.json
    (readFileSync as Mock).mockReturnValue(
      JSON.stringify({ name: 'test-package', version: '1.0.0' })
    );

    // 模拟 join 函数
    (join as Mock).mockImplementation((...args: string[]) => args.join('/'));

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should initialize with the correct plugin name', () => {
    expect(checkEnv.pluginName).toBe('check-environment');
  });

  it('should throw an error if releaseIt is not provided', () => {
    expect(
      () => new CheckEnvironment(context as unknown as ReleaseContext)
    ).toThrow('releaseIt is required');
  });

  it('should throw an error if rootPath is not set', () => {
    context.options.rootPath = undefined;
    expect(
      () =>
        new CheckEnvironment(context as unknown as ReleaseContext, releaseIt)
    ).toThrow('rootPath is not set');
  });

  it('should throw an error if FE_RELEASE is set to false', () => {
    context.getEnv().get.mockImplementation((key: string) => {
      if (key === 'FE_RELEASE') return 'false';
      return undefined;
    });

    expect(
      () =>
        new CheckEnvironment(context as unknown as ReleaseContext, releaseIt)
    ).toThrow('Skip Release');
  });

  // it('should throw an error if packageJson is not found', () => {
  //   // 模拟 readFileSync 抛出错误
  //   (readFileSync as Mock).mockImplementation(() => {
  //     return undefined;
  //   });

  //   expect(
  //     () =>
  //       new CheckEnvironment(context as unknown as ReleaseContext, releaseIt)
  //   ).toThrow('package.json is not found in ./');
  // });

  it('should call setConfig with the correct values', () => {
    expect(context.setConfig).toHaveBeenCalledWith({
      publishPath: './',
      sourceBranch: 'main',
      packageJson: { name: 'test-package', version: '1.0.0' },
      rootPath: '/test/root'
    });
  });

  it('should get source branch from context options', () => {
    context.options.sourceBranch = 'develop';
    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const sourceBranch = checkEnv.getSourceBranch();
    expect(sourceBranch).toBe('develop');
  });

  it('should get source branch from environment variables', () => {
    context.options.sourceBranch = undefined;
    context.getEnv().get.mockImplementation((key: string) => {
      if (key === 'FE_RELEASE_BRANCH') return 'feature';
      return undefined;
    });

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const sourceBranch = checkEnv.getSourceBranch();
    expect(sourceBranch).toBe('feature');
  });

  it('should use DEFAULT_SOURCE_BRANCH if no source branch is specified', () => {
    context.options.sourceBranch = undefined;
    context.getEnv().get.mockImplementation(() => undefined);

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const sourceBranch = checkEnv.getSourceBranch();
    expect(sourceBranch).toBe(DEFAULT_SOURCE_BRANCH);
  });

  it('should get publish path from config', () => {
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'publishPath') return './packages/test';
      return undefined;
    });

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const publishPath = checkEnv.getPublishPath();
    expect(publishPath).toBe('./packages/test');
  });

  it('should get package json from config', () => {
    const testPackage = { name: 'config-package', version: '2.0.0' };
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'packageJson') return testPackage;
      return undefined;
    });

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const packageJson = checkEnv.getPublishPackage();
    expect(packageJson).toEqual(testPackage);
  });

  it('should read package json from file if not in config', () => {
    const testPackage = { name: 'file-package', version: '3.0.0' };
    (readFileSync as Mock).mockReturnValue(JSON.stringify(testPackage));

    context.getConfig.mockImplementation((key: string) => {
      if (key === 'packageJson') return undefined;
      if (key === 'publishPath') return './packages/test';
      return undefined;
    });

    (join as Mock).mockReturnValue('./packages/test/package.json');

    checkEnv = new CheckEnvironment(
      context as unknown as ReleaseContext,
      releaseIt
    );
    const packageJson = checkEnv.getPublishPackage();
    expect(packageJson).toEqual(testPackage);
    expect(readFileSync).toHaveBeenCalledWith(
      './packages/test/package.json',
      'utf8'
    );
  });

  describe('onBefore', () => {
    // eslint-disable-next-line
    let checkModifyPublishPackageSpy: any;

    beforeEach(() => {
      checkModifyPublishPackageSpy = vi.spyOn(
        checkEnv,
        'checkModifyPublishPackage'
      );
    });

    afterEach(() => {
      checkModifyPublishPackageSpy.mockRestore();
    });

    it('should log verbose message', async () => {
      checkModifyPublishPackageSpy.mockResolvedValue(true);
      await checkEnv.onBefore();
      expect(context.logger.verbose).toHaveBeenCalledWith(
        'CheckEnvironment onBefore'
      );
    });

    it('should throw error if no changes to publish packages', async () => {
      checkModifyPublishPackageSpy.mockResolvedValue(false);
      await expect(checkEnv.onBefore()).rejects.toThrow(
        'No changes to publish packages'
      );
    });

    it('should not check package changes if skipCheckPackage is true', async () => {
      context.options.skipCheckPackage = true;
      checkEnv = new CheckEnvironment(
        context as unknown as ReleaseContext,
        releaseIt
      );
      const spy = vi.spyOn(checkEnv, 'checkModifyPublishPackage');
      await checkEnv.onBefore();
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('checkModifyPublishPackage', () => {
    it('should return false if no changes', async () => {
      context.shell.exec.mockResolvedValue('');
      const result = await checkEnv.checkModifyPublishPackage();
      expect(result).toBe(false);
      expect(context.shell.exec).toHaveBeenCalledWith(
        'git diff --name-only origin/main...HEAD',
        { dryRun: false }
      );
    });

    it('should return true if publishPath equals rootPath', async () => {
      context.shell.exec.mockResolvedValue('file1.ts\nfile2.ts');
      context.getConfig.mockImplementation((key: string) => {
        if (key === 'publishPath') return '/test/root';
        if (key === 'rootPath') return '/test/root';
        if (key === 'sourceBranch') return 'main';
        return undefined;
      });

      checkEnv = new CheckEnvironment(
        context as unknown as ReleaseContext,
        releaseIt
      );
      const result = await checkEnv.checkModifyPublishPackage();
      expect(result).toBe(true);
      expect(context.logger.debug).toHaveBeenCalledWith('Release in root path');
    });

    it('should return true if changed files include publishPath', async () => {
      context.shell.exec.mockResolvedValue('packages/test/file1.ts\nfile2.ts');
      context.getConfig.mockImplementation((key: string) => {
        if (key === 'publishPath') return 'packages/test';
        if (key === 'rootPath') return '/test/root';
        if (key === 'sourceBranch') return 'main';
        return undefined;
      });

      checkEnv = new CheckEnvironment(
        context as unknown as ReleaseContext,
        releaseIt
      );
      const result = await checkEnv.checkModifyPublishPackage();
      expect(result).toBe(true);
    });

    it('should return false if no changed files include publishPath', async () => {
      context.shell.exec.mockResolvedValue('packages/other/file1.ts\nfile2.ts');
      context.getConfig.mockImplementation((key: string) => {
        if (key === 'publishPath') return 'packages/test';
        if (key === 'rootPath') return '/test/root';
        if (key === 'sourceBranch') return 'main';
        return undefined;
      });

      checkEnv = new CheckEnvironment(
        context as unknown as ReleaseContext,
        releaseIt
      );
      const result = await checkEnv.checkModifyPublishPackage();
      expect(result).toBe(false);
    });
  });
});
