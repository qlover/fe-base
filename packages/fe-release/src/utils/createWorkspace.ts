import { readFileSync } from 'fs';
import { join, isAbsolute } from 'path';
import { MANIFEST_PATH } from '../defaults';
import { WorkspaceValue } from '../implments/WorkspaceValue';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';

/**
 * 将 workspace 对象转成 name
 *
 * @example
 * ```
 * pkgname@1.1.0
 * ```
 * @param worksapce
 * @returns
 */
export function worksapce2name(
  worksapce: Pick<WorkspaceInterface, 'name' | 'version'>
): string {
  return `${worksapce.name}@${worksapce.version}`;
}

export function workspaceVersionSummary(workspace: WorkspaceInterface): string {
  const { name, version, newVersion, dependencyRelease } = workspace;
  const prefix = dependencyRelease ? '(DEP) ' : '';

  if (newVersion && newVersion !== version) {
    return `${prefix}${name}: ${version} -> ${newVersion}`;
  }

  return `${prefix}${name}@${newVersion ?? version}`;
}

/**
 * Whether a workspace should participate in changelog/changeset processing.
 *
 * Returns `false` when `ignoreNonUpdatedPackages` is enabled and the workspace
 * is a `dependencyRelease` entry (restore-only tracking).
 */
export function shouldProcessWorkspace(
  workspace: WorkspaceInterface,
  ignoreNonUpdatedPackages: boolean
): boolean {
  return !(ignoreNonUpdatedPackages && workspace.dependencyRelease);
}

export function readJson(path: string): Record<string, unknown> {
  const packageJsonContent = readFileSync(path, 'utf-8');
  return JSON.parse(packageJsonContent);
}

export type WorkspaceManifestSource = {
  path: string;
  root?: string;
  rootPath?: string;
  /**
   * @default `package.json`
   */
  manifest_path?: string;
};

export type WorkspacePackageOnDisk = {
  root: string;
  packagePath: string;
  manifestPath: string;
  version: string;
  packageJson: Record<string, unknown>;
};

export function resolveWorkspacePackagePath(
  options: WorkspaceManifestSource
): Pick<WorkspacePackageOnDisk, 'root' | 'packagePath' | 'manifestPath'> {
  const { path, root, rootPath, manifest_path = MANIFEST_PATH } = options;

  if (!path) {
    throw new Error('path is required');
  }

  const root2 =
    root ||
    (rootPath ? (isAbsolute(path) ? path : join(rootPath, path)) : path);
  const manifestPath = manifest_path;

  return {
    root: root2,
    manifestPath,
    packagePath: join(root2, manifestPath)
  };
}

/**
 * Read workspace package.json from disk without creating a WorkspaceValue.
 */
export function readWorkspacePackageFromDisk(
  options: WorkspaceManifestSource
): WorkspacePackageOnDisk {
  const { root, packagePath, manifestPath } =
    resolveWorkspacePackagePath(options);
  const packageJson = readJson(packagePath);

  return {
    root,
    packagePath,
    manifestPath,
    version: String(packageJson.version ?? ''),
    packageJson
  };
}

export function createWorkspaceValue(
  workspace: Partial<WorkspaceValue> & WorkspaceManifestSource
): WorkspaceValue {
  const {
    root,
    packageJson,
    manifest_path = MANIFEST_PATH,
    path,
    rootPath,
    version,
    newVersion,
    ...rest
  } = workspace;

  if (!path) {
    throw new Error('path is not required!');
  }

  const { root: root2, packagePath } = resolveWorkspacePackagePath({
    path,
    root,
    rootPath,
    manifest_path
  });
  const packageJson2 = packageJson || readJson(packagePath);

  return new WorkspaceValue({
    ...rest,
    newVersion,
    manifestPath: manifest_path,
    packagePath,
    name: packageJson2.name as string,
    version: version ?? (packageJson2.version as string),
    path,
    root: root2,
    packageJson: packageJson2
  });
}
