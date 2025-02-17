import { describe, beforeEach, it, expect, vi, afterEach } from 'vitest';
import { release } from '../src/index';
import { ReleaseItInstanceType } from '../src/type';

describe('index', () => {
  let releaseIt: ReleaseItInstanceType;

  beforeEach(() => {
    process.env.GITHUB_TOKEN = 'mocked_github_token';
    releaseIt = vi.fn();
  });

  afterEach(() => {
    delete process.env.GITHUB_TOKEN;
    delete process.env.PAT_TOKEN;
  });

  it('should throw an error if packageJson is not provided', async () => {
    releaseIt = vi.fn().mockReturnValue({
      changelog: 'test',
      version: '1.0.0'
    });

    try {
      await release({ options: { releaseIt } });
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toBe('package.json is undefined');
    }
  });
});
