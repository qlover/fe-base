import { join } from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import {
  createWorkspaceValue,
  isPrivateWorkspace,
  readJson,
  resolveWorkspacePackagePath,
  shouldProcessWorkspace,
  workspaceVersionSummary,
  worksapce2name
} from '../../src/utils/createWorkspace';

vi.mock('fs', () => ({
  readFileSync: vi.fn()
}));

describe('createWorkspace', () => {
  beforeEach(() => {
    vi.mocked(readFileSync).mockReset();
  });

  describe('worksapce2name', () => {
    it('should format name@version', () => {
      expect(worksapce2name({ name: 'pkg-a', version: '1.0.0' })).toBe(
        'pkg-a@1.0.0'
      );
    });
  });

  describe('workspaceVersionSummary', () => {
    it('should show version bump arrow', () => {
      expect(
        workspaceVersionSummary({
          name: 'pkg-a',
          version: '1.0.0',
          newVersion: '1.0.1',
          path: 'packages/a',
          root: '/repo/packages/a',
          packageJson: {}
        })
      ).toBe('pkg-a: 1.0.0 -> 1.0.1');
    });

    it('should prefix dependency-release workspaces', () => {
      expect(
        workspaceVersionSummary({
          name: 'pkg-b',
          version: '2.0.0',
          path: 'packages/b',
          root: '/repo/packages/b',
          packageJson: {},
          dependencyRelease: true
        })
      ).toBe('(DEP) pkg-b@2.0.0');
    });
  });

  describe('shouldProcessWorkspace', () => {
    const workspace = {
      name: 'pkg-a',
      version: '1.0.0',
      path: 'packages/a',
      root: '/repo/packages/a',
      packageJson: {},
      dependencyRelease: true
    };

    it('should process dependency-release when not ignoring', () => {
      expect(shouldProcessWorkspace(workspace, false)).toBe(true);
    });

    it('should skip dependency-release when ignoring non-updated packages', () => {
      expect(shouldProcessWorkspace(workspace, true)).toBe(false);
    });
  });

  describe('isPrivateWorkspace', () => {
    it('should detect private packages', () => {
      expect(isPrivateWorkspace({ packageJson: { private: true } })).toBe(true);
      expect(isPrivateWorkspace({ packageJson: { private: false } })).toBe(
        false
      );
      expect(isPrivateWorkspace({ packageJson: {} })).toBe(false);
    });
  });

  describe('resolveWorkspacePackagePath', () => {
    it('should resolve paths from rootPath and relative path', () => {
      const result = resolveWorkspacePackagePath({
        path: 'packages/test-package',
        rootPath: '/root'
      });

      expect(result).toEqual({
        root: join('/root', 'packages/test-package'),
        manifestPath: 'package.json',
        packagePath: join('/root', 'packages/test-package', 'package.json')
      });
    });

    it('should throw when path is missing', () => {
      expect(() =>
        resolveWorkspacePackagePath({ path: '' as unknown as string })
      ).toThrow('path is required');
    });
  });

  describe('createWorkspaceValue', () => {
    it('should create a workspace object with provided values', () => {
      const workspace = createWorkspaceValue({
        path: 'packages/test-package',
        rootPath: '/root',
        packageJson: {
          name: 'test-package',
          version: '1.0.0'
        },
        name: 'test-package',
        version: '1.0.0',
        root: join('/root', 'packages/test-package')
      });

      expect(workspace.name).toBe('test-package');
      expect(workspace.version).toBe('1.0.0');
      expect(workspace.path).toBe('packages/test-package');
      expect(workspace.root).toBe(join('/root', 'packages/test-package'));
    });

    it('should throw when path is not provided', () => {
      expect(() =>
        createWorkspaceValue({
          packageJson: {
            name: 'test-package',
            version: '1.0.0'
          }
        } as never)
      ).toThrow('path is not required!');
    });

    it('should read packageJson from disk when not provided', () => {
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          name: 'test-package',
          version: '1.0.0'
        })
      );

      const workspace = createWorkspaceValue({
        path: 'packages/test-package',
        rootPath: '/root'
      });

      expect(workspace.name).toBe('test-package');
      expect(workspace.version).toBe('1.0.0');
      expect(readFileSync).toHaveBeenCalledWith(
        join('/root', 'packages/test-package', 'package.json'),
        'utf-8'
      );
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', () => {
      vi.mocked(readFileSync).mockReturnValue(
        JSON.stringify({
          name: 'test-package',
          version: '1.0.0'
        })
      );

      const result = readJson('/path/to/package.json');

      expect(result).toEqual({
        name: 'test-package',
        version: '1.0.0'
      });
    });
  });
});
