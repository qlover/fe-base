import {
  ReleaseBranchParams,
  ReleaseParams,
  type ReleaseParamsConfig
} from '../../implments/ReleaseParams';
import ReleaseContext from '../../implments/ReleaseContext';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';
import GitBase, { type GitBaseProps } from '../GitBase';
import GithubChangelog from './GithubChangelog';

export interface GithubPRProps extends ReleaseParamsConfig, GitBaseProps {
  /**
   * Whether to dry run the creation of the pull request
   *
   * - create pr
   * - changeset publish
   *
   * @default `false`
   */
  dryRunCreatePR?: boolean;

  /**
   * Whether to skip the release
   *
   * @default `false`
   */
  skip?: boolean;

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

  /**
   * The release name of the release
   *
   * @default 'Release ${name} v${version}'
   */
  releaseName?: string;

  /**
   * Whether to create a draft release
   *
   * @default false
   */
  draft?: boolean;

  /**
   * Whether to create a pre-release
   *
   * @default false
   */
  preRelease?: boolean;

  /**
   * Whether to auto-generate the release notes
   *
   * @default false
   */
  autoGenerate?: boolean;

  /**
   * Whether to make the latest release
   *
   * @default true
   */
  makeLatest?: boolean | 'true' | 'false' | 'legacy';

  /**
   * The release notes of the release
   *
   * @default undefined
   */
  releaseNotes?: string;

  /**
   * The discussion category name of the release
   *
   * @default undefined
   */
  discussionCategoryName?: string;

  /**
   * Whether to push the changed labels to the release PR
   *
   * @default false
   */
  pushChangeLabels?: boolean;
}

const DEFAULT_RELEASE_NAME = 'Release ${name} v${version}';
const DEFAULT_COMMIT_MESSAGE = 'chore(tag): ${name} v${version}';

export default class GithubPR extends GitBase<GithubPRProps> {
  private releaseParams: ReleaseParams;
  private githubManager: GithubManager;

  constructor(
    protected readonly context: ReleaseContext,
    props: GithubPRProps
  ) {
    super(context, 'githubPR', {
      releaseName: DEFAULT_RELEASE_NAME,
      ...props
    });

    this.githubManager = new GithubManager(this.context);
    this.releaseParams = new ReleaseParams(context.shell, context.logger, {
      PRTitle: this.getConfig('PRTitle', this.context.shared.PRTitle),
      PRBody: this.getConfig('PRBody', this.context.shared.PRBody),
      ...this.props
    });
  }

  override enabled(_name: string): boolean {
    if (this.getConfig('skip')) {
      return false;
    }

    if (_name === 'onExec') {
      return !this.isPublish;
    }

    if (_name === 'onSuccess') {
      return this.isPublish;
    }

    return true;
  }

  get isPublish(): boolean {
    return !this.getConfig('releasePR');
  }

  private async isGithubRepository(): Promise<boolean> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      return remoteUrl.includes('github.com');
    } catch {
      return false;
    }
  }

  override async onBefore(): Promise<void> {
    this.logger.debug('GithubPR onBefore');

    const isGithub = await this.isGithubRepository();
    if (!isGithub) {
      throw new Error(
        'Current repository is not a GitHub repository. GitHub PR workflow is only available for GitHub repositories.'
      );
    }

    await super.onBefore();

    if (this.isPublish) {
      const npmToken = this.getEnv('NPM_TOKEN');
      if (!npmToken) {
        throw new Error('NPM_TOKEN is not set');
      }

      await this.shell.exec(
        `npm config set //registry.npmjs.org/:_authToken=${npmToken}`
      );
    }
  }

  override async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    const githubChangelog = new GithubChangelog(
      this.context.getConfig('changelog'),
      this.githubManager
    );

    const newWorkspaces = await githubChangelog.transformWorkspace(
      workspaces,
      this.context
    );

    this.context.setWorkspaces(newWorkspaces);
    this.logger.debug('github changelog', this.context.workspaces);
  }

  override async onSuccess(): Promise<void> {
    const workspaces = this.context.workspaces!;
    await this.step({
      label: 'Release Commit',
      task: () => this.relesaeCommit(workspaces)
    });

    const releaseBranchParams = await this.step({
      label: 'Create Release Branch',
      task: () => this.createReleaseBranch(workspaces)
    });

    await this.releasePullRequest(workspaces, releaseBranchParams);

    if (!this.getConfig('dryRunCreatePR')) {
      await this.context.runChangesetsCli('publish');

      await this.shell.exec('git push origin --tags');
    }

    await this.step({
      label: 'Release Github',
      task: () =>
        Promise.all(
          workspaces.map((workspace) => {
            this.logger.debug(workspace);
            return this.githubManager.createRelease(workspace);
          })
        )
    });
  }

  private async relesaeCommit(workspaces: WorkspaceValue[]): Promise<void> {
    const commitArgs: string[] = this.getConfig('commitArgs', []);

    if (workspaces.length === 1) {
      await this.shell.exec('git add .');
      await this.commitWorkspace(workspaces[0], commitArgs);
      return;
    }

    await this.shell.exec('git add .');
    const commitMessage = `chore(tag): ${workspaces
      .map((w) => `${w.name} v${w.version}`)
      .join(',')}`;

    await this.commit(commitMessage, commitArgs);
  }

  async releasePullRequest(
    workspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams
  ): Promise<void> {
    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(workspaces, releaseBranchParams)
    });

    if (this.githubManager.autoMergeReleasePR) {
      const { releaseBranch } = releaseBranchParams;

      await this.step({
        label: `Merge Release PR(${prNumber})`,
        task: () => this.githubManager.mergePR(prNumber, releaseBranch)
      });
      await this.step({
        label: `Checked Release PR(${prNumber})`,
        task: () => this.githubManager.checkedPR(prNumber, releaseBranch)
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

    return await this.commit(commitMessage, commitArgs);
  }

  /**
   * Create a branch that merges to a tag with new changlog and version.
   *
   * Can be used to merge to the main branch or create a PR to the main branch.
   *
   * eg. release-production-1.0.0
   *
   *
   * @returns The release branch.
   */
  private async createReleaseBranch(
    workspaces: WorkspaceValue[]
  ): Promise<ReleaseBranchParams> {
    const params = this.releaseParams.getReleaseBranchParams(
      workspaces,
      this.context.getTemplateContext()
    );

    const { tagName, releaseBranch } = params;

    if (typeof tagName !== 'string') {
      throw new Error('Tag name is not a string');
    }

    const { sourceBranch, currentBranch } = this.context.shared;

    this.context.logger.debug('PR TagName is:', tagName);
    this.context.logger.debug('PR CurrentBranch is:', currentBranch);
    this.context.logger.debug('PR SourceBranch is:', sourceBranch);
    this.context.logger.debug('PR ReleaseBranch is:', releaseBranch);

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
  private async createReleasePR(
    workspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams
  ): Promise<string> {
    const label = await this.githubManager.createReleasePRLabel();

    let labels = [label!.name!];

    // if pushChangeLabels is true, then push the changed labels to the release PR
    if (this.getConfig('pushChangeLabels')) {
      const changeLabels = this.context.getConfig('workspaces.changeLabels');
      if (Array.isArray(changeLabels) && changeLabels.length > 0) {
        labels.push(...changeLabels);
      }
    }

    labels = Array.from(new Set(labels));
    this.logger.debug('Release PR labels:', labels);

    const context = this.context.getTemplateContext();
    const prTitle = this.releaseParams.getPRTitle(releaseBranchParams, context);
    const prBody = this.releaseParams.getPRBody(
      workspaces,
      releaseBranchParams,
      context
    );

    return this.githubManager.createReleasePR({
      title: prTitle,
      body: prBody,
      base: this.context.sourceBranch,
      head: releaseBranchParams.releaseBranch,
      labels
    });
  }
}
