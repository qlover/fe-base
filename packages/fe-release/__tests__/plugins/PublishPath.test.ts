import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';
import { existsSync } from 'node:fs';
import PublishPath from '../../src/plugins/PublishPath';
import ReleaseContext from '../../src/interface/ReleaseContext';

// 模拟 existsSync
vi.mock('node:fs', () => ({
  existsSync: vi.fn()
}));

describe('PublishPath', () => {
  // eslint-disable-next-line
  let context: any;
  let publishPath: PublishPath;
  const originalChdir = process.chdir;

  beforeEach(() => {
    // 保存原始的 process.chdir
    process.chdir = vi.fn();
    vi.clearAllMocks();
    context = {
      getConfig: vi.fn(),
      logger: {
        verbose: vi.fn(),
        debug: vi.fn()
      }
    };
    publishPath = new PublishPath(context as unknown as ReleaseContext);
  });

  afterEach(() => {
    // 恢复原始的 process.chdir
    process.chdir = originalChdir;
  });

  it('should throw an error if publishPath is not set', async () => {
    context.getConfig.mockReturnValue(undefined);
    await expect(publishPath.checkPublishPath()).rejects.toThrow(
      'publishPath is not set'
    );
  });

  it('should switch to the publish path if it exists', () => {
    const path = '/valid/path';
    context.getConfig.mockReturnValue(path);
    (existsSync as Mock).mockReturnValue(true);

    publishPath.switchToPublishPath(path);

    expect(process.chdir).toHaveBeenCalledWith(path);
    expect(context.logger.debug).toHaveBeenCalledWith(
      'Switching to publish path:',
      path
    );
  });

  it('should not switch to the publish path if it does not exist', () => {
    const path = '/invalid/path';
    context.getConfig.mockReturnValue(path);
    (existsSync as Mock).mockReturnValue(false);

    publishPath.switchToPublishPath(path);

    expect(process.chdir).not.toHaveBeenCalled();
  });
});
