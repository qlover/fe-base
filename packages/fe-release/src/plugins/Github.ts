import type ReleaseContext from '../implments/ReleaseContext';
import { GithubManager } from '../implments/GithubManager';
import type { GitRepositoryParsedType } from './GitBase';
import GitBase, { type GitBaseProps } from './GitBase';
import { GithubChangelog } from '../implments/changelog/GithubChangelog';
import type { WorkspaceInterface } from '../interface/WorkspaceInterface';
import type {
  ReleaseBranchResult,
  ReleaseFormatterConfig
} from '../implments/ReleaseFormatter';
import { ReleaseFormatter } from '../implments/ReleaseFormatter';
import { releaseJson } from '../defaults';

export type GithubMode = 'createPR';

export type GithubLabel = {
  /**
   * Hexadecimal color code for label appearance
   *
   * Color format: 6-character hex string without '#'
   * Used for visual distinction in GitHub interface
   * Supports standard web color codes
   *
   * @optional
   * @default `'1A7F37'`
   * @example Green color
   * ```typescript
   * color: '1A7F37'
   * ```
   *
   * @example Blue color
   * ```typescript
   * color: '0366D6'
   * ```
   */
  color?: string;

  /**
   * Descriptive text for label documentation
   *
   * Provides context about the label's purpose
   * Used in GitHub label management interface
   * Helps team members understand label usage
   *
   * @optional
   * @default `'Release PR'`
   * @example
   * ```typescript
   * description: 'Automated release pull request'
   * ```
   */
  description?: string;

  /**
   * Label name for identification and display
   *
   * Used as the primary identifier for the label
   * Displayed in GitHub PR interface
   * Should be descriptive and consistent
   *
   * @optional
   * @default `'CI-Release'`
   * @example
   * ```typescript
   * name: 'release'
   * ```
   */
  name?: string;
};
export interface GithubProps extends ReleaseFormatterConfig, GitBaseProps {
  /**
   * Plugin work mode
   *
   * - `changelog`: enrich workspace changelogs only
   * - `pr`: enrich changelogs and create a release PR
   * - `release`: push tags and create GitHub releases
   *
   * @default 'changelog'
   */
  mode?: GithubMode;

  /**
   * PR auto-merge strategy for release pull requests
   *
   * Core concept:
   * Defines the merge strategy used when automatically merging
   * release pull requests, affecting commit history and
   * repository structure.
   *
   * Merge strategies:
   * - merge: Creates merge commit with branch history
   * - squash: Combines all commits into single commit
   * - rebase: Replays commits on target branch
   *
   * Strategy considerations:
   * - merge: Preserves complete branch history
   * - squash: Creates clean, linear history
   * - rebase: Maintains chronological order
   * - Affects commit message and history structure
   * - Influences repository maintenance and debugging
   *
   * @optional
   * @default `'squash'`
   * @example Squash merge
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeType: 'squash'
   * };
   * ```
   *
   * @example Preserve history
   * ```typescript
   * const config: FeReleaseConfig = {
   *   autoMergeType: 'merge'
   * };
   * ```
   */
  mergeType?: 'merge' | 'squash' | 'rebase';

  /**
   * Whether to skip this plugin
   * @default false
   */
  skip?: boolean;

  /** @default 'chore(tag): ${name} v${version}' */
  commitMessage?: string;

  /** @default [] */
  commitArgs?: string[];

  draft?: boolean;
  preRelease?: boolean;
  autoGenerate?: boolean;
  makeLatest?: boolean | 'true' | 'false' | 'legacy';
  releaseNotes?: string;
  discussionCategoryName?: string;

  /**
   * 是否自动合并创建的 Release PR
   *
   * @default false
   */
  autoMergeReleasePr?: boolean;

  /** @default false */
  pushChangeLabels?: boolean;

  /**
   * Skip creating the GitHub release pull request.
   *
   * When enabled, the release branch is still created and pushed,
   * but no PR is opened via the GitHub API. Useful for local testing.
   *
   * CLI: `--github.skip-create-release-pr`
   * fe-config: `release.github.skipCreateReleasePR`
   *
   * @default false
   */
  skipCreateReleasePr?: boolean;

  /**
   * Configuration for release pull request labels
   *
   * Core concept:
   * Defines the label configuration for release pull requests,
   * enabling automated categorization and visual identification
   * of release-related PRs.
   *
   * Label features:
   * - Automated label application
   * - Customizable label appearance
   * - Consistent release identification
   * - Integration with GitHub labeling system
   * - Support for custom label descriptions
   *
   * Label properties:
   * - name: Label identifier and display name
   * - color: Hexadecimal color code for visual distinction
   * - description: Label description for documentation
   *
   * @optional
   * @example Basic label configuration
   * ```typescript
   * const config: FeReleaseConfig = {
   *   label: {
   *     name: 'release',
   *     color: '1A7F37',
   *     description: 'Automated release PR'
   *   }
   * };
   * ```
   *
   * @example Custom label
   * ```typescript
   * const config: FeReleaseConfig = {
   *   label: {
   *     name: 'CI-Release',
   *     color: '0366D6',
   *     description: 'Release created by CI/CD'
   *   }
   * };
   * ```
   */
  label?: GithubLabel;
}

export default class Github extends GitBase<GithubProps> {
  protected releaseFormatter: ReleaseFormatter;
  protected githubManager: GithubManager;

  constructor(context: ReleaseContext, props: GithubProps = {}) {
    super(context, 'github', props);

    this.releaseFormatter = new ReleaseFormatter(
      this.context.getTemplateEngine(),
      this.config
    );
    this.githubManager = new GithubManager(this.context);
  }

  protected get mode(): GithubMode {
    return this.config.mode || (releaseJson.github.mode as GithubMode);
  }

  public override async onBefore(): Promise<void> {
    await super.onBefore();
    await this.githubManager.validateToken();

    this.releaseFormatter.setConfig({
      repoName: this.context.options.repoName,
      authorName: this.context.options.authorName,
      env: this.context.options.releaseEnv,
      releaseId: this.context.releaseId
    });

    this.logger.info(`Github mode: ${this.mode}`);
  }

  public async onExec(): Promise<void> {
    const workspaces = this.context.requireWorkspaces();

    const githubChangelog = GithubChangelog.fromContext(
      this.context,
      this.githubManager
    );

    const newWorkspaces = await this.step({
      label: 'Github Changelogs',
      task: () =>
        Promise.all(
          workspaces.map((workspace) => {
            // If the workspace is a dependency release, return the workspace as is
            if (workspace.dependencyRelease) {
              return workspace;
            }
            return githubChangelog.enrichWorkspaceChangelog(workspace);
          })
        )
    });

    this.context.setWorkspaces(newWorkspaces);
  }

  public async onSuccess(): Promise<void> {
    const workspaces = this.context.requireWorkspaces();

    const releaseBranchResult = await this.step({
      label: 'Create Release Branch',
      task: () => this.createReleaseBranch(workspaces)
    });

    if (this.config.skipCreateReleasePr) {
      this.logger.info(
        'Skip Create Release PR (github.skipCreateReleasePR is enabled)'
      );
      this.logReleasePRPreview(workspaces, releaseBranchResult);
      this.logger.info(
        `Release branch "${releaseBranchResult.releaseBranch}" pushed. PR creation skipped.`
      );
      return;
    }

    await this.handleReleasePullRequest(workspaces, releaseBranchResult);
  }

  /**
   * Create the release PR and optionally auto-merge it.
   *
   * When `skipCreateReleasePR` is enabled, only logs a PR preview and exits.
   */
  protected async handleReleasePullRequest(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult
  ): Promise<void> {
    const prNumber = await this.step({
      label: 'Create Release PR',
      task: () => this.createReleasePR(workspaces, releaseBranchResult)
    });

    if (this.config.autoMergeReleasePr) {
      const { releaseBranch } = releaseBranchResult;

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

  protected logReleasePRPreview(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult
  ): void {
    const context = this.context.getTemplateContext();
    const prTitle = this.releaseFormatter.getPRTitle(
      releaseBranchResult,
      context,
      workspaces
    );
    const prBody = this.releaseFormatter.getPRBody(
      workspaces,
      releaseBranchResult,
      context
    );

    this.logger.info(`Release PR title preview:\n${prTitle}`);
    this.logger.debug(`Release PR body preview:\n${prBody}`);
  }

  protected override parseRemoteUrl(
    remoteUrl: string
  ): GitRepositoryParsedType {
    const parsed = super.parseRemoteUrl(remoteUrl);
    if (parsed.source !== 'github.com') {
      throw new Error(
        `Remote repository is not hosted on GitHub. Found: ${parsed.source || 'unknown'}`
      );
    }
    return parsed;
  }

  /**
   * 创建发布分支， 然后将发布分支和tag返回
   * @param workspaces
   * @returns
   */
  protected async createReleaseBranch(
    workspaces: WorkspaceInterface[]
  ): Promise<ReleaseBranchResult> {
    const { sourceBranch, currentBranch } = this.context.parameters;

    if (!sourceBranch || !currentBranch) {
      throw new Error('Source branch and current branch are required');
    }

    this.logger.debug(
      `Source branch is: ${sourceBranch}, current branch is: ${currentBranch}`
    );

    const result = this.releaseFormatter.getReleaseBranch(workspaces);

    await this.createBranch(result.releaseBranch, sourceBranch, currentBranch);

    if (!(await this.hasWorkingTreeChanges())) {
      this.logger.warn(
        'No release changes detected. Ensure version or changelog files were updated before creating the release branch.'
      );
    } else {
      const message = this.releaseFormatter.getCommitMessage(workspaces);

      this.logger.info(`Release branch commit message:\n${message}`);

      await this.shell.exec('git add .');
      await this.commit(message, this.config.commitArgs);
    }

    await this.pushBranch(result.releaseBranch);

    return result;
  }
  protected async createReleasePR(
    workspaces: WorkspaceInterface[],
    releaseBranchResult: ReleaseBranchResult
  ): Promise<string> {
    const label = await this.githubManager.createReleasePRLabel();

    if (!label || !label.name) {
      throw new Error('Create release PR label failed');
    }

    const labels = new Set<string>();

    labels.add(label.name);

    // if pushChangeLabels is true, then push the changed labels to the release PR
    if (this.config.pushChangeLabels) {
      const changeLabels = this.context.getParameters(
        'workspaces.changeLabels'
      );
      if (Array.isArray(changeLabels) && changeLabels.length > 0) {
        changeLabels.forEach((label) => labels.add(label));
      }
    }

    this.logger.debug('Release PR labels:', labels);

    const context = this.context.getTemplateContext();

    const prTitle = this.releaseFormatter.getPRTitle(
      releaseBranchResult,
      context,
      workspaces
    );
    const prBody = this.releaseFormatter.getPRBody(
      workspaces,
      releaseBranchResult,
      context
    );

    return this.githubManager.createReleasePR({
      title: prTitle,
      body: prBody,
      base: this.context.sourceBranch,
      head: releaseBranchResult.releaseBranch,
      labels: Array.from(labels)
    });
  }
}
