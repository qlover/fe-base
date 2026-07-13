/**
 * @module WorkspaceInterface
 * @description Core data model for a monorepo package in a release run
 *
 * Represents one publishable workspace discovered by the {@link Workspaces}
 * plugin and passed through {@link ChangesetVersion} and {@link Github}.
 *
 * Typical lifecycle fields:
 * - `version` / `newVersion` — before and after `changeset version`
 * - `lastTag` — git baseline for changelog generation
 * - `dependencyRelease` — internal dependent bumped only because a dependency changed
 */
import type { PackageJson } from '../type';
export interface WorkspaceInterface {
  /**
   * Package name from package.json
   */
  name: string;
  /**
   * Current version from package.json before bump
   */
  version: string;

  /**
   * Version after `changeset version`, read from package.json on disk.
   *
   * - Before bump: usually undefined
   * - After bump: latest version on disk; may equal `version` if unchanged
   */
  newVersion?: string;
  /**
   * The relative path of the workspace
   */
  path: string;
  /**
   * The absolute path of the workspace
   */
  root: string;

  /**
   * The package.json of the workspace
   */
  packageJson: PackageJson;

  /**
   * Release tag name after version bump (for example `pkg@1.0.1`).
   *
   * Set by ChangesetVersion.mergeWorkspaces only when `newVersion` differs
   * from `version`. Not available before `changeset version` completes.
   */
  tagName?: string;

  /**
   * Previous release tag used as the git changelog baseline
   */
  lastTag?: string;

  /**
   * The changelog of the workspace
   * 
   */
  changelog?: string;

  /**
   * Whether this workspace is an internal dependent bumped only because a
   * dependency was released (not directly changed in git).
   *
   * Set by the Workspaces plugin when `includeDependencyReleases` is enabled.
   * Processing rules depend on `changesetVersion.ignoreNonUpdatedPackages`:
   *
   * - `false`: included in changelog template flow and version bump logs
   * - `true`: tracked for restore only; skipped in changelog generation
   *
   * @default false
   */
  dependencyRelease?: boolean;
}
