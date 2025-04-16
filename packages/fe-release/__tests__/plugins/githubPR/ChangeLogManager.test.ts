import { vi, describe, it, expect, beforeEach } from 'vitest';
import ChangelogManager from '../../../src/plugins/githubPR/ChangelogManager';
import ReleaseContext from '../../../src/implments/ReleaseContext';
import { ReleaseItInstanceResult } from '../../../src/implments/release-it/ReleaseIt';
import { WorkspaceValue } from '../../../src/plugins/workspaces/Workspaces';
import { createTestReleaseContext } from '../../helpers';

describe('ChangelogManager', () => {
  let changelogManager: ChangelogManager;
  let mockContext: ReleaseContext;

  beforeEach(() => {
    mockContext = createTestReleaseContext();

    changelogManager = new ChangelogManager(mockContext);
  });

  describe('getChangelogAndFeatures', () => {
    it('should return changelog when releaseResult exists', () => {
      const mockReleaseResult: ReleaseItInstanceResult = {
        changelog: '## Changes\n- Feature 1\n- Bug fix 1',
        version: '1.0.0'
      };

      const result =
        changelogManager.getChangelogAndFeatures(mockReleaseResult);
      expect(result).toBe(mockReleaseResult.changelog);
    });

    it('should return warning message and default value when releaseResult does not exist', () => {
      const result = changelogManager.getChangelogAndFeatures(
        undefined as unknown as ReleaseItInstanceResult
      );

      expect(mockContext.logger.warn).toHaveBeenCalledWith(
        'No release-it output found, changelog might be incomplete'
      );
      expect(result).toBe('No changelog');
    });
  });

  describe('createChangelog', () => {
    it('should call context.releaseIt.createChangelog', async () => {
      const mockResult: ReleaseItInstanceResult = {
        changelog: '## Changes\n- Test change',
        version: '1.0.0'
      };

      vi.spyOn(mockContext.releaseIt, 'createChangelog').mockResolvedValue(
        mockResult
      );

      const result = await changelogManager.createChangelog();

      expect(mockContext.releaseIt.createChangelog).toHaveBeenCalled();
      expect(result).toBe(mockResult);
    });
  });

  describe('createChangeLogs', () => {
    it('should create changelogs for multiple workspaces', async () => {
      const mockWorkspaces: WorkspaceValue[] = [
        {
          name: 'workspace1',
          version: '1.0.0',
          root: '/path1',
          path: '',
          packageJson: {
            name: 'workspace1',
            version: '1.0.0'
          }
        },
        {
          name: 'workspace2',
          version: '1.0.0',
          root: '/path2',
          path: '',
          packageJson: {
            name: 'workspace2',
            version: '1.0.0'
          }
        }
      ];

      const mockGenerateResult: ReleaseItInstanceResult = {
        changelog: '## Changes\n- Test change',
        version: '1.0.1'
      };

      vi.spyOn(mockContext.releaseIt, 'createChangelog').mockResolvedValue(
        mockGenerateResult
      );

      const results = await changelogManager.createChangeLogs(mockWorkspaces);

      expect(results).toHaveLength(2);
      expect(mockContext.releaseIt.createChangelog).toHaveBeenCalledTimes(2);

      results.forEach((result, index) => {
        expect(result).toEqual({
          ...mockWorkspaces[index],
          ...mockGenerateResult
        });
      });
    });
  });
});
