import { describe, it, expect, vi, beforeEach } from 'vitest';
import PullRequestManager from '../../../src/plugins/githubPR/PullRequestManager';
import ReleaseContext from '../../../src/implments/ReleaseContext';
import type { PullRequestInterface } from '../../../src/interface/PullRequestInterface';

// Mock dependencies
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};

const mockShell = {
  // Add shell methods if needed
};

const mockPullRequestInterface: PullRequestInterface = {
  init: vi.fn(),
  mergePullRequest: vi.fn(),
  getPullRequest: vi.fn(),
  deleteBranch: vi.fn(),
  addPullRequestLabels: vi.fn(),
  createPullRequestLabel: vi.fn(),
  createPullRequest: vi.fn()
};

describe('PullRequestManager', () => {
  let context: ReleaseContext;
  let manager: PullRequestManager;

  beforeEach(() => {
    context = {
      shell: mockShell,
      logger: mockLogger,
      dryRun: false,
      shared: {
        autoMergeType: 'squash',
        autoMergeReleasePR: true,
        repoName: 'test-repo',
        authorName: 'test-author'
      }
    } as unknown as ReleaseContext;

    manager = new PullRequestManager(context, mockPullRequestInterface);

    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  describe('mergePR', () => {
    it('should merge PR in normal case', async () => {
      const prNumber = '123';
      const releaseBranch = 'release/1.0.0';

      await manager.mergePR(prNumber, releaseBranch);

      expect(mockPullRequestInterface.mergePullRequest).toHaveBeenCalledWith({
        pull_number: 123,
        merge_method: 'squash'
      });
    });

    it('should not merge PR in dry run mode', async () => {
      // @ts-expect-error
      context.dryRun = true;
      const prNumber = '123';
      const releaseBranch = 'release/1.0.0';

      await manager.mergePR(prNumber, releaseBranch);

      expect(mockPullRequestInterface.mergePullRequest).not.toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN] Would merge PR #123')
      );
    });

    it('should record error when PR number is empty', async () => {
      const prNumber = '';
      const releaseBranch = 'release/1.0.0';

      await manager.mergePR(prNumber, releaseBranch);

      expect(mockPullRequestInterface.mergePullRequest).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create Pull Request.',
        ''
      );
    });
  });

  describe('checkedPR', () => {
    it('should successfully check PR and delete branch', async () => {
      const prNumber = '123';
      const releaseBranch = 'release/1.0.0';

      await manager.checkedPR(prNumber, releaseBranch);

      expect(mockPullRequestInterface.getPullRequest).toHaveBeenCalledWith({
        pull_number: 123
      });
      expect(mockPullRequestInterface.deleteBranch).toHaveBeenCalledWith({
        ref: `heads/${releaseBranch}`
      });
      expect(mockLogger.info).toHaveBeenCalledWith(
        `Branch ${releaseBranch} has been deleted`
      );
    });

    it('should handle 404 error when PR or branch does not exist', async () => {
      const prNumber = '123';
      const releaseBranch = 'release/1.0.0';

      // @ts-expect-error
      mockPullRequestInterface.getPullRequest.mockRejectedValueOnce({
        status: 404
      });

      await manager.checkedPR(prNumber, releaseBranch);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        `PR #${prNumber} or branch ${releaseBranch} not found`
      );
    });

    it('should handle other errors and throw an exception', async () => {
      const prNumber = '123';
      const releaseBranch = 'release/1.0.0';
      const error = new Error('Unknown error');

      // @ts-expect-error
      mockPullRequestInterface.getPullRequest.mockRejectedValueOnce(error);

      await expect(
        manager.checkedPR(prNumber, releaseBranch)
      ).rejects.toThrow();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to check PR or delete branch',
        error
      );
    });
  });

  describe('getter methods', () => {
    it('should return correct autoMergeType', () => {
      expect(manager.autoMergeType).toBe('squash');
    });

    it('should return correct autoMergeReleasePR', () => {
      expect(manager.autoMergeReleasePR).toBe(true);
    });

    it('should return correct shell instance', () => {
      expect(manager.shell).toBe(mockShell);
    });
  });
});
