import { GitChangelog } from '../../implments/gitChangeLog/gitChangeLog';
import ReleaseContext from '../../implments/ReleaseContext';
import Plugin from '../Plugin';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';

export type GithubChangelogProps = {
  mergePRcommit?: boolean;
};

export type Commit = {};

export default class GithubChangelog extends Plugin<GithubChangelogProps> {
  private githubManager: GithubManager;

  constructor(context: ReleaseContext, props?: GithubChangelogProps) {
    super(context, 'githubChangelog', props);

    this.githubManager = new GithubManager(this.context);
  }

  async getFullCommit(workspace: WorkspaceValue): Promise<unknown> {
    const { path, lastTag, changelog = '' } = workspace;

    if (!lastTag) {
      return changelog;
    }

    const gitChangelog = new GitChangelog(this.context.shell, {
      from: lastTag,
      directory: path
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
          Object.assign(gitChangelog.parseCommitMessage(sha, message), {
            prNumber
          })
        );
      })
    );

    return newallCommits.flat();
  }

  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    const newWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const changelog = (await this.getFullCommit(workspace)) as string;
        return {
          ...workspace,
          changelog
        };
      })
    );

    this.context.setWorkspaces(newWorkspaces);
    this.logger.debug('github changelog', this.context.workspaces);
  }
}
