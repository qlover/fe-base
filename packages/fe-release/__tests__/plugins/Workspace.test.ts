import { describe, it, expect, vi, beforeEach } from 'vitest';
import Workspaces from '../../src/plugins/Workspaces';
import * as createWorkspaceModule from '../../src/utils/createWorkspace';
import { WorkspaceValue } from '../../src/implments/WorkspaceValue';
import { createTestReleaseOptions } from '../helpers';
import { ReleaseContext } from '../../src';
import { getPackages } from '@manypkg/get-packages';
import { getDependentsGraph } from '@changesets/get-dependents-graph';

vi.mock('@manypkg/get-packages', () => ({
  getPackages: vi.fn().mockResolvedValue({
    packages: [],
    tool: 'pnpm'
  })
}));

vi.mock('@changesets/get-dependents-graph', () => ({
  getDependentsGraph: vi.fn().mockReturnValue(new Map())
}));

describe('Workspaces Plugin', () => {
  let context: ReleaseContext;
  let workspaces: Workspaces;

  beforeEach(() => {
    context = new ReleaseContext(
      'release',
      createTestReleaseOptions({
        options: {
          workspaces: {
            packagesDirectories: ['packages/package-a', 'packages/package-b'],
            includeDependencyReleases: false
          }
        }
      })
    );

    workspaces = new Workspaces(context);

    vi.spyOn(workspaces.shell, 'exec').mockImplementation(async (cmd) => {
      const command = Array.isArray(cmd) ? cmd.join(' ') : String(cmd);

      if (command.includes('git diff --name-only')) {
        return 'packages/package-a/index.ts\npackages/package-b/package.json';
      }

      if (command.includes('git for-each-ref')) {
        return '';
      }

      return '';
    });

    vi.spyOn(createWorkspaceModule, 'createWorkspaceValue').mockImplementation(
      (partial) => {
        const path = partial.path || '';
        const isA = path.includes('package-a');

        return new WorkspaceValue({
          name: isA ? 'package-a' : 'package-b',
          version: isA ? '0.1.0' : '0.2.0',
          path,
          root: `/repo/${path}`,
          packageJson: {
            name: isA ? 'package-a' : 'package-b',
            version: isA ? '0.1.0' : '0.2.0'
          },
          ...partial
        });
      }
    );
  });

  describe('basic features', () => {
    it('should be initialized correctly', () => {
      expect(workspaces.pluginName).toBe('workspaces');
      expect(workspaces.enabled('onBefore', context)).toBe(true);
    });

    it('when skip is set to true, enabled should return false', () => {
      workspaces.setConfig({ skip: true });
      expect(workspaces.enabled('onBefore', context)).toBe(false);
    });
  });

  describe('getChangedPackages', () => {
    it('should return changed packages', async () => {
      const result = await workspaces.getChangedPackages([
        'packages/package-a',
        'packages/package-b'
      ]);
      expect(result).toEqual(['packages/package-a', 'packages/package-b']);
    });

    it('should return changed packages by changeLabels', async () => {
      const result = await workspaces.getChangedPackages(
        ['packages/package-a', 'packages/package-b'],
        ['change:packages/package-a']
      );
      expect(result).toEqual(['packages/package-a']);
    });
  });

  describe('getGitWorkspaces', () => {
    it('should return git diff result', async () => {
      // @ts-expect-error call private method for testing
      const result = await workspaces.getGitWorkspaces();

      expect(result).toEqual([
        'packages/package-a/index.ts',
        'packages/package-b/package.json'
      ]);
      expect(workspaces.shell.exec).toHaveBeenCalled();
    });

    it('when shell.exec returns non-string, should return empty array', async () => {
      vi.spyOn(workspaces.shell, 'exec').mockResolvedValue(null as never);

      // @ts-expect-error call private method for testing
      const result = await workspaces.getGitWorkspaces();

      expect(result).toEqual([]);
    });
  });

  describe('getWorkspaces', () => {
    it('should return changed workspaces list', async () => {
      const workspacesResult = await workspaces.getWorkspaces();

      expect(workspacesResult).toHaveLength(2);
      expect(workspacesResult[0].name).toBe('package-a');
      expect(workspacesResult[0].version).toBe('0.1.0');
      expect(workspacesResult[0].path).toBe('packages/package-a');
    });
  });

  describe('appendDependencyReleaseWorkspaces', () => {
    it('should append internal dependents with dependencyRelease flag', async () => {
      const source = new WorkspaceValue({
        name: '@scope/pkg-a',
        version: '1.0.0',
        path: 'packages/a',
        root: '/repo/packages/a',
        packageJson: { name: '@scope/pkg-a', version: '1.0.0' }
      });

      vi.mocked(getPackages).mockResolvedValue({
        tool: 'pnpm',
        packages: [
          {
            dir: '/repo/packages/a',
            packageJson: { name: '@scope/pkg-a', version: '1.0.0' }
          },
          {
            dir: '/repo/packages/b',
            packageJson: { name: '@scope/pkg-b', version: '2.0.0' }
          }
        ]
      } as never);

      vi.mocked(getDependentsGraph).mockReturnValue(
        new Map([['@scope/pkg-a', ['@scope/pkg-b']]])
      );

      // @ts-expect-error access protected method for testing
      const result = await workspaces.appendDependencyReleaseWorkspaces([
        source
      ]);

      expect(result).toHaveLength(2);
      expect(result[1].name).toBe('@scope/pkg-b');
      expect(result[1].dependencyRelease).toBe(true);
      expect(result[1].dependencyReleaseOf).toBe('@scope/pkg-a');
      expect(result[1].changelog).toContain('@scope/pkg-a');
      expect(result[1].changelog).toContain('1.0.0');
    });

    it('should use source.newVersion in changelog when already known', async () => {
      const source = new WorkspaceValue({
        name: '@scope/pkg-a',
        version: '1.0.0',
        newVersion: '1.1.0',
        path: 'packages/a',
        root: '/repo/packages/a',
        packageJson: { name: '@scope/pkg-a', version: '1.0.0' }
      });

      vi.mocked(getPackages).mockResolvedValue({
        tool: 'pnpm',
        packages: [
          {
            dir: '/repo/packages/a',
            packageJson: { name: '@scope/pkg-a', version: '1.0.0' }
          },
          {
            dir: '/repo/packages/b',
            packageJson: { name: '@scope/pkg-b', version: '2.0.0' }
          }
        ]
      } as never);

      vi.mocked(getDependentsGraph).mockReturnValue(
        new Map([['@scope/pkg-a', ['@scope/pkg-b']]])
      );

      // @ts-expect-error access protected method for testing
      const result = await workspaces.appendDependencyReleaseWorkspaces([
        source
      ]);

      expect(result[1].changelog).toContain('1.0.0');
      expect(result[1].changelog).toContain('1.1.0');
    });
  });

  describe('lifecycle methods', () => {
    it('onBefore: should set workspaces on context', async () => {
      await workspaces.onBefore();

      expect(context.workspaces).toHaveLength(2);
      expect(context.workspaces![0].name).toBe('package-a');
    });

    it('onBefore: when there is no changed workspace, should throw', async () => {
      vi.spyOn(workspaces.shell, 'exec').mockResolvedValue('other/path/file.js');

      await expect(workspaces.onBefore()).rejects.toThrow(
        'No changes to publish packages'
      );
    });
  });
});
