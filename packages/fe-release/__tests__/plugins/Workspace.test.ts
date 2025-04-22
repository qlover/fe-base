import '../MockReleaseContextDep';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Workspaces, {
  type WorkspaceValue
} from '../../src/plugins/workspaces/Workspaces';
import { createTestReleaseContext } from '../helpers';
import type { ReleaseContext } from '../../src';
import type ReleaseTask from '../../src/implments/ReleaseTask';

describe('Workspaces Plugin', () => {
  let context: ReleaseContext;
  let workspaces: Workspaces;
  let mockReleaseTask: ReleaseTask;

  beforeEach(() => {
    context = createTestReleaseContext({
      shared: {
        packagesDirectories: ['packages/package-a', 'packages/package-b']
      }
    });

    workspaces = new Workspaces(context);

    mockReleaseTask = {
      run: vi.fn().mockResolvedValue(undefined)
    } as unknown as ReleaseTask;

    workspaces.setReleaseTask(mockReleaseTask);

    vi.spyOn(workspaces.shell, 'exec').mockResolvedValue(
      'packages/package-a/index.ts\npackages/package-b/package.json'
    );

    // mock readJson method for testing getWorkspaces
    // @ts-expect-error test non-string case
    vi.spyOn(workspaces, 'readJson').mockImplementation((path) => {
      if (path.includes('package-a')) {
        return {
          name: 'package-a',
          version: '0.1.0'
        };
      }
      if (path.includes('package-b')) {
        return {
          name: 'package-b',
          version: '0.2.0'
        };
      }
      return {};
    });
  });

  describe('basic features', () => {
    it('should be initialized correctly', () => {
      expect(workspaces.pluginName).toBe('workspaces');
      expect(workspaces.enabled()).toBe(true);
    });

    it('when skip is set to true, enabled should return false', () => {
      workspaces.setConfig({ skip: true });
      expect(workspaces.enabled()).toBe(false);
    });

    it('when internal _skip is true, enabled should return false', () => {
      workspaces['_skip'] = true;
      expect(workspaces.enabled()).toBe(false);
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
        ['changes:packages/package-a']
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
      // @ts-expect-error test non-string case
      vi.spyOn(workspaces.shell, 'exec').mockResolvedValue(null);

      // @ts-expect-error call private method for testing
      const result = await workspaces.getGitWorkspaces();

      expect(result).toEqual([]);
    });
  });

  describe('getWorkspaces', () => {
    it('should return changed workspaces list', async () => {
      const workspacesResult = await workspaces.getWorkspaces();

      // packages-a and packages-b
      expect(workspacesResult).toHaveLength(2);
      expect(workspacesResult[0].name).toBe('package-a');
      expect(workspacesResult[0].version).toBe('0.1.0');
      expect(workspacesResult[0].path).toBe('packages/package-a');
    });
  });

  describe('setCurrentWorkspace', () => {
    it('should set current workspace and update context shared data', () => {
      const workspace = {
        name: 'test-workspace',
        version: '1.1.0',
        path: 'path/to/workspace',
        root: '/absolute/path/to/workspace',
        packageJson: {
          name: 'test-workspace',
          version: '1.1.0'
        }
      };

      workspaces.setCurrentWorkspace(workspace);

      expect(workspaces.getConfig('workspace')).toEqual(workspace);
      expect(context.shared.publishPath).toBe('path/to/workspace');
      expect(context.workspace!.packageJson).toEqual({
        name: 'test-workspace',
        version: '1.1.0'
      });
    });
  });

  describe('lifecycle methods', () => {
    it('onBefore: when a workspace is specified, should use that workspace', async () => {
      const workspace = {
        name: 'specified-workspace',
        version: '2.0.0',
        path: 'path/to/specified',
        root: '/absolute/path/to/specified',
        packageJson: {
          name: 'specified-workspace',
          version: '2.0.0'
        }
      };

      workspaces.setConfig({ workspace });

      await workspaces.onBefore();

      expect(workspaces.getConfig('workspace')).toEqual(workspace);
    });

    it('onBefore: when there is no changed workspace and skipCheckPackage is true, should not set current workspace', async () => {
      vi.spyOn(workspaces.shell, 'exec').mockResolvedValue(
        'other/path/file.js'
      );
      workspaces.setConfig({ skipCheckPackage: true });

      await expect(workspaces.onBefore()).rejects.toThrow(
        'No changes to publish packages'
      );

      expect(workspaces.getConfig('workspace')).toBeUndefined();
    });

    it('onBefore: when there is a changed workspace, should set the first workspace as the current workspace', async () => {
      await workspaces.onBefore();

      const currentWorkspace = workspaces.getConfig(
        'workspace'
      ) as WorkspaceValue;
      expect(currentWorkspace).toBeDefined();
      expect(currentWorkspace?.name).toBe('package-a');
    });
  });
});
