/**
 * @module GithubPR
 * @description GitHub Pull Request and Release Management
 *
 * This module provides functionality for managing GitHub pull requests
 * and releases as part of the release process. It handles PR creation,
 * release publishing, and changelog management.
 *
 * Core Features:
 * - Pull request creation and management
 * - Release publishing
 * - Changelog integration
 * - Tag management
 * - Label management
 * - Auto-merge support
 *
 * @example Basic usage
 * ```typescript
 * const plugin = new GithubPR(context, {
 *   releasePR: true,
 *   autoGenerate: true
 * });
 *
 * await plugin.exec();
 * ```
 *
 * @example Release publishing
 * ```typescript
 * const plugin = new GithubPR(context, {
 *   releasePR: false,
 *   makeLatest: true,
 *   preRelease: false
 * });
 *
 * await plugin.exec();
 * ```
 */
import {
  ReleaseBranchParams,
  ReleaseParams,
  type ReleaseParamsConfig
} from '../../implments/ReleaseParams';
import ReleaseContext, {
  ReleaseContextConfig
} from '../../implments/ReleaseContext';
import { WorkspaceValue } from '../workspaces/Workspaces';
import GithubManager from './GithubManager';
import GitBase, { type GitBaseProps } from '../GitBase';
import GithubChangelog from './GithubChangelog';
import { Shell } from '@qlover/scripts-context';

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

/**
 * Default template for release names
 * Variables:
 * - ${name}: Package name
 * - ${version}: Package version
 */
const DEFAULT_RELEASE_NAME = 'Release ${name} v${version}';

/**
 * Default template for commit messages
 * Variables:
 * - ${name}: Package name
 * - ${version}: Package version
 */
const DEFAULT_COMMIT_MESSAGE = 'chore(tag): ${name} v${version}';

/**
 * GitHub Pull Request and Release Management Plugin
 *
 * Handles the creation and management of GitHub pull requests
 * and releases. Supports both single package and workspace
 * releases with customizable templates and options.
 *
 * Features:
 * - PR creation with customizable titles and bodies
 * - Release publishing with version tags
 * - Changelog integration
 * - Label management
 * - Auto-merge support
 * - NPM publishing integration
 *
 * @example Basic PR creation
 * ```typescript
 * const plugin = new GithubPR(context, {
 *   releasePR: true,
 *   commitMessage: 'chore: release v${version}',
 *   pushChangeLabels: true
 * });
 *
 * await plugin.exec();
 * ```
 *
 * @example Release publishing
 * ```typescript
 * const plugin = new GithubPR(context, {
 *   draft: false,
 *   preRelease: false,
 *   makeLatest: true,
 *   autoGenerate: true
 * });
 *
 * await plugin.exec();
 * ```
 */
export default class GithubPR extends GitBase<GithubPRProps> {
  private releaseParams: ReleaseParams;
  private githubManager: GithubManager;

  /**
   * Creates a new GithubPR plugin instance
   *
   * Initializes the plugin with GitHub-specific configuration and
   * sets up release parameters and GitHub manager.
   *
   * @param context - Release context
   * @param props - Plugin configuration
   *
   * @example
   * ```typescript
   * const plugin = new GithubPR(context, {
   *   releasePR: true,
   *   releaseName: 'Release v${version}',
   *   commitMessage: 'chore: release v${version}',
   *   draft: false,
   *   preRelease: false
   * });
   * ```
   */
  constructor(
    protected readonly context: ReleaseContext,
    props: GithubPRProps
  ) {
    super(context, 'githubPR', {
      releaseName: DEFAULT_RELEASE_NAME,
      ...props
    });

    this.githubManager = new GithubManager(this.context);
    this.releaseParams = new ReleaseParams(context.logger, {
      PRTitle: this.getConfig('PRTitle', this.context.options.PRTitle),
      PRBody: this.getConfig('PRBody', this.context.options.PRBody),
      ...this.props
    });
  }

  /**
   * Determines if the plugin should be enabled
   *
   * Plugin is enabled unless explicitly skipped via configuration.
   * This allows for conditional PR creation and release publishing.
   *
   * @param _name - Plugin name (unused)
   * @returns True if plugin should be enabled
   *
   * @example
   * ```typescript
   * const plugin = new GithubPR(context, { skip: true });
   * plugin.enabled(); // false
   *
   * const plugin2 = new GithubPR(context, {});
   * plugin2.enabled(); // true
   * ```
   */
  public enabled(_name: string): boolean {
    if (this.getConfig('skip')) {
      return false;
    }

    return true;
  }

  /**
   * Determines if the plugin is in publish mode
   *
   * In publish mode, the plugin publishes releases directly.
   * In non-publish mode (releasePR=true), it creates pull requests.
   *
   * @returns True if in publish mode
   *
   * @example
   * ```typescript
   * const plugin = new GithubPR(context, { releasePR: true });
   * plugin.isPublish; // false (PR mode)
   *
   * const plugin2 = new GithubPR(context, { releasePR: false });
   * plugin2.isPublish; // true (publish mode)
   * ```
   */
  public get isPublish(): boolean {
    return !this.getConfig('releasePR');
  }

  /**
   * Checks if the current repository is a GitHub repository
   *
   * Verifies that the remote URL contains 'github.com' to ensure
   * GitHub-specific features can be used.
   *
   * @returns Promise resolving to true if GitHub repository
   *
   * @example
   * ```typescript
   * const isGithub = await plugin.isGithubRepository();
   * if (isGithub) {
   *   // Use GitHub-specific features
   * }
   * ```
   * @private
   */
  private async isGithubRepository(): Promise<boolean> {
    try {
      const remoteUrl = await this.getRemoteUrl();
      return remoteUrl.includes('github.com');
    } catch {
      return false;
    }
  }

  /**
   * Plugin initialization hook
   *
   * Performs pre-execution setup:
   * 1. Verifies repository is on GitHub
   * 2. Runs parent class initialization
   * 3. Sets up NPM token for publishing
   *
   * @throws Error if not a GitHub repository
   * @throws Error if NPM_TOKEN missing in publish mode
   *
   * @example
   * ```typescript
   * const plugin = new GithubPR(context, {});
   * await plugin.onBefore();
   * // Throws if not GitHub repo or missing NPM token
   * ```
   */
  public override async onBefore(): Promise<void> {
    this.logger.debug('GithubPR onBefore');

    const isGithub = await this.isGithubRepository();
    if (!isGithub) {
      throw new Error(
        'Current repository is not a GitHub repository. GitHub PR workflow is only available for GitHub repositories.'
      );
    }

    await super.onBefore();

    if (this.isPublish) {
      const npmToken = this.context.getEnv('NPM_TOKEN');
      if (!npmToken) {
        throw new Error('NPM_TOKEN is not set');
      }

      await this.shell.exec(
        `npm config set //registry.npmjs.org/:_authToken=${npmToken}`
      );
    }
  }

  /**
   * Main plugin execution hook
   *
   * Processes changelogs for all workspaces using GitHub-specific
   * formatting and updates the context with the results.
   *
   * Process:
   * 1. Initialize GitHub changelog processor
   * 2. Transform workspace changelogs
   * 3. Update context with new workspace info
   *
   * @example
   * ```typescript
   * const plugin = new GithubPR(context, {});
   * await plugin.onExec();
   * // Transforms changelogs with GitHub links
   * ```
   */
  public async onExec(): Promise<void> {
    const workspaces = this.context.workspaces!;

    const githubChangelog = new GithubChangelog(
      this.context.getOptions('changelog'),
      this.githubManager
    );

    const newWorkspaces = await this.step({
      label: 'GithubPR Changelogs',
      task: () => githubChangelog.transformWorkspace(workspaces, this.context)
    });

    this.context.setWorkspaces(newWorkspaces);
  }

  /**
   * Success hook after plugin execution
   *
   * Handles either PR creation or release publishing based on
   * configuration. In publish mode, publishes to NPM and creates
   * GitHub releases. In PR mode, creates release pull requests.
   *
   * @example PR mode
   * ```typescript
   * const plugin = new GithubPR(context, { releasePR: true });
   * await plugin.onSuccess();
   * // Creates release PR
   * ```
   *
   * @example Publish mode
   * ```typescript
   * const plugin = new GithubPR(context, { releasePR: false });
   * await plugin.onSuccess();
   * // Publishes to NPM and creates GitHub release
   * ```
   */
  public async onSuccess(): Promise<void> {
    if (this.isPublish) {
      await this.publishPR(this.context.workspaces!);

      return;
    }

    await this.releasePR(this.context.workspaces!);
  }

  /**
   * Creates a release pull request
   *
   * Handles the complete process of creating a release PR:
   * 1. Creates release commit
   * 2. Creates release branch
   * 3. Creates and configures pull request
   *
   * @param workspaces - Array of workspace configurations
   *
   * @example
   * ```typescript
   * const workspaces = [{
   *   name: 'pkg-a',
   *   version: '1.0.0',
   *   changelog: '...'
   * }];
   *
   * await plugin.releasePR(workspaces);
   * // Creates PR with release changes
   * ```
   */
  public async releasePR(workspaces: WorkspaceValue[]): Promise<void> {
    await this.step({
      label: 'Release Commit',
      task: () => this.relesaeCommit(workspaces)
    });

    const releaseBranchParams = await this.step({
      label: 'Create Release Branch',
      task: () => this.createReleaseBranch(workspaces)
    });

    await this.releasePullRequest(workspaces, releaseBranchParams);
  }

  /**
   * Publishes releases to NPM and GitHub
   *
   * In non-dry-run mode:
   * 1. Publishes packages to NPM
   * 2. Pushes tags to GitHub
   * 3. Creates GitHub releases
   *
   * @param workspaces - Array of workspace configurations
   *
   * @example
   * ```typescript
   * const workspaces = [{
   *   name: 'pkg-a',
   *   version: '1.0.0',
   *   changelog: '...'
   * }];
   *
   * await plugin.publishPR(workspaces);
   * // Publishes to NPM and creates GitHub releases
   * ```
   */
  public async publishPR(workspaces: WorkspaceValue[]): Promise<void> {
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

  /**
   * Creates release commit(s)
   *
   * Creates either a single commit for all workspaces or
   * individual commits per workspace. Uses configured commit
   * message template.
   *
   * @param workspaces - Array of workspace configurations
   *
   * @example Single workspace
   * ```typescript
   * await plugin.relesaeCommit([{
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * }]);
   * // Creates: "chore(tag): pkg-a v1.0.0"
   * ```
   *
   * @example Multiple workspaces
   * ```typescript
   * await plugin.relesaeCommit([
   *   { name: 'pkg-a', version: '1.0.0' },
   *   { name: 'pkg-b', version: '2.0.0' }
   * ]);
   * // Creates: "chore(tag): pkg-a v1.0.0,pkg-b v2.0.0"
   * ```
   * @private
   */
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

  /**
   * Creates and optionally merges a release pull request
   *
   * Creates a PR with release changes and handles auto-merge
   * if configured. Adds release and change labels to the PR.
   *
   * @param workspaces - Array of workspace configurations
   * @param releaseBranchParams - Branch and tag information
   *
   * @example Manual merge
   * ```typescript
   * await plugin.releasePullRequest(
   *   workspaces,
   *   { releaseBranch: 'release-v1.0.0', tagName: 'v1.0.0' }
   * );
   * // Creates PR for manual merge
   * ```
   *
   * @example Auto-merge
   * ```typescript
   * const plugin = new GithubPR(context, {
   *   autoMergeReleasePR: true
   * });
   *
   * await plugin.releasePullRequest(workspaces, params);
   * // Creates and auto-merges PR
   * ```
   */
  public async releasePullRequest(
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

  /**
   * Creates a commit for a single workspace
   *
   * Uses the configured commit message template to create a
   * commit for the workspace's changes.
   *
   * @param workspace - Workspace configuration
   * @param commitArgs - Additional Git commit arguments
   * @returns Promise resolving to commit output
   *
   * @example Basic commit
   * ```typescript
   * await plugin.commitWorkspace({
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * });
   * // Creates: "chore(tag): pkg-a v1.0.0"
   * ```
   *
   * @example With arguments
   * ```typescript
   * await plugin.commitWorkspace(
   *   { name: 'pkg-a', version: '1.0.0' },
   *   ['--no-verify']
   * );
   * ```
   * @private
   */
  private async commitWorkspace(
    workspace: WorkspaceValue,
    commitArgs: string[] = []
  ): Promise<string> {
    const commitMessage = Shell.format(
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
  /**
   * Creates a release branch for changes
   *
   * Creates a new branch from the current branch for release
   * changes. The branch name is generated from the configured
   * template and workspace information.
   *
   * Process:
   * 1. Generate branch parameters
   * 2. Fetch required branches
   * 3. Create and push release branch
   *
   * @param workspaces - Array of workspace configurations
   * @returns Promise resolving to branch parameters
   *
   * @example
   * ```typescript
   * const params = await plugin.createReleaseBranch([{
   *   name: 'pkg-a',
   *   version: '1.0.0'
   * }]);
   * // {
   * //   tagName: 'pkg-a@1.0.0',
   * //   releaseBranch: 'release-pkg-a-1.0.0'
   * // }
   * ```
   *
   * @throws Error if tag name is invalid
   * @throws Error if branch creation fails
   * @private
   */
  private async createReleaseBranch(
    workspaces: WorkspaceValue[]
  ): Promise<ReleaseBranchParams> {
    const params = this.releaseParams.getReleaseBranchParams(
      workspaces,
      // @ts-expect-error TODO: fix this
      this.context.getTemplateContext()
    );

    const { tagName, releaseBranch } = params;

    if (typeof tagName !== 'string') {
      throw new Error('Tag name is not a string');
    }

    const { sourceBranch, currentBranch } =
      this.context.getOptions() as ReleaseContextConfig;

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
  /**
   * Creates a release pull request
   *
   * Creates a pull request with:
   * 1. Release label
   * 2. Change labels (if configured)
   * 3. Generated title and body
   * 4. Proper branch configuration
   *
   * @param workspaces - Array of workspace configurations
   * @param releaseBranchParams - Branch and tag information
   * @returns Promise resolving to PR number
   *
   * @example Basic PR
   * ```typescript
   * const prNumber = await plugin.createReleasePR(
   *   workspaces,
   *   { releaseBranch: 'release-v1.0.0', tagName: 'v1.0.0' }
   * );
   * // Creates PR with default labels
   * ```
   *
   * @example With change labels
   * ```typescript
   * const plugin = new GithubPR(context, {
   *   pushChangeLabels: true
   * });
   *
   * const prNumber = await plugin.createReleasePR(
   *   workspaces,
   *   params
   * );
   * // Creates PR with release and change labels
   * ```
   * @private
   */
  private async createReleasePR(
    workspaces: WorkspaceValue[],
    releaseBranchParams: ReleaseBranchParams
  ): Promise<string> {
    const label = await this.githubManager.createReleasePRLabel();

    let labels = [label!.name!];

    // if pushChangeLabels is true, then push the changed labels to the release PR
    if (this.getConfig('pushChangeLabels')) {
      const changeLabels = this.context.getOptions('workspaces.changeLabels');
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
