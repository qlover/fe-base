import type { WorkspaceValue } from './Workspaces';
import { readFileSync } from 'fs';
import { join } from 'path';
import { MANIFEST_PATH } from '../../defaults';

export class WorkspaceCreator {
  public static readJson(path: string): Record<string, unknown> {
    const packageJsonContent = readFileSync(path, 'utf-8');
    return JSON.parse(packageJsonContent);
  }

  public static toWorkspace(
    workspace: Partial<WorkspaceValue>,
    rootPath: string
  ): WorkspaceValue {
    let { root, packageJson } = workspace;
    const path = workspace.path as string;

    if (!path) {
      throw new Error('path is not required!');
    }

    root = root || join(rootPath, path);
    packageJson =
      packageJson || WorkspaceCreator.readJson(join(root, MANIFEST_PATH));

    return {
      name: packageJson.name as string,
      version: packageJson.version as string,
      path,
      root,
      packageJson
    };
  }
}
