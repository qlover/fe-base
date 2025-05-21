import ReleaseContext from '../../implments/ReleaseContext';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';
import { CommitValue, GitChangelogOptions } from '../../interface/ChangeLog';
import {
  CHANGELOG_ALL_FIELDS,
  GitChangelog,
  GitChangelogProps
} from '../../implments/changelog/GitChangeLog';
import { GitChangelogFormatter } from '../../implments/changelog/GitChangelogFormatter';

const DOMAIN = 'https://github.com';

export interface GithubChangelogProps extends GitChangelogProps {
  mergePRcommit?: boolean;
  githubRootPath?: string;
}

export default class GithubChangelog extends GitChangelog {
  constructor(
    protected options: GithubChangelogProps,
    protected githubManager: GithubManager
  ) {
    super(options);
  }

  async getFullCommit(options?: GitChangelogOptions): Promise<CommitValue[]> {
    const _options = { ...this.options, ...options };

    const allCommits = await this.getCommits(_options);

    const newallCommits = await Promise.all(
      allCommits.map(async (commit) => {
        let { prNumber } = commit;

        if (!prNumber && commit.base.subject) {
          const prMatch = commit.base.subject.match(/\(#(\d+)\)/);
          if (prMatch) {
            prNumber = prMatch[1];
            commit.prNumber = prNumber;
          }
        }

        if (!prNumber) {
          return commit;
        }

        const prCommits =
          await this.githubManager.getPullRequestCommits(+prNumber);

        return prCommits.map(({ sha, commit: { message } }) =>
          Object.assign(this.toCommitValue(sha, message), {
            prNumber
          })
        );
      })
    );

    return newallCommits.flat();
  }

  async transformWorkspace(
    workspaces: WorkspaceValue[],
    context: ReleaseContext
  ): Promise<WorkspaceValue[]> {
    const githubRootPath = [
      DOMAIN,
      context.shared.authorName!,
      context.shared.repoName!
    ].join('/');

    const changelogProps = {
      ...(context.getConfig('changelog') as GitChangelogOptions),
      githubRootPath,
      mergePRcommit: true,
      shell: context.shell
    };
    const githubChangelog = new GithubChangelog(
      changelogProps,
      this.githubManager
    );
    const formatter = new GitChangelogFormatter(changelogProps);

    return await Promise.all(
      workspaces.map(async (workspace) => {
        const changelog = await githubChangelog.getFullCommit({
          from: workspace.lastTag ?? '',
          directory: workspace.path,
          fileds: CHANGELOG_ALL_FIELDS
        });

        if (typeof changelog === 'string') {
          return {
            ...workspace,
            changelog
          };
        }

        const changelogLines = formatter.format(changelog, {
          ...changelogProps,
          repoUrl: githubRootPath
        });

        return {
          ...workspace,
          changelog: changelogLines.join('\n')
        };
      })
    );
  }
}
