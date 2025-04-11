import '../MockReleaseContextDep';
import type { ReleaseContext } from '../../src';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PublishNpm from '../../src/plugins/PublishNpm';
import { createTestReleaseContext } from '../helpers';

describe('PublishNpm Plugin', () => {
  let context: ReleaseContext;
  let publishNpm: PublishNpm;

  beforeEach(() => {
    context = createTestReleaseContext();
    publishNpm = new PublishNpm(context);

    // Mock the releaseIt instance and its publishNpm method
    // @ts-expect-error
    context.releaseIt = {
      publishNpm: vi.fn().mockResolvedValue({
        changelog: '## 1.0.0\n* Feature 1\n* Feature 2',
        version: '1.0.0'
      })
    };
  });

  describe('initialization', () => {
    it('should be correctly initialized with the proper name', () => {
      expect(publishNpm.pluginName).toBe('publishNpm');
    });
  });

  describe('enabled', () => {
    it('should be enabled when not in release PR mode', () => {
      context.shared.releasePR = false;
      expect(publishNpm.enabled()).toBe(true);
    });

    it('should be disabled when in release PR mode', () => {
      context.shared.releasePR = true;
      expect(publishNpm.enabled()).toBe(false);
    });
  });

  describe('onBefore', () => {
    beforeEach(() => {
      vi.spyOn(publishNpm, 'checkNpmAuth').mockResolvedValue();
    });

    it('should call checkNpmAuth in onBefore', async () => {
      await publishNpm.onBefore();
      expect(publishNpm.checkNpmAuth).toHaveBeenCalled();
    });
  });

  describe('onExec', () => {
    beforeEach(() => {
      vi.spyOn(publishNpm, 'step').mockImplementation(async ({ task }) => {
        return await task();
      });
      vi.spyOn(publishNpm, 'publish').mockResolvedValue({
        changelog: '## 1.0.0\n* Feature 1\n* Feature 2',
        version: '1.0.0'
      });
    });

    it('should call publish via a step in onExec', async () => {
      await publishNpm.onExec();
      expect(publishNpm.step).toHaveBeenCalledWith({
        label: 'Publish to NPM',
        task: expect.any(Function)
      });
      expect(publishNpm.publish).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should call releaseIt.publishNpm', async () => {
      await publishNpm.publish();
      expect(context.releaseIt.publishNpm).toHaveBeenCalled();
    });

    it('should return the result from releaseIt.publishNpm', async () => {
      const expectedResult = {
        changelog: '## 1.0.0\n* Feature 1\n* Feature 2',
        version: '1.0.0'
      };

      context.releaseIt.publishNpm = vi.fn().mockResolvedValue(expectedResult);

      const result = await publishNpm.publish();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('checkNpmAuth', () => {
    beforeEach(() => {
      vi.spyOn(publishNpm, 'getEnv').mockImplementation((key) => {
        if (key === 'NPM_TOKEN') return 'npm-token-value';
        return undefined;
      });
      // @ts-expect-error
      vi.spyOn(publishNpm, 'setConfig').mockImplementation();
      vi.spyOn(publishNpm, 'getConfig').mockReturnValue(false);
    });

    it('should throw an error if NPM_TOKEN is not set', async () => {
      vi.spyOn(publishNpm, 'getEnv').mockReturnValue(undefined);
      await expect(publishNpm.checkNpmAuth()).rejects.toThrow(
        'NPM_TOKEN is not set.'
      );
    });

    it('should set config with npmToken when token is available', async () => {
      await publishNpm.checkNpmAuth();
      expect(publishNpm.setConfig).toHaveBeenCalledWith({
        npmToken: 'npm-token-value'
      });
    });

    it('should create .npmrc file when skipNpmrc is false', async () => {
      vi.spyOn(publishNpm, 'getConfig').mockReturnValue(false);

      await publishNpm.checkNpmAuth();

      expect(publishNpm.shell.exec).toHaveBeenCalledWith(
        expect.stringContaining(
          '//registry.npmjs.org/:_authToken=npm-token-value > .npmrc'
        ),
        { dryRun: false }
      );
    });

    it('should skip creating .npmrc file when skipNpmrc is true', async () => {
      vi.spyOn(publishNpm, 'getConfig').mockReturnValue(true);

      await publishNpm.checkNpmAuth();

      expect(publishNpm.shell.exec).not.toHaveBeenCalled();
    });
  });
});
