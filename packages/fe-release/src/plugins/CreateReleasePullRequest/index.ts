import Plugin from '../../Plugin';
import ReleaseContext from '../../interface/ReleaseContext';
import { PullRequestInterface } from '../../interface/PullRequestInterface';
import ChangelogManager from './ChangelogManager';
import { ReleaseItInstanceResult } from '../../type';
import BranchManager from './BranchManager';
import PullRequestManager from './PullRequestManager';
import ReleaseBase from './ReleaseBase';

export type CreateReleaseResult = {
  tagName: string;
  releaseBranch: string;
};

export default class CreateReleasePullRequest extends Plugin {
  readonly pluginName = 'create-release-pr';

  private changelogManager: ChangelogManager;

  private branchManager: BranchManager;

  private pullRequestManager: PullRequestManager;

  private releaseBase: ReleaseBase;

  constructor(
    protected readonly context: ReleaseContext,
    private readonly releasePR: PullRequestInterface
  ) {
    super(context);

    this.releaseBase = new ReleaseBase(context);

    this.changelogManager = new ChangelogManager(context);

    this.branchManager = new BranchManager(context);

    this.pullRequestManager = new PullRequestManager(
      context,
      this.releaseBase,
      this.releasePR
    );
  }

  async onBefore(): Promise<void> {
    this.logger.verbose('CreateReleasePullRequest onBefore');

    await this.releaseBase.init();

    if (!this.releaseBase.repoInfo) {
      throw new Error('repoInfo is not set');
    }

    await this.releasePR.init({
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
