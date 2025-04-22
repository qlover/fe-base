import {
  ReleaseBranchParams,
  ReleaseParams,
  type ReleaseParamsConfig
} from '../../implments/ReleaseParams';
import ReleaseContext from '../../implments/ReleaseContext';
import { WorkspaceValue } from '../workspaces/Workspaces';
import PullRequestManager from './PullRequestManager';
import GitBase from '../GitBase';

export interface ReleasePullRequestProps extends ReleaseParamsConfig {
  /**
   * Whether to publish a PR
   *
   * @default `false`
   */
  releasePR?: boolean;

  /**
   * The commit message of the release
   *
   * support WorkspaceValue
   *
   * @default 'chore(tag): {{name}} v${version}'
   */
  commitMessage?: string;

  /**
   * The commit args of the release
   *
   * @default []
   */
  commitArgs?: string[];
}

const DEFAULT_COMMIT_MESSAGE = 'chore(tag): ${name} v${version}';

export default class GithubPR extends GitBase<ReleasePullRequestProps> {
  private releaseParams: ReleaseParams;
  private pullRequestManager: PullRequestManager;

  constructor(
    protected readonly context: ReleaseContext,
    props: ReleasePullRequestProps
  ) {
    super(context, 'githubPR', props);

    const token = this.getEnv('GITHUB_TOKEN') || this.getEnv('PAT_TOKEN');
    if (!token) {
      throw new Error(
        'GITHUB_TOKEN or PAT_TOKEN environment variable is not set.'
      );
    }

    this.pullRequestManager = new PullRequestManager(this.context, token);
    // @ts-expect-error logger is fe-utils
    this.releaseParams = new ReleaseParams(context.shell, context.logger, {
      PRTitle: this.getConfig('PRTitle', this.context.shared.PRTitle),
      PRBody: this.getConfig('PRBody', this.context.shared.PRBody),
      ...this.props
    });
  }

  override enabled(): boolean {
    return !!this.getConfig('releasePR');
  }

  override async onBefore(): Promise<void> {
    this.logger.verbose('GithubPR onBefore');
    await super.onBefore();
  }

  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    await this.relesaeCommit(workspaces);

    const releaseBranchParams = await this.step({
      label: 'Create Release Branch',
      task: () =>
        this.createReleaseBranch(
          this.releaseParams.getReleaseBranchParams(
            workspaces,
            this.context.getTemplateContext()
          )
        )
    });

    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(workspaces, releaseBranchParams)
    });

    if (this.pullRequestManager.autoMergeReleasePR) {
      const { releaseBranch } = releaseBranchParams;

      await this.step({
        label: `Merge Release PR(${prNumber})`,
        task: () => this.pullRequestManager.mergePR(prNumber, releaseBranch)
      });
      await this.step({
        label: `Checked Release PR(${prNumber})`,
        task: () => this.pullRequestManager.checkedPR(prNumber, releaseBranch)
      });
      return;
    }

    this.logger.info(
      `Please manually merge PR(#${prNumber}) and complete the publishing process afterwards`
    );
  }

  private async commitWorkspace(
    workspace: WorkspaceValue,
    commitArgs: string[] = []
  ): Promise<string> {
    const commitMessage = this.shell.format(
      this.getConfig('commitMessage', DEFAULT_COMMIT_MESSAGE),
      workspace as unknown as Record<string, unknown>
    );

    return await this.shell.exec([
      'git',
      'commit',
      '--message',
      `"${commitMessage}"`,
      ...commitArgs
    ]);
  }

  async relesaeCommit(workspaces: WorkspaceValue[]): Promise<void> {
    const commitArgs: string[] = this.getConfig('commitArgs', []);

    // use changeset to
    await this.shell.exec('pnpm dlx @changesets/cli version --no-changelog');

    if (workspaces.length === 1) {
      await this.shell.exec('git add .');
      await this.commitWorkspace(workspaces[0], commitArgs);
      return;
    }

    await this.shell.exec('git add .');
    const commitMessage = `chore(tag): ${workspaces
      .map((w) => `${w.name} v${w.version}`)
      .join(',')}`;

    await this.shell.exec([
      'git',
      'commit',
      '--message',
      commitMessage,
      ...commitArgs
    ]);
  }

  /**
   * Create a branch that merges to a tag with new changlog and version.
   *
   * Can be used to merge to the main branch or create a PR to the main branch.
   *
   * eg. release-production-1.0.0
   *
   * @param params - The release branch params.
   * @returns The release branch.
   */
  async createReleaseBranch(
    params: ReleaseBranchParams
  ): Promise<ReleaseBranchParams> {
    const { tagName, releaseBranch } = params;

    if (typeof tagName !== 'string') {
      throw new Error('Tag name is not a string');
    }

    const { sourceBranch, currentBranch } = this.context.shared;

    this.context.logger.verbose('PR TagName is:', tagName);
    this.context.logger.verbose('PR CurrentBranch is:', currentBranch);
    this.context.logger.verbose('PR SourceBranch is:', sourceBranch);
    this.context.logger.verbose('PR ReleaseBranch is:', releaseBranch);

    try {
      await this.context.shell.exec(
        `git fetch origin ${sourceBranch} ${currentBranch}`
      );
      await this.context.shell.exec(
        `git checkout -b ${releaseBranch} ${currentBranch}`
      );
      await this.context.shell.exec(`git push origin ${releaseBranch}`);
    } catch (error) {
      // maybe not allow token Workflow permissions
      // FIXME: move to LifeCycle onBefore
      if (
        (error as { message: string }).message.includes(
          'remote: Permission to '
        )
      ) {
        this.context.logger.warn(
          `Token maybe not allow Workflow permissions, can you try to open "Workflow permissions" -> "Read and write permissions" for this token?`
        );
      }

      throw error;
    }

    return { tagName, releaseBranch };
  }

  /**
   * Creates a release pull request.
   *
   * @param workspaces - The compose workspaces.
   * @param releaseBranchParams - The release branch params.
   * @returns The created pull request number.
   */
  async createReleasePR(
    workspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams
  ): Promise<string> {
    const label = await this.pullRequestManager.createReleasePRLabel();

    const labels = [label!.name!];

    const context = this.context.getTemplateContext();
    const prTitle = this.releaseParams.getPRTitle(releaseBranchParams, context);
    const prBody = this.releaseParams.getPRBody(
      workspaces,
      releaseBranchParams,
      context
    );

    return this.pullRequestManager.createReleasePR({
      title: prTitle,
      body: prBody,
      base: this.context.sourceBranch,
      head: releaseBranchParams.releaseBranch,
      labels
    });
  }
}
