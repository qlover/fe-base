import { describe, it, expect, vi, beforeEach } from 'vitest';
import Github from '../../src/plugins/Github';
import { GithubManager } from '../../src/implments/GithubManager';
import { GithubChangelog } from '../../src/implments/changelog/GithubChangelog';
import { createTestReleaseOptions } from '../helpers';
import { ReleaseContext } from '../../src';
import type { WorkspaceInterface } from '../../src/interface/WorkspaceInterface';

describe('Github Plugin', () => {
  let context: ReleaseContext;
  let plugin: Github;
  let enrichSpy: ReturnType<typeof vi.fn>;

  const workspace: WorkspaceInterface = {
    name: 'pkg-a',
    version: '1.0.0',
    path: 'packages/a',
    root: '/repo/packages/a',
    packageJson: { name: 'pkg-a', version: '1.0.0' },
    lastTag: 'pkg-a@1.0.0',
    changelog: '- feat: initial'
  };

  const createContext = (extraOptions: Record<string, unknown> = {}) =>
    new ReleaseContext(
      'release',
      createTestReleaseOptions({
        options: {
          authorName: 'org',
          repoName: 'repo',
          sourceBranch: 'master',
          currentBranch: 'feat/release',
          workspaces: {
            workspaces: [workspace]
          },
          env: {
            get: vi.fn((key: string) =>
              key === 'GITHUB_TOKEN' ? 'ghp_test' : undefined
            )
          } as never,
          ...extraOptions
        }
      })
    );

  beforeEach(() => {
    vi.clearAllMocks();

    enrichSpy = vi.fn().mockImplementation(async (w: WorkspaceInterface) => ({
      ...w,
      changelog: 'enriched changelog'
    }));

    vi.spyOn(GithubChangelog, 'fromContext').mockReturnValue({
      enrichWorkspaceChangelog: enrichSpy
    } as never);

    vi.spyOn(GithubManager.prototype, 'validateToken').mockResolvedValue(
      undefined
    );
    vi.spyOn(GithubManager.prototype, 'createReleasePRLabel').mockResolvedValue({
      name: 'CI-Release',
      color: '1A7F37',
      description: 'Release PR'
    });
    vi.spyOn(GithubManager.prototype, 'createReleasePR').mockResolvedValue('42');
    vi.spyOn(GithubManager.prototype, 'mergePR').mockResolvedValue(undefined);
    vi.spyOn(GithubManager.prototype, 'checkedPR').mockResolvedValue(undefined);

    context = createContext();
    plugin = new Github(context);

    vi.spyOn(plugin.shell, 'exec').mockImplementation(async (cmd) => {
      const command = Array.isArray(cmd) ? cmd.join(' ') : String(cmd);
      if (command.includes('git status --porcelain')) {
        return ' M packages/a/package.json';
      }
      if (command.includes('git rev-parse --abbrev-ref HEAD')) {
        return 'feat/release';
      }
      if (command.includes('git config --get remote.origin.url')) {
        return 'https://github.com/org/repo.git';
      }
      return '';
    });
  });

  describe('onExec', () => {
    it('should enrich changelogs for direct source workspaces', async () => {
      await plugin.onExec();

      expect(enrichSpy).toHaveBeenCalledTimes(1);
      expect(context.workspaces![0].changelog).toBe('enriched changelog');
    });

    it('should skip dependency-release workspaces', async () => {
      context.setWorkspaces([
        {
          ...workspace,
          dependencyRelease: true,
          changelog: 'dependency template'
        }
      ]);

      await plugin.onExec();

      expect(enrichSpy).not.toHaveBeenCalled();
      expect(context.workspaces![0].changelog).toBe('dependency template');
    });
  });

  describe('onSuccess', () => {
    it('should skip PR creation when skipCreateReleasePr is enabled', async () => {
      const createPRSpy = vi.spyOn(GithubManager.prototype, 'createReleasePR');

      plugin.setConfig({ skipCreateReleasePr: true });
      await plugin.onSuccess();

      expect(createPRSpy).not.toHaveBeenCalled();
      expect(plugin.logger.info).toHaveBeenCalledWith(
        expect.stringContaining('PR creation skipped')
      );
    });

    it('should create release PR with formatted title and body', async () => {
      const createPRSpy = vi.spyOn(GithubManager.prototype, 'createReleasePR');

      await plugin.onSuccess();

      expect(createPRSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          base: 'master',
          head: expect.stringContaining('release/'),
          labels: expect.arrayContaining(['CI-Release'])
        })
      );
    });

    it('should auto-merge PR when autoMergeReleasePr is enabled', async () => {
      const mergeSpy = vi.spyOn(GithubManager.prototype, 'mergePR');
      const checkedSpy = vi.spyOn(GithubManager.prototype, 'checkedPR');

      plugin.setConfig({ autoMergeReleasePr: true });
      await plugin.onSuccess();

      expect(mergeSpy).toHaveBeenCalledWith('42', expect.any(String));
      expect(checkedSpy).toHaveBeenCalledWith('42', expect.any(String));
    });

    it('should include workspace change labels when pushChangeLabels is enabled', async () => {
      const createPRSpy = vi.spyOn(GithubManager.prototype, 'createReleasePR');

      context.setParameters({
        workspaces: {
          changeLabels: ['change:packages/a']
        }
      });
      plugin.setConfig({ pushChangeLabels: true });

      await plugin.onSuccess();

      expect(createPRSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          labels: expect.arrayContaining([
            'CI-Release',
            'change:packages/a'
          ])
        })
      );
    });
  });

  describe('parseRemoteUrl', () => {
    it('should reject non-GitHub hosting remotes', () => {
      expect(() =>
        // @ts-expect-error access protected method for testing
        plugin.parseRemoteUrl('https://gitlab.com/org/repo.git')
      ).toThrow(/not hosted on GitHub/);
    });

    it('should accept github.com remotes', () => {
      // @ts-expect-error access protected method for testing
      const parsed = plugin.parseRemoteUrl('https://github.com/org/repo.git');
      expect(parsed.source).toBe('github.com');
      expect(parsed.owner).toBe('org');
      expect(parsed.name).toBe('repo');
    });
  });
});
