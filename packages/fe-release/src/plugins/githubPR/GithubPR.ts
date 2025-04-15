import type { PullRequestInterface } from '../../interface/PullRequestInterface';
import type { Logger } from '@qlover/fe-corekit';
import { type ConstructorType, factory } from '../../utils/factory';
import {
  type ReleaseBranchParams,
  ReleaseParams,
  ReleaseParamsConfig
} from '../../implments/ReleaseParams';
import Plugin from '../Plugin';
import ReleaseContext from '../../implments/ReleaseContext';
import ChangelogManager, { ComposeWorkspace } from './ChangelogManager';
import PullRequestManager from './PullRequestManager';
import GitBase from '../GitBase';

export interface ReleasePullRequestProps extends ReleaseParamsConfig {
  /**
   * The increment of the release
   *
   * @default `patch`
   */
  increment: string;

  /**
   * Whether to dry run the creation of the pull request
   *
   * @default `false`
   */
  dryRunCreatePR?: boolean;

  /**
   * The pull request interface
   */
  pullRequestInterface: ConstructorType<PullRequestInterface, [ReleaseContext]>;
}

export default class GithubPR extends Plugin<ReleasePullRequestProps> {
  private gitBase: GitBase;
  private changelogManager: ChangelogManager;
  private pullRequestManager: PullRequestManager;
  private prImpl: PullRequestInterface;
  private releaseParams: ReleaseParams;

  constructor(
    protected readonly context: ReleaseContext,
    props: ReleasePullRequestProps
  ) {
    super(context, 'githubPR', props);

    // create the pull request implementation
    this.prImpl = factory(props.pullRequestInterface, context);

    this.gitBase = new GitBase(context);

    this.changelogManager = new ChangelogManager(context);

    this.releaseParams = new ReleaseParams(
      context.shell,
      context.logger as unknown as Logger,
      {
        PRTitle: this.context.shared.PRTitle,
        PRBody: this.context.shared.PRBody,
        ...this.props
      }
    );

    this.pullRequestManager = new PullRequestManager(context, this.prImpl);
  }

  enabled(): boolean {
    return this.context.releasePR;
  }

  override async onBefore(): Promise<void> {
    this.logger.verbose('[before] GithubPR');

    await this.gitBase.onBefore();

    const { repoName, authorName } = this.context.shared!;

    await this.prImpl.init({ repoName, authorName });
  }

  override async onExec(): Promise<void> {
    const composeWorkspaces = await this.step({
      label: 'Create Changelogs',
      task: () => this.getComposeWorkspaces()
    });

    const releaseBranchParams = await this.step({
      label: 'Create Release Branch',
      task: () =>
        this.createReleaseBranch(
          this.releaseParams.getReleaseBranchParams(
            composeWorkspaces,
            this.context.getTemplateContext()
          )
        )
    });

    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(composeWorkspaces, releaseBranchParams)
    });

    if (this.pullRequestManager.autoMergeReleasePR) {
      await this.mergePR(prNumber, releaseBranchParams.releaseBranch);
      return;
    }

    this.logger.info(
      `Please manually merge PR(#${prNumber}) and complete the publishing process afterwards`
    );
  }

  private async getComposeWorkspaces(): Promise<ComposeWorkspace[]> {
    const workspaces = this.context.workspaces;

    if (!workspaces) {
      throw new Error('No workspaces found');
    }

    if (this.context.shared.mergePublish) {
      return this.changelogManager.createChangeLogs(workspaces);
    }

    const releaseResult = await this.changelogManager.createChangelog();

    return [
      {
        ...this.context.workspace!,
        ...releaseResult
      }
    ];
  }

  /**
   * Merge the release pull request.
   *
   * @param prNumber - The number of the pull request.
   * @param releaseBranch - The branch for the release.
   */
  async mergePR(prNumber: string, releaseBranch: string): Promise<void> {
    // this.logger.obtrusive('Auto Merge Release PR...');
    await this.step({
      label: `Merge Release PR(${prNumber})`,
      task: () => this.pullRequestManager.mergePR(prNumber, releaseBranch)
    });
    await this.step({
      label: `Checked Release PR(${prNumber})`,
      task: () => this.pullRequestManager.checkedPR(prNumber, releaseBranch)
    });
  }

  /**
   * Creates a release pull request.
   *
   * @param composeWorkspaces - The compose workspaces.
   * @param releaseBranchParams - The release branch params.
   * @returns The created pull request number.
   */
  async createReleasePR(
    composeWorkspaces: ComposeWorkspace[],
    releaseBranchParams: ReleaseBranchParams
  ): Promise<string> {
    const label = await this.pullRequestManager.createReleasePRLabel();

    const labels = [label!.name!];

    const context = this.context.getTemplateContext();
    const prTitle = this.releaseParams.getPRTitle(releaseBranchParams, context);
    const prBody = this.releaseParams.getPRBody(
      composeWorkspaces,
      releaseBranchParams,
      context
    );

    return this.pullRequestManager.createReleasePR({
      title: prTitle,
      body: prBody,
      labels
    });
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
}
