import type { PullRequestInterface } from '../../interface/PullRequestInterface';
import type { ReleaseItInstanceResult } from '../../type';
import { type ConstructorType, factory } from '../../utils/factory';
import Plugin from '../../Plugin';
import ReleaseContext from '../../interface/ReleaseContext';
import ChangelogManager from './ChangelogManager';
import BranchManager from './BranchManager';
import PullRequestManager from './PullRequestManager';
import ReleaseBase from './ReleaseBase';

export interface ReleasePullRequestProps {
  /**
   * The increment of the release
   *
   * @default `patch`
   */
  increment: string;

  /**
   * The pull request interface
   */
  pullRequestInterface: ConstructorType<PullRequestInterface, [ReleaseContext]>;
}

export default class CreateReleasePullRequest extends Plugin<ReleasePullRequestProps> {
  private releaseBase: ReleaseBase;
  private changelogManager: ChangelogManager;
  private branchManager: BranchManager;
  private pullRequestManager: PullRequestManager;
  private prImpl: PullRequestInterface;

  constructor(
    protected readonly context: ReleaseContext,
    props: ReleasePullRequestProps
  ) {
    super(context, 'pull-request', props);

    // create the pull request implementation
    this.prImpl = factory(props.pullRequestInterface, context);

    this.releaseBase = new ReleaseBase(context);

    this.changelogManager = new ChangelogManager(context);

    this.branchManager = new BranchManager(context);

    this.pullRequestManager = new PullRequestManager(
      context,
      this.releaseBase,
      this.prImpl
    );
  }

  enabled(): boolean {
    return this.context.releasePR;
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('[before] CreateReleasePullRequest');

    await this.releaseBase.init();

    if (!this.releaseBase.repoInfo) {
      throw new Error('repoInfo is not set');
    }

    await this.prImpl.init({
      repoName: this.releaseBase.repoInfo.repoName,
      authorName: this.releaseBase.repoInfo.authorName
    });
  }

  /**
   * @override
   */
  async onSuccess(): Promise<void> {
    const releaseResult = await this.step({
      label: 'Create Changelog and Version',
      task: () => this.changelogManager.createChangelogAndVersion()
    });

    const { tagName, releaseBranch } = await this.step({
      label: 'Create Release Branch',
      task: () => this.branchManager.createReleaseBranch(releaseResult)
    });

    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(tagName, releaseBranch, releaseResult)
    });

    if (this.pullRequestManager.autoMergeReleasePR) {
      // this.logger.obtrusive('Auto Merge Release PR...');
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

  /**
   * Creates a release pull request.
   *
   * @param tagName - The tag name for the release.
   * @param releaseBranch - The branch for the release.
   * @param releaseResult - The result of the release process.
   * @returns The created pull request number.
   */
  async createReleasePR(
    tagName: string,
    releaseBranch: string,
    releaseResult: ReleaseItInstanceResult
  ): Promise<string> {
    const changelog =
      this.changelogManager.getChangelogAndFeatures(releaseResult);
    const label = await this.pullRequestManager.createReleasePRLabel();

    const labels = [label!.name!];

    return this.pullRequestManager.createReleasePR({
      tagName,
      releaseBranch,
      changelog,
      sourceBranch: this.branchManager.sourceBranch,
      releaseEnv: this.branchManager.releaseEnv,
      labels
    });
  }
}
