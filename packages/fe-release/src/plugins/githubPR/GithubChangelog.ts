import type { Shell } from '@qlover/scripts-context';
import ReleaseContext from '../../implments/ReleaseContext';
import Plugin from '../Plugin';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';
import groupBy from 'lodash/groupBy';
import { CommitValue, GitChangelogOptions } from '../../interface/ChangeLog';
import {
  GitChangelog,
  GitChangelogProps
} from '../../implments/changelog/GitChangelog';

export type GithubChangelogProps = {
  mergePRcommit?: boolean;
};

const DOMAIN = 'https://github.com';
const DEFAULT_TEMPLATE =
  '\n- ${scopeHeader} ${title.message} ${commitLink} ${prLink}';

export class GithubChangelogFormatter {
  format(
    commits: CommitValue[],
    options: GitChangelogOptions & { repoUrl: string },
    shell: Shell
  ): string[] {
    const { types = [] } = options;
    const changelog: string[] = [];

    const groupedCommits = groupBy(commits, (commit) => commit.title.type);

    types.forEach((typeConfig) => {
      const { type, section, hidden } = typeConfig;

      if (hidden) return;

      const typeCommits = groupedCommits[type] || [];

      if (typeCommits.length > 0) {
        changelog.push(section || '');

        typeCommits.forEach((commit) => {
          changelog.push(this.formatCommit(commit, options, shell));

          if (commit.raw.body) {
            const bodyLines = commit.raw.body
              .split('\n')
              .map((line) => `  ${line}`);
            changelog.push(...bodyLines);
          }
        });
      }
    });

    return changelog;
  }

  formatCommit(
    commit: CommitValue,
    options: GitChangelogOptions & { repoUrl: string },
    shell: Shell
  ): string {
    const { title, hash, prNumber } = commit;
    const { repoUrl, formatTemplate = DEFAULT_TEMPLATE } = options;

    const scopeHeader = title.scope ? `${this.formatScope(title.scope)} ` : '';
    const prLink = prNumber
      ? `${this.foramtLink('#' + prNumber, `${repoUrl}/pull/${prNumber}`)}`
      : '';
    const hashLink = hash
      ? `${this.foramtLink(hash.slice(0, 7), `${repoUrl}/commit/${hash}`)}`
      : '';

    return shell.format(formatTemplate, {
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

export default class GithubChangelog extends Plugin<GithubChangelogProps> {
  private githubManager: GithubManager;
  private formatter: GithubChangelogFormatter;
  private githubRootPath: string = '';

  constructor(context: ReleaseContext, props?: GithubChangelogProps) {
    super(context, 'githubChangelog', props);

    this.githubManager = new GithubManager(this.context);
    this.formatter = new GithubChangelogFormatter();
  }

  async getFullCommit(workspace: WorkspaceValue): Promise<unknown> {
    const { path, lastTag, changelog = '' } = workspace;

    if (!lastTag) {
      return changelog;
    }

    const gitChangelog = new GitChangelog({
      ...(this.context.getConfig('changelog') as GitChangelogProps),
      from: lastTag,
      directory: path,
      shell: this.shell
    });

    const allCommits = await gitChangelog.getCommits();

    const newallCommits = await Promise.all(
      allCommits.map(async (commit) => {
        const { prNumber } = commit;

        if (!prNumber) {
          return commit;
        }

        const prCommits =
          await this.githubManager.getPullRequestCommits(+prNumber);

        return prCommits.map(({ sha, commit: { message } }) =>
          Object.assign(gitChangelog.toCommitValue(sha, message), {
            prNumber
          })
        );
      })
    );

    return newallCommits.flat();
  }

  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    this.githubRootPath = [
      DOMAIN,
      this.context.shared.authorName!,
      this.context.shared.repoName!
    ].join('/');

    const newWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const changelog = await this.getFullCommit(workspace);

        if (typeof changelog === 'string') {
          return {
            ...workspace,
            changelog
          };
        }

        const changelogLines = this.formatter.format(
          changelog as CommitValue[],
          {
            ...this.context.getConfig('changelog'),
            repoUrl: this.githubRootPath
          },
          this.context.shell
        );

        return {
          ...workspace,
          changelog: changelogLines.join('\n')
        };
      })
    );

    this.context.setWorkspaces(newWorkspaces);
    this.logger.debug('github changelog', this.context.workspaces);
  }
}
