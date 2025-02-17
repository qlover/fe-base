import { describe, beforeEach, it, expect, vi } from 'vitest';
import { release } from '../src/index';
import { ReleaseItInstanceType } from '../src/type';

describe('index', () => {
  let releaseIt: ReleaseItInstanceType;

  beforeEach(() => {
    releaseIt = vi.fn();
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
