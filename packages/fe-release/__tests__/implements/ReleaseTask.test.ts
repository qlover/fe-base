import '../MockReleaseContextDep';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReleaseTask from '../../src/implments/ReleaseTask';
import { AsyncExecutor, PromiseTask } from '@qlover/fe-corekit';
import { Plugin, ReleaseContext } from '../../src';
import { join, resolve } from 'path';
import { createTestReleaseContext } from '../helpers';
import { defaultFeConfig } from '@qlover/scripts-context';
import Workspaces from '../../src/plugins/workspaces/Workspaces';
import ReleaseBase from '../../src/plugins/GitBase';
import { MANIFEST_PATH } from '../../src/defaults';

interface TestPluginProps {
  testValue: string;
  nestedConfig?: {
    value: string;
  };
}

class MockExecutor extends AsyncExecutor {
  override async run<Result, Params = unknown>(
    _data: Params,
    _actualTask: PromiseTask<Result, Params>
  ): Promise<Result> {
    return Promise.resolve('test run' as Result);
  }

  override async exec<Result, Params = unknown>(
    _dataOrTask: Params | PromiseTask<Result, Params>,
    _task?: PromiseTask<Result, Params>
  ): Promise<Result> {
    // @ts-expect-error
    return _task?.('test exec result');
  }
}

describe('ReleaseTask basic usage', () => {
  describe('must depend on release-it', () => {
    it('should throw error, no releaseIt option', () => {
      expect(() => new ReleaseTask({})).toThrow('releaseIt is not set');
    });

    it('should throw error, no releaseIt option', () => {
      expect(() => new ReleaseTask()).toThrow('releaseIt is not set');
    });
  });

  describe('create ReleaseTask instance', () => {
    it('should create ReleaseTask instance', () => {
      const releaseTask = new ReleaseTask(createTestReleaseContext());
      expect(releaseTask).toBeInstanceOf(ReleaseTask);
    });

    it('should override executor execution logic', async () => {
      const releaseTask = new ReleaseTask(
        createTestReleaseContext(),
        new MockExecutor()
      );

      const reuslt = await releaseTask.run();

      expect(reuslt).toBe('test exec result');
    });

    it('should end plugin execution when FE_RELEASE environment variable is set', async () => {
      process.env['FE_RELEASE'] = 'false';

      const releaseTask = new ReleaseTask(
        createTestReleaseContext(),
        new MockExecutor()
      );

      await expect(releaseTask.exec()).rejects.toThrow('Skip Release');

      delete process.env['FE_RELEASE'];
    });

    it('should execute custom plugins', async () => {
      const onBefore = vi.fn();
      const onExec = vi.fn();
      class TestPlugin extends Plugin<TestPluginProps> {
        constructor(
          context: ReleaseContext,
          props: TestPluginProps = { testValue: 'default' }
        ) {
          super(context, 'test-plugin', props);
        }

        onBefore = onBefore;
        onExec = onExec;
      }

      const releaseTask = new ReleaseTask(
        createTestReleaseContext({
          shared: {
            plugins: [
              [
                TestPlugin,
                {
                  testValue: 'test'
                }
              ]
            ]
          }
        }),
        undefined,
        // need overried default plugins
        []
      );

      await releaseTask.exec();

      expect(onBefore).toHaveBeenCalled();
      expect(onExec).toHaveBeenCalled();
    });
    it('should execute custom plugins, override default plugins', async () => {
      const onBefore = vi.fn();
      const onExec = vi.fn();
      class TestPlugin extends Plugin<TestPluginProps> {
        constructor(
          context: ReleaseContext,
          props: TestPluginProps = { testValue: 'default' }
        ) {
          super(context, 'test-plugin', props);
        }

        onBefore = onBefore;
        onExec = onExec;
      }

      const releaseTask = new ReleaseTask(
        createTestReleaseContext(),
        undefined,
        // overried default plugins
        [
          [
            TestPlugin,
            {
              testValue: 'test'
            }
          ]
        ]
      );

      await releaseTask.exec();

      expect(onBefore).toHaveBeenCalled();
      expect(onExec).toHaveBeenCalled();
    });
  });
});

describe('ReleaseTask context parameter verification', () => {
  const overrideShared = {
    // append from Workspace plugins
    packageJson: {
      name: 'test-package-name',
      version: '1.0.0-test'
    },
    // append from fe release
    releasePR: true,
    // append from ReleaseContext.getDefaultShreadOptions
    rootPath: '/test-root-path',
    releaseEnv: 'test',
    sourceBranch: 'test-source-branch'
  };

  const extendsArgsNames = Object.keys(overrideShared);

  it('should correctly initialize parameters and context', () => {
    const releaseTask = new ReleaseTask(createTestReleaseContext());
    expect(releaseTask.getContext()).toBeDefined();
  });

  it('should correctly initialize shared parameters (inherited from feConfig.release)', () => {
    const releaseTask = new ReleaseTask(createTestReleaseContext());

    const context = releaseTask.getContext();
    const shared = context.shared;

    expect(context).toBeDefined();

    extendsArgsNames.forEach((name) => {
      // compare with defaultFeConfig.release
      if (!extendsArgsNames.includes(name)) {
        expect(shared[name as keyof typeof shared]).toEqual(
          defaultFeConfig.release![name as keyof typeof defaultFeConfig.release]
        );
      }
    });
  });

  it('should override default shared parameters', () => {
    const releaseTask = new ReleaseTask(
      createTestReleaseContext({
        shared: overrideShared
      })
    );

    const context = releaseTask.getContext();
    const shared = context.shared;

    extendsArgsNames.forEach((name) => {
      expect(shared[name as keyof typeof shared]).toEqual(
        overrideShared[name as keyof typeof overrideShared]
      );
    });
  });
});

const mockPackageJsonMaps = {
  'packages/packages-1': {
    name: 'packages-1-name',
    version: '1.0.0'
  },
  'packages-2': {
    name: 'packages-2-name',
    version: '2.0.0'
  }
} as const;

describe('ReleaseTask internal plugin execution process (dry run)', () => {
  let mockChdir: typeof process.chdir;

  beforeEach(() => {
    vi.mock('fs', () => ({
      ...vi.importActual('fs'), // 保留其他 fs 模块的原始功能
      readFileSync: vi.fn().mockImplementation((_path: string) => {
        for (const path of Object.keys(mockPackageJsonMaps)) {
          if (path.includes(path)) {
            return JSON.stringify(
              mockPackageJsonMaps[path as keyof typeof mockPackageJsonMaps]
            );
          }
        }
        return '{}';
      })
    }));
    // @ts-expect-error
    mockChdir = vi.spyOn(process, 'chdir').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should publish to npm, pass npm token', async () => {
    const defaultWorkspace = {
      name: 'test-workspace',
      version: '1.0.0',
      path: 'packages/packages-1',
      root: 'packages/packages-1',
      packageJson: mockPackageJsonMaps['packages/packages-1']
    };

    const context = createTestReleaseContext({
      dryRun: true,
      options: {
        publishNpm: {
          npmToken: 'testnpmtoken'
        },
        workspaces: {
          workspace: defaultWorkspace
        }
      }
    });

    const releaseTask = new ReleaseTask(context);

    await releaseTask.exec();

    expect(mockChdir).toBeCalled();

    // switch to packages
    expect(mockChdir).toHaveBeenCalledWith(defaultWorkspace.root);

    // 验证 release-it 传入的 dry-run
    expect(context.options.releaseIt.releaseIt).toHaveBeenCalledWith(
      expect.objectContaining({
        'dry-run': true
      })
    );
  });

  it('should publish npm, set process.env.npmToken', async () => {
    process.env.NPM_TOKEN = 'testnpmtoken';
    const packagesDirectories = Object.keys(mockPackageJsonMaps);

    const context = createTestReleaseContext({
      dryRun: true,
      shared: { packagesDirectories }
    });

    // @ts-expect-error
    vi.spyOn(Workspaces.prototype, 'getGitWorkspaces').mockImplementation(
      // @ts-expect-error
      () => {
        return Promise.resolve([
          packagesDirectories[0] + '/index.ts',
          packagesDirectories[0] + '/func.ts'
        ]);
      }
    );

    const releaseTask = new ReleaseTask(context);

    await releaseTask.exec();

    expect(mockChdir).toBeCalled();

    // switch to packages
    expect(mockChdir).toHaveBeenCalledWith(
      // FIXME: 有绝对路径？
      expect.stringContaining(resolve(packagesDirectories[0]))
    );
    // 验证 release-it 传入的 dry-run
    expect(context.options.releaseIt.releaseIt).toHaveBeenCalledWith(
      expect.objectContaining({
        'dry-run': true
      })
    );

    delete process.env.NPM_TOKEN;
  });

  it('should publish multiple workspaces', async () => {
    process.env.NPM_TOKEN = 'testnpmtoken';

    const packagesDirectories = Object.keys(mockPackageJsonMaps);

    const context = createTestReleaseContext({
      dryRun: true,
      shared: { packagesDirectories }
    });

    // @ts-expect-error
    vi.spyOn(Workspaces.prototype, 'getGitWorkspaces').mockImplementation(
      // @ts-expect-error
      () => {
        return Promise.resolve([
          packagesDirectories[0] + '/index.ts',
          packagesDirectories[1] + '/func.ts'
        ]);
      }
    );

    const releaseTask = new ReleaseTask(context);

    await releaseTask.exec();

    expect(context.options.releaseIt.releaseIt).toBeCalledTimes(2);

    delete process.env.NPM_TOKEN;
  });

  it('should publish PR, publish a project', async () => {
    process.env.GITHUB_TOKEN = 'test-githubtoken';
    const packagesDirectories = Object.keys(mockPackageJsonMaps);

    const branchNameTpl = 'test-release-${pkgName}-${tagName}';
    const context = createTestReleaseContext({
      dryRun: true,
      shared: {
        packagesDirectories,
        branchName: branchNameTpl,
        releasePR: true
      }
    });

    // @ts-expect-error
    vi.spyOn(Workspaces.prototype, 'getGitWorkspaces').mockImplementation(
      // @ts-expect-error
      () => {
        return Promise.resolve([
          packagesDirectories[0] + '/index.ts',
          packagesDirectories[0] + '/func.ts'
        ]);
      }
    );
    vi.spyOn(ReleaseBase.prototype, 'getUserInfo').mockImplementation(() => {
      return Promise.resolve({
        repoName: 'testRepoName',
        authorName: 'testAuthorName'
      });
    });

    const releaseTask = new ReleaseTask(context);

    await releaseTask.exec();

    const targetPackageJson =
      mockPackageJsonMaps[
        packagesDirectories[0] as keyof typeof mockPackageJsonMaps
      ];

    expect(context.options.releaseIt.releaseIt).toBeCalledTimes(1);

    expect(context.logger.verbose).toHaveBeenCalledWith(
      'Release Branch template is:',
      branchNameTpl
    );

    expect(context.logger.verbose).toHaveBeenCalledWith(
      'PR ReleaseBranch is:',
      `test-release-${targetPackageJson.name}-${targetPackageJson.version}`
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Changelogs - success')
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Release Branch - success')
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Release PR - success')
    );

    delete process.env.GITHUB_TOKEN;
  });

  it('should skip workspaces when publishPath is set', async () => {
    process.env.NPM_TOKEN = 'test-npm-token';

    const packagesDirectories = Object.keys(mockPackageJsonMaps);

    // @ts-expect-error
    vi.spyOn(Workspaces.prototype, 'getGitWorkspaces').mockImplementation(
      // @ts-expect-error
      () => {
        return Promise.resolve([
          packagesDirectories[0] + '/index.ts',
          packagesDirectories[0] + '/func.ts'
        ]);
      }
    );

    const context = createTestReleaseContext({
      dryRun: true,
      shared: { packagesDirectories, publishPath: packagesDirectories[0] }
    });

    const releaseTask = new ReleaseTask(context);

    await releaseTask.exec();

    expect(context.logger.debug).toHaveBeenCalledWith(
      'publishPathWorkspace find!',
      expect.stringContaining(join(packagesDirectories[0], MANIFEST_PATH))
    );
    expect(context.logger.debug).toHaveBeenCalledWith('skip next workspace');

    expect(context.options.releaseIt.releaseIt).toBeCalledTimes(1);

    delete process.env.NPM_TOKEN;
  });

  it('should directly stop the chain, when publishPath is invalid', async () => {
    process.env.NPM_TOKEN = 'test-npm-token';

    const packagesDirectories = Object.keys(mockPackageJsonMaps);

    // @ts-expect-error
    vi.spyOn(Workspaces.prototype, 'getGitWorkspaces').mockImplementation(
      // @ts-expect-error
      () => {
        return Promise.resolve([
          packagesDirectories[0] + '/index.ts',
          packagesDirectories[0] + '/func.ts'
        ]);
      }
    );

    const context = createTestReleaseContext({
      dryRun: true,
      shared: { packagesDirectories, publishPath: 'invalid/publish-path' }
    });

    const releaseTask = new ReleaseTask(context);

    await expect(releaseTask.exec()).rejects.toThrow(
      'No workspace found for: invalid/publish-path'
    );

    expect(context.logger.debug).toHaveBeenCalledWith('skip next workspace');

    expect(context.options.releaseIt.releaseIt).toBeCalledTimes(0);

    delete process.env.NPM_TOKEN;
  });
});
