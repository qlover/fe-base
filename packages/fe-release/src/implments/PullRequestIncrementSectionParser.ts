/**
 * @module PullRequestIncrementSectionParser
 * @description 解析 PR 正文中的 `## Release increments` 小节
 *
 * 列表项形如 `- @qlover/code2markdown: minor` 或 `- fe-release: patch`。
 * 非法级别直接抛出，避免静默退回全局 increment。
 */
import {
  VersionIncrement,
  type VersionIncrementType
} from '../interface/PackageIncrementResolverInterface';
import type { PullRequestIncrementSectionParserInterface } from '../interface/PullRequestIncrementSectionParserInterface';

const SECTION_HEADING = /^#{1,6}\s+Release increments\s*$/i;
const NEXT_HEADING = /^#{1,6}\s+\S/;
const INCREMENT_ITEM =
  /^\s*[-*]\s+(.+?)\s*:\s*(patch|minor|major)\s*$/i;
const INVALID_INCREMENT_ITEM = /^\s*[-*]\s+(.+?)\s*:\s*(\S+)\s*$/;

/**
 * 从 PR 正文抽出按包 increment。没有该小节时返回空表。
 */
export class PullRequestIncrementSectionParser
  implements PullRequestIncrementSectionParserInterface
{
  /**
   * @override
   */
  public parse(body: string): Readonly<Record<string, VersionIncrementType>> {
    const lines = body.replace(/\r\n/g, '\n').split('\n');
    const start = lines.findIndex((line) => SECTION_HEADING.test(line.trim()));
    if (start < 0) {
      return {};
    }

    const increments: Record<string, VersionIncrementType> = {};

    for (const line of lines.slice(start + 1)) {
      if (NEXT_HEADING.test(line.trim())) {
        break;
      }

      const matched = INCREMENT_ITEM.exec(line);
      if (matched) {
        const target = matched[1].trim();
        if (target) {
          increments[target] = matched[2].toLowerCase() as VersionIncrementType;
        }
        continue;
      }

      const invalid = INVALID_INCREMENT_ITEM.exec(line);
      if (invalid) {
        const target = invalid[1].trim();
        const value = invalid[2].trim();
        if (
          value !== VersionIncrement.patch &&
          value !== VersionIncrement.minor &&
          value !== VersionIncrement.major
        ) {
          throw new Error(
            `Invalid package increment "${value}" for "${target}". Must be patch, minor, or major`
          );
        }
      }
    }

    return increments;
  }
}
