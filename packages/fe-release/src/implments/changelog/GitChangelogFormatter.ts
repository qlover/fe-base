import { Shell } from '@qlover/scripts-context';
import {
  ChangelogFormatter,
  CommitValue,
  GitChangelogOptions
} from '../../interface/ChangeLog';
import groupBy from 'lodash/groupBy';

const DEFAULT_TEMPLATE =
  '\n- ${scopeHeader} ${commitlint.message} ${commitLink} ${prLink}';

export interface Options extends GitChangelogOptions {
  repoUrl?: string;
}

export class GitChangelogFormatter implements ChangelogFormatter {
  constructor(
    protected options: Options & {
      shell: Shell;
    }
  ) {}

  format(commits: CommitValue[], options?: Options): string[] {
    const { types = [] } = { ...this.options, ...options };
    const changelog: string[] = [];

    const groupedCommits = groupBy(commits, (commit) => {
      if (commit.commitlint.type) {
        return commit.commitlint.type;
      }
      return commit.commitlint.message;
    });

    types.forEach((typeConfig) => {
      const { type, section, hidden } = typeConfig;

      if (hidden) return;

      const typeCommits = groupedCommits[type] || [];

      if (typeCommits.length > 0) {
        changelog.push(section || '');

        typeCommits.forEach((commit) => {
          changelog.push(this.formatCommit(commit, options));

          if (commit.base.body) {
            const bodyLines = commit.base.body
              .split('\n')
              .map((line) => `  ${line}`);
            changelog.push(...bodyLines);
          }
        });
      }
    });

    return changelog;
  }

  formatCommit(commit: CommitValue, options?: Options): string {
    const {
      commitlint,
      base: { hash },
      prNumber
    } = commit;
    const { repoUrl, formatTemplate = DEFAULT_TEMPLATE } = {
      ...this.options,
      ...options
    };

    const scopeHeader = commitlint.scope
      ? this.formatScope(commitlint.scope)
      : '';
    const prLink = prNumber
      ? this.foramtLink(
          '#' + prNumber,
          repoUrl ? `${repoUrl}/pull/${prNumber}` : ''
        )
      : '';
    const hashLink = hash
      ? this.foramtLink(
          hash.slice(0, 7),
          repoUrl ? `${repoUrl}/commit/${hash}` : ''
        )
      : '';

    return this.options.shell.format(formatTemplate, {
      ...commit,
      scopeHeader: scopeHeader,
      commitLink: hashLink,
      prLink
    });
  }

  foramtLink(target: string, url?: string): string {
    return url ? `([${target}](${url}))` : `(${target})`;
  }

  formatCommitLink(target: string, url?: string): string {
    return url ? `([${target}](${url}))` : `(${target})`;
  }

  formatScope(scope: string): string {
    return `**${scope}:**`;
  }
}
