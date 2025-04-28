import ReleaseTask from '../../src/implments/ReleaseTask';
import { AsyncExecutor, PromiseTask } from '@qlover/fe-corekit';
import { Plugin, ReleaseContext } from '../../src';
import { createTestReleaseContext } from '../helpers';
import { defaultFeConfig } from '@qlover/scripts-context';

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
