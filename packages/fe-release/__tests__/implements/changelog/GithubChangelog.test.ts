import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GithubChangelog,
  buildGithubChangelogProps
} from '../../../src/implments/changelog/GithubChangelog';
import type { GithubManager } from '../../../src/implments/GithubManager';
import type { CommitValue } from '../../../src/interface/ChangeLog';
import { createTestLogger, createTestReleaseOptions, createTestShell } from '../../helpers';
import { ReleaseContext } from '../../../src';

describe('GithubChangelog', () => {
  const mockShell = createTestShell();
  const mockLogger = createTestLogger();

  const workspace = {
    name: 'pkg-a',
    version: '1.0.0',
    path: 'packages/a',
    root: '/repo/packages/a',
    packageJson: { name: 'pkg-a', version: '1.0.0' },
    lastTag: 'pkg-a@1.0.0',
    changelog: '- feat: initial'
  };

  let context: ReleaseContext;
  let githubManager: GithubManager;

  beforeEach(() => {
    vi.clearAllMocks();

    context = new ReleaseContext(
      'release',
      createTestReleaseOptions({
        options: {
          authorName: 'org',
          repoName: 'repo'
        },
        shell: mockShell,
        logger: mockLogger
      })
    );

    githubManager = {
      getCommitInfo: vi.fn(),
      getPullRequestsForCommit: vi.fn(),
      getPullRequestCommits: vi.fn()
    } as unknown as GithubManager;
  });

  describe('buildGithubChangelogProps', () => {
    it('should build repo URL and inherit changeset formatter options', () => {
      const props = buildGithubChangelogProps(context);

      expect(props.repoUrl).toBe('https://github.com/org/repo');
      expect(props.shell).toBe(context.shell);
      expect(props.logger).toBe(context.logger);
    });
  });

  describe('filterCommitsByDirectory', () => {
    it('should keep commits that touch the workspace directory', async () => {
      vi.mocked(githubManager.getCommitInfo).mockResolvedValue({
        files: [{ filename: 'packages/a/src/index.ts' }]
      } as never);

      const changelog = new GithubChangelog(
        {
          repoUrl: 'https://github.com/org/repo',
          shell: mockShell,
          logger: mockLogger
        },
        githubManager
      );

      const commits: CommitValue[] = [
        {
          base: { hash: 'abc123', subject: 'feat: add feature' } as CommitValue['base'],
          commitlint: { message: 'add feature' }
        }
      ];

      const result = await changelog.filterCommitsByDirectory(
        commits,
        'packages/a'
      );

      expect(result).toHaveLength(1);
      expect(githubManager.getCommitInfo).toHaveBeenCalledWith('abc123');
    });

    it('should keep commits when commit info is unavailable', async () => {
      vi.mocked(githubManager.getCommitInfo).mockResolvedValue(null);

      const changelog = new GithubChangelog(
        {
          repoUrl: 'https://github.com/org/repo',
          shell: mockShell,
          logger: mockLogger
        },
        githubManager
      );

      const commits: CommitValue[] = [
        {
          base: { hash: 'abc123', subject: 'feat: add feature' } as CommitValue['base'],
          commitlint: { message: 'add feature' }
        }
      ];

      const result = await changelog.filterCommitsByDirectory(
        commits,
        'packages/a'
      );

      expect(result).toHaveLength(1);
    });

    it('should exclude commits outside the workspace directory', async () => {
      vi.mocked(githubManager.getCommitInfo).mockResolvedValue({
        files: [{ filename: 'packages/b/index.ts' }]
      } as never);

      const changelog = new GithubChangelog(
        {
          repoUrl: 'https://github.com/org/repo',
          shell: mockShell,
          logger: mockLogger
        },
        githubManager
      );

      const commits: CommitValue[] = [
        {
          base: { hash: 'abc123', subject: 'feat: other package' } as CommitValue['base'],
          commitlint: { message: 'other package' }
        }
      ];

      const result = await changelog.filterCommitsByDirectory(
        commits,
        'packages/a'
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('enrichWorkspaceChangelog', () => {
    it('should replace workspace changelog with formatted git/github output', async () => {
      const changelog = new GithubChangelog(
        {
          repoUrl: 'https://github.com/org/repo',
          shell: mockShell,
          logger: mockLogger,
          formatTemplate: '* ${commitlint.message}',
          types: [{ type: 'feat', section: '## Features', hidden: false }]
        },
        githubManager
      );

      vi.spyOn(changelog, 'getFullCommit').mockResolvedValue([
        {
          base: { hash: 'abc123', subject: 'feat: add feature' } as CommitValue['base'],
          commitlint: { type: 'feat', message: 'add feature' }
        }
      ]);

      const result = await changelog.enrichWorkspaceChangelog(workspace);

      expect(result.changelog).toContain('add feature');
      expect(result.name).toBe('pkg-a');
    });
  });

  describe('fromContext', () => {
    it('should create instance wired to context and manager', () => {
      const instance = GithubChangelog.fromContext(context, githubManager);

      expect(instance).toBeInstanceOf(GithubChangelog);
    });
  });
});
