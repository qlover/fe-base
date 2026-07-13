import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GithubManager } from '../../src/implments/GithubManager';
import { createTestReleaseOptions } from '../helpers';
import { ReleaseContext } from '../../src';

describe('GithubManager', () => {
  let context: ReleaseContext;
  let manager: GithubManager;

  const mockReposGet = vi.fn();
  const mockPullsCreate = vi.fn();
  const mockPullsMerge = vi.fn();
  const mockIssuesCreateLabel = vi.fn();
  const mockIssuesAddLabels = vi.fn();

  const createContext = (overrides: Record<string, unknown> = {}) =>
    new ReleaseContext(
      'release',
      createTestReleaseOptions({
        options: {
          authorName: 'org',
          repoName: 'repo',
          env: {
            get: vi.fn((key: string) =>
              key === 'GITHUB_TOKEN' ? 'ghp_test_token' : undefined
            )
          } as never,
          ...overrides
        }
      })
    );

  beforeEach(() => {
    vi.clearAllMocks();

    mockReposGet.mockResolvedValue({
      data: { html_url: 'https://github.com/org/repo' }
    });
    mockPullsCreate.mockResolvedValue({ data: { number: 101 } });
    mockPullsMerge.mockResolvedValue({ data: { merged: true } });
    mockIssuesCreateLabel.mockResolvedValue({ data: { name: 'CI-Release' } });
    mockIssuesAddLabels.mockResolvedValue({ url: 'https://github.com/org/repo/issues/101/labels' });

    context = createContext();
    manager = new GithubManager(context);

    vi.spyOn(manager, 'octokit', 'get').mockReturnValue({
      rest: {
        repos: {
          get: mockReposGet,
          getCommit: vi.fn(),
          listPullRequestsAssociatedWithCommit: vi.fn()
        },
        pulls: {
          create: mockPullsCreate,
          merge: mockPullsMerge,
          listCommits: vi.fn(),
          get: vi.fn()
        },
        issues: {
          createLabel: mockIssuesCreateLabel,
          addLabels: mockIssuesAddLabels
        },
        git: {
          deleteRef: vi.fn()
        }
      }
    } as never);
  });

  describe('getToken', () => {
    it('should return token from configured env ref', () => {
      expect(manager.getToken()).toBe('ghp_test_token');
    });

    it('should throw when token is missing', () => {
      const noTokenContext = createContext({
        env: { get: vi.fn().mockReturnValue(undefined) } as never
      });
      const noTokenManager = new GithubManager(noTokenContext);

      expect(() => noTokenManager.getToken()).toThrow(/GITHUB_TOKEN/);
    });
  });

  describe('validateToken', () => {
    it('should verify repository access via Octokit', async () => {
      await manager.validateToken();

      expect(mockReposGet).toHaveBeenCalledWith({
        owner: 'org',
        repo: 'repo'
      });
    });
  });

  describe('createReleasePR', () => {
    it('should return dry-run PR number without API calls', async () => {
      const dryRunContext = createContext();
      Object.assign(dryRunContext, { dryRun: true });
      const dryRunManager = new GithubManager(dryRunContext);
      vi.spyOn(dryRunManager, 'octokit', 'get').mockReturnValue({
        rest: { pulls: { create: mockPullsCreate } }
      } as never);

      const prNumber = await dryRunManager.createReleasePR({
        title: 'Release',
        body: 'Changelog',
        base: 'master',
        head: 'release/test'
      });

      expect(prNumber).toBe('999999');
      expect(mockPullsCreate).not.toHaveBeenCalled();
    });

    it('should create PR and attach labels', async () => {
      const prNumber = await manager.createReleasePR({
        title: 'Release pkg-a',
        body: '## Changelog',
        base: 'master',
        head: 'release/pkg-a',
        labels: ['CI-Release']
      });

      expect(prNumber).toBe('101');
      expect(mockPullsCreate).toHaveBeenCalledWith({
        owner: 'org',
        repo: 'repo',
        title: 'Release pkg-a',
        body: '## Changelog',
        base: 'master',
        head: 'release/pkg-a',
        labels: ['CI-Release']
      });
      expect(mockIssuesAddLabels).toHaveBeenCalled();
    });
  });

  describe('mergePR', () => {
    it('should log merge action in dry-run mode', async () => {
      const dryRunContext = createContext();
      Object.assign(dryRunContext, { dryRun: true });
      const dryRunManager = new GithubManager(dryRunContext);

      await dryRunManager.mergePR('101', 'release/test');

      expect(mockPullsMerge).not.toHaveBeenCalled();
      expect(dryRunManager.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('[DRY RUN] Would merge PR #101')
      );
    });

    it('should merge PR via Octokit', async () => {
      await manager.mergePR('101', 'release/test');

      expect(mockPullsMerge).toHaveBeenCalledWith({
        owner: 'org',
        repo: 'repo',
        pull_number: 101,
        merge_method: 'squash'
      });
    });
  });

  describe('createReleasePRLabel', () => {
    it('should return label config in dry-run mode', async () => {
      const dryRunContext = createContext();
      Object.assign(dryRunContext, { dryRun: true });
      const dryRunManager = new GithubManager(dryRunContext);

      const label = await dryRunManager.createReleasePRLabel();

      expect(label?.name).toBe('CI-Release');
      expect(mockIssuesCreateLabel).not.toHaveBeenCalled();
    });
  });
});
