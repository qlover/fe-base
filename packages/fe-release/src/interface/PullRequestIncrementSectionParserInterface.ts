/**
 * @module PullRequestIncrementSectionParserInterface
 * @description 从 PR 正文解析 `## Release increments`
 */
import type { VersionIncrementType } from './PackageIncrementResolverInterface';

/**
 * 把 PR 正文里的按包 increment 小节解析成对照表。
 */
export interface PullRequestIncrementSectionParserInterface {
  /**
   * @param body PR 正文；没有该小节时返回空表
   * @returns key 为列表里写下的包名或目录，value 为 patch、minor 或 major
   */
  parse(body: string): Readonly<Record<string, VersionIncrementType>>;
}
