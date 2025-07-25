import type { ShellInterface } from '@qlover/scripts-context';
import type {
  BaseCommit,
  ChangeLogInterface,
  Commitlint,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import gitlog, { CommitField, GitlogOptions } from 'gitlog';
import type { LoggerInterface } from '@qlover/logger';

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
  shell: ShellInterface;
  logger: LoggerInterface;
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
    const { directory, noMerges = true, fields } = options;

    const from = await this.resolveTag(options.from, 'root');
    const to = await this.resolveTag(options.to, 'HEAD');

    const range = from === to ? to : `${from}..${to}`;

    const gitLogOptions: GitlogOptions<CommitField> = {
      repo: '.',
      number: 1000,
      fields: fields,
      branch: range,
      file: directory,
      nameStatus: false,
      includeMergeCommitFiles: !noMerges
    };

    const commits = await gitlog(gitLogOptions);

    this.options.logger?.debug('GitChangelog', gitLogOptions);
    this.options.logger?.debug('GitChangelog commits', commits);

    return commits;
  }

  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    const gitCommits = await this.getGitLog(options);

    return gitCommits.map((commit) => {
      const { subject, rawBody } = commit;
      return {
        base: commit,
        commitlint: this.parseCommitlint(subject || '', rawBody),
        // commits: body ? this.parseCommitBody(body) : [],
        commits: []
      } as CommitValue;
    });
  }

  protected createBaseCommit(
    message: string,
    target?: Partial<BaseCommit>
  ): BaseCommit {
    return {
      subject: message,
      rawBody: message,
      body: message,
      ...target
    } as BaseCommit;
  }

  /**
   * Tabify the body
   *
   * @since 2.3.2
   * @param body
   * @param size
   * @returns
   */
  tabify(body: string, size = 2): string {
    return body
      .split('\n')
      .map((line) => ' '.repeat(size) + line.trim())
      .join('\n');
  }

  parseCommitlint(subject: string, rawBody: string = ''): Commitlint {
    const [title] = subject.trim().split('\n');
    const bodyLines = rawBody.startsWith(title)
      ? rawBody.replace(title, '')
      : rawBody;

    const titleMatch = title
      .replace(/\s*\(#\d+\)\s*$/, '')
      .match(/^(?:([a-z]+)(?:\((.*?)\))?: )?(.+)$/i);

    if (titleMatch) {
      return {
        type: titleMatch[1]?.toLowerCase(),
        scope: titleMatch[2]?.trim(),
        message: titleMatch[3].trim(),
        body: bodyLines ? this.tabify(bodyLines) : undefined
      };
    }

    return {
      // message: title.replace(/\s*\(#\d+\)\s*$/, '').trim()
      message: title,
      body: bodyLines ? this.tabify(bodyLines) : undefined
    };
  }

  toCommitValue(hash: string, message: string): CommitValue {
    const [title] = message.trim().split('\n');

    const prMatch = title.match(/\(#(\d+)\)/);

    const commitlint = this.parseCommitlint(title, message);

    const baseCommit: BaseCommit = this.createBaseCommit(title, {
      hash,
      abbrevHash: hash.substring(0, 7),
      rawBody: message
    });

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
