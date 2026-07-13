import ReleaseTask from '../../src/implments/ReleaseTask';
import type ReleaseContext from '../../src/implments/ReleaseContext';
import {
  type ExecutorAsyncTask,
  type ExecutorContextInterface,
  type ExecutorSyncTask,
  type ExecutorTask,
  LifecycleExecutor
} from '@qlover/fe-corekit';
import { createTestReleaseOptions } from '../helpers';
import { releaseJson } from '../../src/defaults';

class MockExecutor extends LifecycleExecutor<ReleaseContext> {
  protected override async run<Result, Params>(
    _context: ExecutorContextInterface<Params, Result>,
    _actualTask: ExecutorTask<Result, Params>
  ): Promise<Result> {
    return Promise.resolve('test run' as Result);
  }

  public exec<R, P>(task: ExecutorAsyncTask<R, P>): Promise<R>;
  public exec<R, P>(data: P, task: ExecutorAsyncTask<R, P>): Promise<R>;
  public exec<R, P>(task: ExecutorSyncTask<R, P>): Promise<R>;
  public exec<R, P>(data: P, task: ExecutorSyncTask<R, P>): Promise<R>;
  public exec<R, P>(
    _dataOrTask: P | ExecutorTask<R, P>,
    task?: ExecutorTask<R, P>
  ): Promise<R> {
    // @ts-expect-error
    return task?.('test exec result');
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
    packageJson: {
      name: 'test-package-name',
      version: '1.0.0-test'
    },
    releasePR: true,
    rootPath: '/test-root-path',
    releaseEnv: 'staging',
    sourceBranch: 'test-source-branch'
  };

  const envKeys = [
    'NODE_ENV',
    'FE_RELEASE_ENV',
    'FE_RELEASE_BRANCH',
    'FE_RELEASE_SOURCE_BRANCH'
  ] as const;

  let envSnapshot: Partial<Record<(typeof envKeys)[number], string | undefined>>;

  beforeEach(() => {
    envSnapshot = {};
    for (const key of envKeys) {
      envSnapshot[key] = process.env[key];
      delete process.env[key];
    }
  });

  afterEach(() => {
    for (const key of envKeys) {
      if (envSnapshot[key] === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = envSnapshot[key];
      }
    }
  });

  it('should correctly initialize parameters and context', () => {
    const releaseTask = new ReleaseTask(createTestReleaseOptions());
    expect(releaseTask.getContext()).toBeDefined();
  });

  it('should apply built-in release defaults from releaseJson', () => {
    const releaseTask = new ReleaseTask(createTestReleaseOptions());

    const context = releaseTask.getContext();

    expect(context.sourceBranch).toBe(releaseJson.sourceBranch);
    expect(context.releaseEnv).toBe(releaseJson.releaseEnv);
  });

  it('should override default shared parameters', () => {
    const releaseTask = new ReleaseTask(
      createTestReleaseOptions({
        options: {
          ...overrideOptions,
          env: {
            get: vi.fn().mockReturnValue(undefined)
          } as never
        }
      })
    );

    const context = releaseTask.getContext();

    expect(context.sourceBranch).toBe(overrideOptions.sourceBranch);
    expect(context.releaseEnv).toBe(overrideOptions.releaseEnv);
    expect(context.rootPath).toBe(overrideOptions.rootPath);
  });
});
