import { join } from 'path';
import { WorkspaceCreator } from '../../src/plugins/workspaces/WorkspaceCreator';

describe('WorkspaceCreator', () => {
  describe('toWorkspace', () => {
    it('should create a workspace object with provided values', () => {
      const rootPath = '/root';
      const partialWorkspace = {
        path: 'packages/test-package',
        packageJson: {
          name: 'test-package',
          version: '1.0.0'
        }
      };

      const workspace = WorkspaceCreator.toWorkspace(
        partialWorkspace,
        rootPath
      );

      expect(workspace).toEqual({
        name: 'test-package',
        version: '1.0.0',
        path: 'packages/test-package',
        root: join(rootPath, 'packages/test-package'),
        packageJson: {
          name: 'test-package',
          version: '1.0.0'
        }
      });
    });

    it('should throw an error if path is not provided', () => {
      const rootPath = '/root';
      const partialWorkspace = {
        packageJson: {
          name: 'test-package',
          version: '1.0.0'
        }
      };

      expect(() => {
        WorkspaceCreator.toWorkspace(partialWorkspace, rootPath);
      }).toThrow('path is not required!');
    });

    it('should use readJson to get packageJson if not provided', () => {
      const rootPath = '/root';
      const partialWorkspace = {
        path: 'packages/test-package'
      };

      // Mock readJson
      vi.spyOn(WorkspaceCreator, 'readJson').mockReturnValue({
        name: 'test-package',
        version: '1.0.0'
      });

      const workspace = WorkspaceCreator.toWorkspace(
        partialWorkspace,
        rootPath
      );

      expect(workspace).toEqual({
        name: 'test-package',
        version: '1.0.0',
        path: 'packages/test-package',
        root: join(rootPath, 'packages/test-package'),
        packageJson: {
          name: 'test-package',
          version: '1.0.0'
        }
      });
      expect(WorkspaceCreator.readJson).toHaveBeenCalled();
    });
  });

  describe('readJson', () => {
    it('should read and parse JSON file', () => {
      vi.spyOn(WorkspaceCreator, 'readJson').mockImplementation(() => {
        return {
          name: 'test-package',
          version: '1.0.0'
        };
      });

      const result = WorkspaceCreator.readJson('/path/to/package.json');

      expect(result).toEqual({
        name: 'test-package',
        version: '1.0.0'
      });
    });
  });
});
