import '../MockReleaseContextDep';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ReleaseTask from '../../src/implments/ReleaseTask';
import { AsyncExecutor, PromiseTask } from '@qlover/fe-corekit';
import { Plugin, ReleaseContext } from '../../src';
import { resolve } from 'path';
import { createTestReleaseContext } from '../helpers';
import { defaultFeConfig } from '@qlover/scripts-context';
import Workspaces from '../../src/plugins/workspaces/Workspaces';
import ReleaseBase from '../../src/plugins/GitBase';

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

describe('ReleaseTask 基本使用', () => {
  describe('必须依赖 release-it', () => {
    it('应该抛出错误，没有 releaseIt 选项', () => {
      expect(() => new ReleaseTask({})).toThrow('releaseIt is not set');
    });

    it('应该抛出错误，没有 options 选项时 release-it 选项未设置', () => {
      expect(() => new ReleaseTask()).toThrow('releaseIt is not set');
    });
  });

  describe('创建 ReleaseTask 实例', () => {
    it('应该正确创建ReleaseTask示例', () => {
      const releaseTask = new ReleaseTask(createTestReleaseContext());
      expect(releaseTask).toBeInstanceOf(ReleaseTask);
    });

    it('应该覆盖 executor 执行逻辑', async () => {
      const releaseTask = new ReleaseTask(
        createTestReleaseContext(),
        new MockExecutor()
      );

      const reuslt = await releaseTask.run();

      expect(reuslt).toBe('test exec result');
    });

    it('应该结束插件执行在设置了 FE_RELEASE 环境变量时', async () => {
      process.env['FE_RELEASE'] = 'false';

      const releaseTask = new ReleaseTask(
        createTestReleaseContext(),
        new MockExecutor()
      );

      await expect(releaseTask.exec()).rejects.toThrow('Skip Release');

      delete process.env['FE_RELEASE'];
    });

    it('应该执行自定义的插件', async () => {
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
    it('应该执行自定义的插件, 覆盖默认插件', async () => {
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

describe('ReleaseTask 上下文参数的验证', () => {
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

  it('应该正确初始化参数和context', () => {
    const releaseTask = new ReleaseTask(createTestReleaseContext());
    expect(releaseTask.getContext()).toBeDefined();
  });

  it('应该正确初始化 shared 参数(继承自 feConfig.release)', () => {
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

  it('应该覆盖默认的 shard 参数', () => {
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

describe('ReleaseTask 内部插件执行流程(空跑)', () => {
  let mockChdir: typeof process.chdir;

  beforeEach(() => {
    vi.mock('fs', () => ({
      ...vi.importActual('fs'), // 保留其他 fs 模块的原始功能
      readFileSync: vi.fn().mockImplementation((path: string) => {
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

  it('应该成功发布到 npm, 传入 npm token', async () => {
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

  it('应该成功发布 npm, 设置 process.env.npmToken', async () => {
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

  it('应该成功发布多个工作区', async () => {
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

  it('应该成功发布 PR, 发布一个项目时', async () => {
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
      'PR TargetBranch is:',
      `test-release-${targetPackageJson.name}-${targetPackageJson.version}`
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Changelog and Version - success')
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Release Branch - success')
    );
    expect(context.logger.info).toHaveBeenCalledWith(
      expect.stringMatching('Create Release PR - success')
    );

    delete process.env.GITHUB_TOKEN;
  });
});
