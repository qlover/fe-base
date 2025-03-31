import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PublishNpm from '../../src/plugins/PublishNpm';
import ReleaseContext from '../../src/interface/ReleaseContext';

// 模拟 lodash/isObject
vi.mock('lodash/isObject', () => ({
  default: vi
    .fn()
    .mockImplementation((obj) => obj !== null && typeof obj === 'object')
}));

describe('PublishNpm', () => {
  // eslint-disable-next-line
  let context: any;
  let publishNpm: PublishNpm;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // A模拟 shell.exec 方法
    vi.clearAllMocks();

    // 模拟 context
    context = {
      getConfig: vi.fn(),
      setConfig: vi.fn(),
      getEnv: vi.fn(),
      dryRun: false,
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

    // 默认配置
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'packageJson') {
        return { version: '1.0.0' };
      }
      if (key === 'releaseIt') {
        return vi.fn().mockResolvedValue({ version: '1.0.0' });
      }
      return undefined;
    });

    context.getEnv.mockImplementation((key: string) => {
      if (key === 'NPM_TOKEN') {
        return 'fake-npm-token';
      }
      return undefined;
    });

    publishNpm = new PublishNpm(context as unknown as ReleaseContext);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should initialize with the correct plugin name', () => {
    expect(publishNpm.pluginName).toBe('publish-npm');
  });

  it('should check NPM authentication on onBefore', async () => {
    const checkNpmAuthSpy = vi
      .spyOn(publishNpm, 'checkNpmAuth')
      .mockResolvedValue();

    await publishNpm.onBefore();

    expect(checkNpmAuthSpy).toHaveBeenCalled();
    expect(context.logger.verbose).toHaveBeenCalledWith('PublishNpm onBefore');
  });

  it('should publish to NPM on onSuccess', async () => {
    const publishSpy = vi.spyOn(publishNpm, 'publish').mockResolvedValue({});
    const getPublishReleaseItOptionsSpy = vi.spyOn(
      publishNpm,
      'getPublishReleaseItOptions'
    );

    await publishNpm.onSuccess();

    expect(getPublishReleaseItOptionsSpy).toHaveBeenCalledWith(context);
    expect(publishSpy).toHaveBeenCalled();
  });

  it('should get correct increment version', () => {
    const version = publishNpm.getIncrementVersion();

    expect(version).toBe('1.0.0');
  });

  it('should throw an error if package.json is undefined', () => {
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'packageJson') {
        return undefined;
      }
      return undefined;
    });

    expect(() => publishNpm.getIncrementVersion()).toThrow(
      'package.json is undefined'
    );
  });

  it('should throw an error if package.json version is not set', () => {
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'packageJson') {
        return {};
      }
      return undefined;
    });

    expect(() => publishNpm.getIncrementVersion()).toThrow(
      'package.json version is required'
    );
  });

  it('should check NPM authentication', async () => {
    context.getEnv.mockReturnValue({
      get: vi.fn().mockReturnValue('fake-npm-token')
    });

    await publishNpm.checkNpmAuth();

    expect(context.setConfig).toHaveBeenCalledWith({
      npmToken: 'fake-npm-token'
    });
    expect(context.shell.exec).toHaveBeenCalledWith(
      `echo //registry.npmjs.org/:_authToken=fake-npm-token > .npmrc`,
      { dryRun: false }
    );
  });

  it('should throw an error if NPM_TOKEN is not set', async () => {
    context.getEnv.mockReturnValue({
      get: vi.fn().mockReturnValue(undefined)
    });

    await expect(publishNpm.checkNpmAuth()).rejects.toThrow(
      'NPM_TOKEN is not set.'
    );
  });

  it('should publish with release-it', async () => {
    const releaseItMock = vi.fn().mockResolvedValue({ version: '1.0.0' });
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'releaseIt') {
        return releaseItMock;
      }
      return undefined;
    });

    const options = { test: 'options' };
    const result = await publishNpm.publish(options);

    expect(releaseItMock).toHaveBeenCalledWith(options);
    expect(result).toEqual({ version: '1.0.0' });
    expect(context.logger.debug).toHaveBeenCalledWith(
      'Run release-it method',
      options
    );
  });

  it('should throw an error if releaseIt instance is not set', async () => {
    context.getConfig.mockImplementation((key: string) => {
      if (key === 'releaseIt') {
        return undefined;
      }
      return undefined;
    });

    await expect(publishNpm.publish({})).rejects.toThrow(
      'releaseIt instance is not set'
    );
  });

  it('should return correct publish options', () => {
    const options = publishNpm.getPublishReleaseItOptions(
      context as unknown as ReleaseContext
    );

    expect(options).toEqual({
      ci: true,
      npm: {
        publish: true
      },
      git: {
        requireCleanWorkingDir: false,
        requireUpstream: false,
        changelog: false
      },
      plugins: {
        '@release-it/conventional-changelog': {
          infile: false
        }
      },
      'dry-run': false,
      verbose: true,
      increment: '1.0.0'
    });
  });
});
