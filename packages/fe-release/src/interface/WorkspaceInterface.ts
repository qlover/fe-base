import type { PackageJson } from '../type';

/**
 * 该接口用来描述 relesae 时的核心数据， 其中将每个单独的子包抽象成了 WorkspaceInterface 接口类型
 */
export interface WorkspaceInterface {
  /**
   * 包名
   */
  name: string;
  /**
   * 包的版本号
   *
   * - 一般用于表示原始版本号
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
   * 一般用于表示上一次发布的 tag 名字， 用于计算 changelog 时使用
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
