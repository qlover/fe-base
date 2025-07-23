import ReleaseTask from '../../src/implments/ReleaseTask';
import { AsyncExecutor, PromiseTask } from '@qlover/fe-corekit';
import { createTestReleaseOptions } from '../helpers';
import { defaultFeConfig } from '@qlover/scripts-context';

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
      const releaseTask = new ReleaseTask(createTestReleaseOptions());
      expect(releaseTask).toBeInstanceOf(ReleaseTask);
    });

    it('should override executor execution logic', async () => {
      const releaseTask = new ReleaseTask(
        createTestReleaseOptions(),
        new MockExecutor()
      );

      const reuslt = await releaseTask.run();

      expect(reuslt).toBe('test exec result');
    });

    it('should end plugin execution when FE_RELEASE environment variable is set', async () => {
      process.env['FE_RELEASE'] = 'false';

      const releaseTask = new ReleaseTask(
        createTestReleaseOptions(),
        new MockExecutor()
      );

      await expect(releaseTask.exec()).rejects.toThrow('Skip Release');

      delete process.env['FE_RELEASE'];
    });
  });
});

describe('ReleaseTask context parameter verification', () => {
  const overrideOptions = {
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

  const extendsArgsNames = Object.keys(overrideOptions);

  it('should correctly initialize parameters and context', () => {
    const releaseTask = new ReleaseTask(createTestReleaseOptions());
    expect(releaseTask.getContext()).toBeDefined();
  });

  it('should correctly initialize shared parameters (inherited from feConfig.release)', () => {
    const releaseTask = new ReleaseTask(createTestReleaseOptions());

    const context = releaseTask.getContext();
    const options = context.options;

    expect(context).toBeDefined();

    extendsArgsNames.forEach((name) => {
      // compare with defaultFeConfig.release
      if (!extendsArgsNames.includes(name)) {
        expect(options[name as keyof typeof options]).toEqual(
          defaultFeConfig.release![name as keyof typeof defaultFeConfig.release]
        );
      }
    });
  });

  it('should override default shared parameters', () => {
    const releaseTask = new ReleaseTask(
      createTestReleaseOptions({
        options: overrideOptions
      })
    );

    const context = releaseTask.getContext();
    const options = context.options;

    extendsArgsNames.forEach((name) => {
      expect(options[name as keyof typeof options]).toEqual(
        overrideOptions[name as keyof typeof overrideOptions]
      );
    });
  });
});
