import { describe, it, expect, vi, beforeEach } from 'vitest';
import { join } from 'node:path';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import ChangesetVersion from '../../src/plugins/ChangesetVersion';
import * as createWorkspaceModule from '../../src/utils/createWorkspace';
import { createTestReleaseOptions } from '../helpers';
import { ReleaseContext } from '../../src';
import type { WorkspaceInterface } from '../../src/interface/WorkspaceInterface';

vi.mock('node:fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn()
}));

describe('ChangesetVersion Plugin', () => {
  let context: ReleaseContext;
  let plugin: ChangesetVersion;

  const workspace: WorkspaceInterface = {
    name: 'pkg-a',
    version: '1.0.0',
    path: 'packages/a',
    root: '/repo/packages/a',
    packageJson: { name: 'pkg-a', version: '1.0.0' },
    lastTag: 'pkg-a@1.0.0',
    changelog: '- feat: initial'
  };

  beforeEach(() => {
    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(
      JSON.stringify({ changelog: ['@changesets/cli/changelog'] })
    );

    context = new ReleaseContext(
      'release',
      createTestReleaseOptions({
        options: {
          workspaces: {
            workspaces: [workspace]
          }
        }
      })
    );

    plugin = new ChangesetVersion(context);
    vi.spyOn(plugin.shell, 'exec').mockResolvedValue('');
  });

  describe('getIncrement', () => {
    it('should use config increment by default', () => {
      plugin.setConfig({ increment: 'minor' });
      expect(plugin.getIncrement()).toBe('minor');
    });

    it('should prefer major label from workspaces.changeLabels', () => {
      context.setParameters({
        workspaces: {
          changeLabels: ['increment:major']
        }
      });
      expect(plugin.getIncrement()).toBe('major');
    });

    it('should read increment label from GITHUB_EVENT_PATH', () => {
      const eventPath = join(process.cwd(), '.tmp-github-event.json');
      vi.mocked(existsSync).mockImplementation((path) => path === eventPath);
      vi.mocked(readFileSync).mockImplementation((path) => {
        if (path === eventPath) {
          return JSON.stringify({
            pull_request: {
              labels: [{ name: 'CI-Release' }, { name: 'increment:major' }]
            }
          });
        }
        return JSON.stringify({ changelog: ['@changesets/cli/changelog'] });
      });

      const previous = process.env.GITHUB_EVENT_PATH;
      process.env.GITHUB_EVENT_PATH = eventPath;
      try {
        expect(plugin.getIncrement()).toBe('major');
      } finally {
        if (previous === undefined) {
          delete process.env.GITHUB_EVENT_PATH;
        } else {
          process.env.GITHUB_EVENT_PATH = previous;
        }
      }
    });
  });

  describe('mergeWorkspaces', () => {
    it('should sync newVersion and tagName from disk', () => {
      vi.spyOn(
        createWorkspaceModule,
        'readWorkspacePackageFromDisk'
      ).mockReturnValue({
        root: '/repo/packages/a',
        packagePath: '/repo/packages/a/package.json',
        manifestPath: 'package.json',
        version: '1.0.1',
        packageJson: { name: 'pkg-a', version: '1.0.1' }
      });

      vi.spyOn(context, 'format').mockReturnValue('pkg-a@1.0.1');

      const result = plugin.mergeWorkspaces([workspace]);

      expect(result[0].newVersion).toBe('1.0.1');
      expect(result[0].tagName).toBe('pkg-a@1.0.1');
    });
  });

  describe('restoreIgnorePackages', () => {
    it('should git restore dependency-release workspace paths', async () => {
      context.setParameters({
        workspaces: {
          workspaces: [
            workspace,
            {
              ...workspace,
              name: 'pkg-b',
              path: 'packages/b',
              dependencyRelease: true
            }
          ]
        }
      });

      await plugin.restoreIgnorePackages();

      expect(plugin.shell.exec).toHaveBeenCalledWith([
        'git',
        'restore',
        'packages/b'
      ]);
    });

    it('should log dry-run preview without restoring', async () => {
      const dryRunContext = new ReleaseContext(
        'release',
        createTestReleaseOptions({
          dryRun: true,
          options: {
            workspaces: {
              workspaces: [
                {
                  ...workspace,
                  dependencyRelease: true
                }
              ]
            }
          }
        })
      );
      const dryRunPlugin = new ChangesetVersion(dryRunContext);
      vi.spyOn(dryRunPlugin.shell, 'exec').mockResolvedValue('');

      await dryRunPlugin.restoreIgnorePackages();

      expect(dryRunPlugin.shell.exec).not.toHaveBeenCalled();
    });
  });

  describe('generateChangesetFile', () => {
    it('should skip dependency-release workspaces', async () => {
      const writeSpy = vi.mocked(writeFileSync);

      await plugin.generateChangesetFile({
        ...workspace,
        dependencyRelease: true
      });

      expect(writeSpy).not.toHaveBeenCalled();
    });

    it('should write changeset file for direct source workspaces', async () => {
      vi.mocked(existsSync).mockImplementation((path) => {
        const pathStr = String(path).replace(/\\/g, '/');
        if (pathStr.endsWith('/.changeset')) {
          return true;
        }
        if (pathStr.includes('/.changeset/') && pathStr.endsWith('.md')) {
          return false;
        }
        return true;
      });

      vi.spyOn(context, 'format').mockReturnValue(
        "---\n'pkg-a': 'patch'\n---\n\n- feat: initial"
      );

      await plugin.generateChangesetFile(workspace);

      expect(writeFileSync).toHaveBeenCalledWith(
        join(context.rootPath, '.changeset', 'pkg-a@1.0.0.md'),
        "---\n'pkg-a': 'patch'\n---\n\n- feat: initial",
        'utf-8'
      );
    });
  });
});
