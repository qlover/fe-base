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
        body: bodyLines || undefined
      };
    }

    return {
      // message: title.replace(/\s*\(#\d+\)\s*$/, '').trim()
      message: title,
      body: bodyLines || undefined
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
