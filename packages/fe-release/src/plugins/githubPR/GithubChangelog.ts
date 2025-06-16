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
import { Pather } from '../../utils/pather';

const DOMAIN = 'https://github.com';

export interface GithubChangelogProps extends GitChangelogProps {
  mergePRcommit?: boolean;
  githubRootPath?: string;
}

export default class GithubChangelog extends GitChangelog {
  private pather = new Pather();
  constructor(
    protected options: GithubChangelogProps,
    protected githubManager: GithubManager
  ) {
    super(options);
  }

  /**
   * Filter commits by directory
   * @param commits - commits
   * @param directory - directory
   * @returns filtered commits
   * @since 2.4.0
   */
  async filterCommitsByDirectory(
    commits: CommitValue[],
    directory: string
  ): Promise<CommitValue[]> {
    const result: CommitValue[] = [];

    for (const commit of commits) {
      const commitInfo = await this.githubManager.getCommitInfo(
        commit.base.hash!
      );
      const files = commitInfo.files?.map((file) => file.filename) ?? [];

      for (const file of files) {
        if (this.pather.isSubPath(file, directory)) {
          result.push(commit);
          break;
        }
      }
    }

    return result;
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

        const commitValues = prCommits.map(({ sha, commit: { message } }) =>
          Object.assign(this.toCommitValue(sha, message), {
            prNumber
          })
        );

        return this.filterCommitsByDirectory(commitValues, _options.directory!);
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
      shell: context.shell,
      logger: context.logger
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
