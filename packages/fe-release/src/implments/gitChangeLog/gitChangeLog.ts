import type { Shell } from '@qlover/scripts-context';

export interface PRCommit {
  hash: string;
  raw: {
    title: string;
    body: string;
  };
  title: {
    type?: string;
    scope?: string;
    message: string;
  };
  commits: CommitInfo[];
  prNumber?: string;
}
export interface CommitInfo {
  raw: string;
  type?: string;
  scope?: string;
  message: string;
  body?: string;
}

export interface FlatCommit extends CommitInfo {
  prNumber?: string;
  hash: string;
  parentHash: string;
  parentCommit: {
    title: {
      type?: string;
      scope?: string;
      message: string;
    };
    raw: {
      title: string;
      body: string;
    };
    hash: string;
    prNumber?: string;
  };
}

export interface GitChangelogOptions {
  /**
   * 开始 tag
   */
  from?: string;
  /**
   * 结束 tag
   */
  to?: string;
  /**
   * 限定目录
   */
  directory?: string;
  /**
   * 自定义 log 格式
   * @default '%h %s'
   */
  format?: string;
  /**
   * 是否不包含合并的 commit
   * @default true
   */
  noMerges?: boolean;
  /**
   * 自定义 commit 类型
   */
  types?: { type: string; section?: string; hidden?: boolean }[];

  /**
   * 自定义 commit 格式
   * @default '* ${message}${prRef}\n'
   */
  formatTemplate?: string;
  formatter?: GitChangelogFormatter;
}

export class GitChangelogFormatter {
  formatFlatCommits(
    commits: FlatCommit[],
    options: Pick<GitChangelogOptions, 'types' | 'formatTemplate'>,
    shell: Shell
  ): string[] {
    const { types = [], formatTemplate = '* ${message}${prRef}\n' } = options;
    const commitsByType = new Map<string, typeof commits>();

    for (const commit of commits) {
      const type = commit.type || 'other';

      if (!commitsByType.has(type)) {
        commitsByType.set(type, []);
      }
      commitsByType.get(type)!.push(commit);
    }

    const changelog: string[] = [];

    for (const { type, section, hidden } of types) {
      if (hidden) continue;

      const typeCommits = commitsByType.get(type);
      if (!typeCommits?.length) continue;

      changelog.push(`${section || type}`);

      for (const commit of typeCommits) {
        const prRef = commit.prNumber ? ` (#${commit.prNumber})` : '';
        changelog.push(
          shell.format(formatTemplate, {
            ...commit,
            prRef
          })
        );

        // 如果有 body，添加缩进的 body 内容
        if (commit.body) {
          const bodyLines = commit.body.split('\n').map((line) => `  ${line}`);
          changelog.push(bodyLines.join('\n'));
        }
      }
    }

    return changelog;
  }
}

export class GitChangelog {
  constructor(
    protected shell: Shell,
    protected options: GitChangelogOptions
  ) {}

  private parseCommitBody(body: string): CommitInfo[] {
    const lines = body.split('\n').filter(Boolean);
    const commits: CommitInfo[] = [];

    let currentCommit: {
      raw: string;
      type?: string;
      scope?: string;
      message: string;
      bodyLines?: string[];
    } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (
        line.startsWith('Co-authored-by:') ||
        line === '---------' ||
        line.length === 0
      ) {
        continue;
      }

      const commitMatch = line.match(
        /^\*?\s*(?:([a-z]+)(?:\((.*?)\))?: )?(.+)$/i
      );

      if (commitMatch && line.startsWith('*')) {
        if (currentCommit) {
          commits.push({
            ...currentCommit,
            body: currentCommit.bodyLines?.join('\n').trim()
          });
        }

        const [raw, type, scope, message] = commitMatch;
        currentCommit = {
          // @ts-expect-error
          matchRaw: raw,
          raw: line,
          type: type?.toLowerCase(),
          scope: scope?.trim(),
          message: message.trim(),
          bodyLines: []
        };
      } else if (currentCommit && line.startsWith('-')) {
        currentCommit.bodyLines?.push(line);
      }
    }

    if (currentCommit) {
      commits.push({
        ...currentCommit,
        body: currentCommit.bodyLines?.join('\n').trim()
      });
    }

    return commits;
  }

  async getPRCommits(options?: GitChangelogOptions): Promise<PRCommit[]> {
    const { from, to, directory, format } = {
      ...this.options,
      ...options
    };

    const log = await this.getLog({
      from,
      to,
      directory,
      format,
      noMerges: false
    });

    const commits = log.split('\n----------------------\n').filter(Boolean);

    return commits.map((commit) => {
      const [hash, title, ...bodyLines] = commit.trim().split('\n');
      const body = bodyLines.join('\n');

      const prMatch = title.match(/\(#(\d+)\)/);
      const titleMatch = title
        .replace(/\s*\(#\d+\)\s*$/, '')
        .match(/^(?:([a-z]+)(?:\((.*?)\))?: )?(.+)$/i);

      return {
        hash,
        raw: {
          title,
          body
        },
        title: titleMatch
          ? {
              type: titleMatch[1]?.toLowerCase(),
              scope: titleMatch[2]?.trim(),
              message: titleMatch[3].trim()
            }
          : {
              message: title.replace(/\s*\(#\d+\)\s*$/, '').trim()
            },
        commits: this.parseCommitBody(body),
        prNumber: prMatch?.[1]
      };
    });
  }

  async hasTag(tagName: string): Promise<boolean> {
    return this.shell
      .exec(`git tag --list "${tagName}"`, { dryRun: false })
      .then(() => true)
      .catch(() => false);
  }

  private async resolveTag(tag?: string, fallback?: string): Promise<string> {
    if (tag) {
      // Properly escape tag names with special characters
      try {
        // Check if tag exists (using quotes to handle special characters)
        const exists = await this.shell
          .exec(`git tag --list "${tag}"`, { dryRun: false })
          .then((out) => !!out.trim());

        if (exists) return tag;
      } catch {
        // If there's an error checking the tag, fall through to fallback
      }
    }

    if (fallback === 'root') {
      // 获取仓库初始 commit
      return this.shell
        .exec(`git rev-list --max-parents=0 HEAD`, { dryRun: false })
        .then((out) => out.trim());
    }

    return 'HEAD';
  }

  async getLog(options: GitChangelogOptions): Promise<string> {
    const {
      directory,
      format = '%H%n%s%n%b%n----------------------',
      noMerges = true
    } = options;

    const from = await this.resolveTag(options.from, 'root');
    const to = await this.resolveTag(options.to, 'HEAD');

    const range = from === to ? to : `${from}..${to}`;
    const dirArg = directory ? `-- "${directory}"` : '';

    const noMergesArg = noMerges ? '--no-merges' : '';
    const command = `git log --pretty=format:"${format}" ${noMergesArg} ${range} ${dirArg}`;

    return this.shell.exec(command.trim(), { dryRun: false });
  }

  flatCommits(prCommits: PRCommit[]): FlatCommit[] {
    const flatCommits: Array<FlatCommit> = [];

    for (const prCommit of prCommits) {
      const parentCommit = {
        title: prCommit.title,
        raw: prCommit.raw,
        hash: prCommit.hash,
        prNumber: prCommit.prNumber
      };

      if (Array.isArray(prCommit.commits) && prCommit.commits.length > 0) {
        // 保留原有结构，在此基础上扩展
        const commits = prCommit.commits.map((commit) => ({
          ...commit, // 保留所有原有属性，包括 raw, type, scope, message, bodyLines, body 等
          prNumber: prCommit.prNumber,
          hash: prCommit.hash, // 使用 PR commit 的 hash
          parentHash: prCommit.hash, // 使用 PR commit 的 hash 作为 parentHash
          parentCommit // 引用外部定义的 parentCommit 对象
        }));

        flatCommits.push(...commits);
      } else {
        // 当 commits 为空时，将 PR commit 本身扁平化
        flatCommits.push({
          // CommitInfo 部分，使用 PR commit 的 title 信息
          raw: prCommit.raw.title, // 使用原始 PR 标题作为 raw
          type: prCommit.title.type,
          scope: prCommit.title.scope,
          message: prCommit.title.message,
          // body 可以留空，因为没有单独的 commit body
          body: undefined,

          // FlatCommit 特有部分
          prNumber: prCommit.prNumber,
          hash: prCommit.hash,
          parentHash: prCommit.hash, // 指向自身 hash
          parentCommit // 引用外部定义的 parentCommit 对象
        });
      }
    }

    return flatCommits;
  }

  formatFlatCommits(
    commits: FlatCommit[],
    options?: Pick<GitChangelogOptions, 'types'>
  ): string[] {
    const { types = [], formatter } = { ...this.options, ...options };

    const _formatter = formatter || new GitChangelogFormatter();

    return _formatter.formatFlatCommits(commits, { types }, this.shell);
  }
}
