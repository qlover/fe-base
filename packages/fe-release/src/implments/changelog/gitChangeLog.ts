import type {
  ChangeLogInterface,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import type { Shell } from '@qlover/scripts-context';

const DEFAULT_SPLIT_LINE = '----------------------';
const DEFAULT_FORMAT = '%H%n%s%n%b%n' + DEFAULT_SPLIT_LINE;

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
  async getGitLog(options: GitChangelogOptions): Promise<string> {
    const { directory, format = DEFAULT_FORMAT, noMerges = true } = options;

    if (options.logCommand) {
      return this.options.shell.exec(options.logCommand, { dryRun: false });
    }

    const from = await this.resolveTag(options.from, 'root');
    const to = await this.resolveTag(options.to, 'HEAD');

    const range = from === to ? to : `${from}..${to}`;
    const dirArg = directory ? `-- "${directory}"` : '';

    const noMergesArg = noMerges ? '--no-merges' : '';
    const command = `git log --pretty=format:"${format}" ${noMergesArg} ${range} ${dirArg}`;

    return this.options.shell.exec(command.trim(), { dryRun: false });
  }

  async getCommits(options?: GitChangelogOptions): Promise<CommitValue[]> {
    const { from, to, directory, format } = {
      ...this.options,
      ...options
    };

    const log = await this.getGitLog({
      from,
      to,
      directory,
      format,
      noMerges: false
    });

    const commits = log.split('\n' + DEFAULT_SPLIT_LINE + '\n').filter(Boolean);

    return commits.map((commit) => {
      const [hash, ...bodyLines] = commit.trim().split('\n');
      return this.toCommitValue(hash, bodyLines.join('\n'));
    });
  }

  toCommitValue(hash: string, message: string): CommitValue {
    const [title, ...bodyLines] = message.trim().split('\n');
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
  }

  protected parseCommitBody(body: string): CommitValue[] {
    const lines = body.split('\n').filter(Boolean);
    const commits: CommitValue[] = [];

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
            hash: '',
            raw: {
              title: currentCommit.raw,
              body: currentCommit.bodyLines?.join('\n').trim() || '',
              bodyLines: currentCommit.bodyLines
            },
            title: {
              type: currentCommit.type,
              scope: currentCommit.scope,
              message: currentCommit.message
            },
            commits: []
          });
        }

        const [, type, scope, message] = commitMatch;
        currentCommit = {
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
        hash: '',
        raw: {
          title: currentCommit.raw,
          body: currentCommit.bodyLines?.join('\n').trim() || '',
          bodyLines: currentCommit.bodyLines
        },
        title: {
          type: currentCommit.type,
          scope: currentCommit.scope,
          message: currentCommit.message
        },
        commits: []
      });
    }

    return commits;
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
