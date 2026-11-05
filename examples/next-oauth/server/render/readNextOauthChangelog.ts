import { readFile } from 'fs/promises';
import path from 'path';

/**
 * 单次发布记录（`CHANGELOG.md` 中一个 `##` 版本块）。
 */
export type NextOauthChangelogReleaseType = {
  readonly version: string;
  /** `## <version>` 标题下的 Markdown 正文。 */
  readonly body: string;
};

/**
 * 读取 `examples/next-oauth/CHANGELOG.md`（构建时 SSG），按版本分段，新版本在前。
 *
 * @returns 版本列表
 */
export async function readNextOauthChangelog(): Promise<
  NextOauthChangelogReleaseType[]
> {
  const candidates = [
    path.join(process.cwd(), 'CHANGELOG.md'),
    path.join(process.cwd(), 'examples', 'next-oauth', 'CHANGELOG.md')
  ];
  for (const file of candidates) {
    try {
      return parseNextOauthChangelog(await readFile(file, 'utf8'));
    } catch {
      // 尝试下一候选路径
    }
  }
  throw new Error('next-oauth CHANGELOG.md not found');
}

/**
 * 将 changelog Markdown 拆成版本块。
 *
 * @param markdown - 完整 CHANGELOG 文本
 * @returns 版本列表（文件顺序，通常新→旧）
 */
export function parseNextOauthChangelog(
  markdown: string
): NextOauthChangelogReleaseType[] {
  const releases: NextOauthChangelogReleaseType[] = [];
  let currentVersion: string | null = null;
  const lines: string[] = [];

  const flush = (): void => {
    if (currentVersion !== null) {
      releases.push({
        version: currentVersion,
        body: lines.join('\n').trim()
      });
    }
    lines.length = 0;
  };

  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      currentVersion = heading[1]!;
      continue;
    }
    if (currentVersion !== null) {
      lines.push(line);
    }
  }
  flush();

  return releases;
}
