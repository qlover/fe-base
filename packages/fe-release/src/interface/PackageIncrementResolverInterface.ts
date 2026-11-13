/**
 * @module PackageIncrementResolverInterface
 * @description 按包名、目录、目录名查找单独的 semver increment
 */
import type { WorkspaceInterface } from './WorkspaceInterface';

export const VersionIncrement = {
  patch: 'patch',
  minor: 'minor',
  major: 'major'
} as const;

export type VersionIncrementType =
  (typeof VersionIncrement)[keyof typeof VersionIncrement];

/**
 * 命令行或 fe-config 里的按包 increment。
 *
 * key 为包名、包目录或目录名。
 */
export interface PackageIncrementSource {
  readonly packageIncrements?: Readonly<Record<string, string>>;
}

/**
 * 在一张增量对照表里为单个包取值。
 */
export interface PackageIncrementResolverInterface {
  /**
   * @param workspace 至少包含包名和相对目录
   * @returns 命中的 increment；没有该包的配置时返回 `undefined`
   */
  resolve(
    workspace: Pick<WorkspaceInterface, 'name' | 'path'>
  ): VersionIncrementType | undefined;
}
