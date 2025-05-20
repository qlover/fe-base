import type { Shell } from '@qlover/scripts-context';
import type {
  BaseCommit,
  ChangeLogInterface,
  Commitlint,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import gitlog, { CommitField } from 'gitlog';

export const CHANGELOG_ALL_FIELDS: CommitField[] = [
  'hash',
  'abbrevHash',
  'treeHash',
  'abbrevTreeHash',
  'parentHashes',
  'abbrevParentHashes',
  'authorName',
  'authorEmail',
  'authorDate',
  'authorDateRel',
  'committerName',
  'committerEmail',
  'committerDate',
  'committerDateRel',
  'subject',
  'body',
  'rawBody',
  'tag'
];

export interface GitChangelogProps extends GitChangelogOptions {
  shell: Shell;
}

export class GitChangelog implements ChangeLogInterface {
  constructor(protected options: GitChangelogProps) {}

  /**
   * Get the git log
   *
   * @param options
   * @returns
   */
  async getGitLog(options: GitChangelogOptions = {}): Promise<BaseCommit[]> {
    const { directory, noMerges = true, fileds } = options;

    const from = await this.resolveTag(options.from, 'root');
    const to = await this.resolveTag(options.to, 'HEAD');

    const range = from === to ? to : `${from}..${to}`;

    const commits = await gitlog({
      repo: '.',
      number: 1000,
      fields: fileds,
      branch: range,
      file: directory,
      nameStatus: false,
      includeMergeCommitFiles: !noMerges
    });

    return commits;
  }

  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    const gitCommits = await this.getGitLog(options);

    return gitCommits.map((commit) => {
      const { subject, rawBody } = commit;
      return {
        base: commit,
        commitlint: this.parseCommitlint(subject || rawBody || ''),
        // commits: body ? this.parseCommitBody(body) : [],
        commits: []
      } as CommitValue;
    });
  }

  protected parseCommitBody(body: string): CommitValue[] {
    const lines = body.split('\n').filter(Boolean);
    const commits: CommitValue[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      const prMatch = line.match(/\(#(\d+)\)/);

      const commitlint = this.parseCommitlint(line);

      if (!commitlint.message) {
        continue;
      }

      const baseCommit: BaseCommit = {
        subject: line,
        rawBody: line,
        body: line,
        hash: undefined,
        abbrevHash: undefined
      } as BaseCommit;

      const commitValue: CommitValue = {
        base: baseCommit,
        commitlint: commitlint,
        commits: [],
        prNumber: prMatch?.[1]
      };

      commits.push(commitValue);
    }

    return commits;
  }

  parseCommitlint(message: string): Commitlint {
    const [title] = message.trim().split('\n');

    const titleMatch = title
      .replace(/\s*\(#\d+\)\s*$/, '')
      .match(/^(?:([a-z]+)(?:\((.*?)\))?: )?(.+)$/i);

    if (titleMatch) {
      return {
        type: titleMatch[1]?.toLowerCase(),
        scope: titleMatch[2]?.trim(),
        message: titleMatch[3].trim()
      };
    }

    return {
      // message: title.replace(/\s*\(#\d+\)\s*$/, '').trim()
      message: title
    };
  }

  toCommitValue(hash: string, message: string): CommitValue {
    const [title] = message.trim().split('\n');

    // 检查是否包含 PR 编号
    const prMatch = title.match(/\(#(\d+)\)/);

    // 使用 parseCommitlint 解析提交标题
    const commitlint = this.parseCommitlint(title);

    // 创建基本的提交对象
    const baseCommit: BaseCommit = {
      hash,
      abbrevHash: hash.substring(0, 7),
      subject: title,
      rawBody: message
    } as BaseCommit;

    // 创建并返回 CommitValue 对象
    return {
      base: baseCommit,
      commitlint,
      commits: [],
      // commits: body ? this.parseCommitBody(body) : [],
      prNumber: prMatch?.[1]
    };
  }

  protected async resolveTag(tag?: string, fallback?: string): Promise<string> {
    if (tag) {
      // Properly escape tag names with special characters
      try {
        // Check if tag exists (using quotes to handle special characters)
        const exists = await this.options.shell
          .exec(`git tag --list "${tag}"`, { dryRun: false })
          .then((out) => !!out.trim());

        if (exists) return tag;
      } catch {
        // If there's an error checking the tag, fall through to fallback
      }
    }

    if (fallback === 'root') {
      return this.options.shell
        .exec(`git rev-list --max-parents=0 HEAD`, { dryRun: false })
        .then((out) => out.trim());
    }

    return 'HEAD';
  }
}
