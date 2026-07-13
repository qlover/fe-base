/**
 * @module createWorkspace
 * @description Workspace factory and path helpers for fe-release
 *
 * Replaces the legacy `WorkspaceCreator` module. Provides utilities to:
 * - Resolve `package.json` paths inside a monorepo root
 * - Read workspace manifests from disk
 * - Build {@link WorkspaceValue} instances for plugins
 * - Format workspace names and version summaries for logging
 *
 * @example Create a workspace from a relative path
 * ```typescript
 * const workspace = createWorkspaceValue({
 *   path: 'packages/fe-release',
 *   rootPath: process.cwd()
 * });
 * ```
 */
import { readFileSync } from 'fs';
import { join, isAbsolute } from 'path';
import { MANIFEST_PATH } from '../defaults';
import { WorkspaceValue } from '../implments/WorkspaceValue';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';

/**
 * Format a workspace as `name@version`.
 *
 * @example
 * ```
 * pkgname@1.1.0
 * ```
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
  /** Relative path from monorepo root to the workspace directory */
  path: string;
  /** Absolute workspace root; derived from `rootPath` + `path` when omitted */
  root?: string;
  /** Monorepo root used to resolve relative `path` values */
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

/**
 * Resolve absolute workspace root and package.json path from manifest source options.
 *
 * @throws Error when `path` is missing
 */
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

/**
 * Build a {@link WorkspaceValue} from partial workspace data and disk manifest.
 *
 * Reads `package.json` from disk when `packageJson` is not provided.
 *
 * @throws Error when `path` is missing
 */
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
