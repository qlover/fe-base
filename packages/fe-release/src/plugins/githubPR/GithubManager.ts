/**
 * @module GithubManager
 * @description GitHub API Integration Manager
 *
 * This module provides a comprehensive interface for interacting with
 * GitHub's API, handling pull requests, releases, labels, and other
 * GitHub-specific operations.
 *
 * Core Features:
 * - Pull request management
 * - Release creation and publishing
 * - Label management
 * - Repository information handling
 * - Authentication and token management
 * - Error handling and dry run support
 *
 * @example Basic usage
 * ```typescript
 * const manager = new GithubManager(context);
 *
 * // Create PR
 * const prNumber = await manager.createReleasePR({
 *   title: 'Release v1.0.0',
 *   body: 'Release notes...',
 *   base: 'main',
 *   head: 'release-1.0.0'
 * });
 * ```
 *
 * @example Release creation
 * ```typescript
 * await manager.createRelease({
 *   name: 'pkg-a',
 *   version: '1.0.0',
 *   tagName: 'v1.0.0',
 *   changelog: '...'
 * });
 * ```
 */
import { Shell, ShellInterface } from '@qlover/scripts-context';
import type ReleaseContext from '../../implments/ReleaseContext';
import type { LoggerInterface } from '@qlover/logger';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import {
  DEFAULT_AUTO_MERGE_RELEASE_PR,
  DEFAULT_AUTO_MERGE_TYPE
} from '../../defaults';
import { GithubPRProps } from './GithubPR';
import { WorkspaceValue } from '../workspaces/Workspaces';
import { ReleaseContextConfig } from '../../implments/ReleaseContext';

export interface PullRequestManagerOptions {
  token: string;
  owner: string;
  repo: string;
}

export type PullRequestCommits =
  RestEndpointMethodTypes['pulls']['listCommits']['response']['data'];

export type PullRequestInfo =
  RestEndpointMethodTypes['pulls']['get']['response']['data'];

export type CommitInfo =
  RestEndpointMethodTypes['repos']['getCommit']['response']['data'];

export type CreateReleaseOptions =
  import('@octokit/rest').RestEndpointMethodTypes['repos']['createRelease']['parameters'];

type CreatePROptionsArgs = {
  /**
   * Get the labels to add to the created PR.
   *
   * These labels must have already been created.
   *
   * @default `[]`
   */
  labels?: string[];

  title: string;
  body: string;

  base: string;
  head: string;
};

/**
 * GitHub API Integration Manager
 *
 * Manages interactions with GitHub's API for release automation.
 * Handles authentication, repository operations, and provides
 * high-level abstractions for common GitHub workflows.
 *
 * Features:
 * - Lazy Octokit initialization
 * - Token management
 * - Repository information handling
 * - Pull request operations
 * - Release management
 * - Label handling
 * - Error handling with retries
 *
 * @example Basic initialization
 * ```typescript
 * const manager = new GithubManager(context);
 * await manager.createReleasePR({
 *   title: 'Release v1.0.0',
 *   body: 'Changes...',
 *   base: 'main',
 *   head: 'release'
 * });
 * ```
 *
 * @example Release workflow
 * ```typescript
 * const manager = new GithubManager(context);
 *
 * // Create and merge PR
 * const prNumber = await manager.createReleasePR(options);
 * await manager.mergePR(prNumber, 'release-branch');
 *
 * // Create release
 * await manager.createRelease({
 *   name: 'pkg-a',
 *   tagName: 'v1.0.0',
 *   changelog: '...'
 * });
 * ```
 */
export default class GithubManager {
  /** Lazy-loaded Octokit instance */
  private _octokit: Octokit | null = null;

  /**
   * Creates a new GithubManager instance
   *
   * @param context - Release context containing configuration
   *
   * @example
   * ```typescript
   * const manager = new GithubManager(context);
   * ```
   */
  constructor(private context: ReleaseContext) {}

  /**
   * Gets GitHub repository information
   *
   * Retrieves the owner and repository name from the context.
   * This information is required for most GitHub API operations.
   *
   * @returns Repository owner and name
   * @throws Error if owner or repo name is not set
   *
   * @example
   * ```typescript
   * const info = manager.getGitHubUserInfo();
   * // { owner: 'org-name', repo: 'repo-name' }
   * ```
   */
  public getGitHubUserInfo(): Omit<PullRequestManagerOptions, 'token'> {
    const { authorName, repoName } =
      this.context.getOptions<ReleaseContextConfig>();

    if (!authorName || !repoName) {
      throw new Error('Author name or repo name is not set');
    }

    return {
      owner: authorName,
      repo: repoName
    };
  }

  /**
   * Gets GitHub API token
   *
   * Retrieves the GitHub API token from environment variables.
   * The token name can be configured via the tokenRef option.
   *
   * @returns GitHub API token
   * @throws Error if token is not set
   *
   * @example Default token
   * ```typescript
   * const token = manager.getToken();
   * // Uses GITHUB_TOKEN env var
   * ```
   *
   * @example Custom token
   * ```typescript
   * context.options.githubPR.tokenRef = 'CUSTOM_TOKEN';
   * const token = manager.getToken();
   * // Uses CUSTOM_TOKEN env var
   * ```
   */
  public getToken(): string {
    const { tokenRef = 'GITHUB_TOKEN' } =
      this.context.getOptions<GithubPRProps>('githubPR');

    const token = this.context.env.get(tokenRef);

    if (!token) {
      throw new Error(
        `Token is not set. Please set ${tokenRef} environment variable.`
      );
    }

    return token;
  }

  /**
   * Gets Octokit instance
   *
   * Lazily initializes and returns an Octokit instance configured
   * with the GitHub token and timeout settings.
   *
   * @returns Configured Octokit instance
   * @throws Error if token retrieval fails
   *
   * @example
   * ```typescript
   * const octokit = manager.octokit;
   * await octokit.rest.issues.create({
   *   ...manager.getGitHubUserInfo(),
   *   title: 'Issue title'
   * });
   * ```
   */
  public get octokit(): Octokit {
    if (this._octokit) {
      return this._octokit;
    }

    const { timeout } = this.context.getOptions<GithubPRProps>('githubPR');

    const options = {
      auth: this.getToken(),
      request: {
        timeout
      }
    };

    this._octokit = new Octokit(options);

    return this._octokit;
  }

  /**
   * Gets logger instance
   *
   * Provides access to the context's logger for consistent
   * logging across the manager.
   *
   * @returns Logger instance
   *
   * @example
   * ```typescript
   * manager.logger.info('Creating release...');
   * manager.logger.debug('API response:', response);
   * ```
   */
  public get logger(): LoggerInterface {
    return this.context.logger;
  }

  /**
   * Gets shell interface
   *
   * Provides access to the context's shell interface for
   * executing Git commands and other shell operations.
   *
   * @returns Shell interface
   *
   * @example
   * ```typescript
   * await manager.shell.exec('git fetch origin');
   * await manager.shell.exec(['git', 'push', 'origin', 'main']);
   * ```
   */
  public get shell(): ShellInterface {
    return this.context.shell;
  }

  /**
   * Auto merge type
   *
   * @default `squash`
   */
  /**
   * Gets auto-merge type for pull requests
   *
   * Determines how pull requests should be merged when
   * auto-merge is enabled. Defaults to 'squash'.
   *
   * @returns Auto-merge type ('merge', 'squash', or 'rebase')
   *
   * @example
   * ```typescript
   * const mergeType = manager.autoMergeType;
   * // 'squash' (default)
   *
   * context.options.autoMergeType = 'rebase';
   * manager.autoMergeType; // 'rebase'
   * ```
   */
  public get autoMergeType(): ReleaseContextConfig['autoMergeType'] {
    return (
      this.context.getOptions<ReleaseContextConfig>().autoMergeType ||
      DEFAULT_AUTO_MERGE_TYPE
    );
  }

  /**
   * Dry run PR number
   *
   * @default `999999`
   */
  /**
   * Gets pull request number for dry runs
   *
   * Returns a placeholder PR number when running in dry-run mode.
   * This allows testing PR-related functionality without creating
   * actual pull requests.
   *
   * @returns Dry run PR number (default: '999999')
   *
   * @example
   * ```typescript
   * context.dryRun = true;
   * const prNumber = manager.dryRunPRNumber;
   * // '999999'
   *
   * context.options.githubPR.dryRunPRNumber = '123456';
   * manager.dryRunPRNumber; // '123456'
   * ```
   */
  public get dryRunPRNumber(): string {
    return this.context.getOptions('githubPR.dryRunPRNumber', '999999');
  }

  /**
   * Auto merge release PR
   *
   * @default `false`
   */
  /**
   * Gets auto-merge setting for release PRs
   *
   * Determines whether release pull requests should be
   * automatically merged after creation. Defaults to false.
   *
   * @returns True if auto-merge is enabled
   *
   * @example
   * ```typescript
   * const autoMerge = manager.autoMergeReleasePR;
   * // false (default)
   *
   * context.options.autoMergeReleasePR = true;
   * manager.autoMergeReleasePR; // true
   * ```
   */
  public get autoMergeReleasePR(): boolean {
    return (
      this.context.getOptions('autoMergeReleasePR') ||
      DEFAULT_AUTO_MERGE_RELEASE_PR
    );
  }

  /**
   * Automatically merges a pull request.
   *
   * @param prNumber - The pull request number to merge.
   * @param releaseBranch - The branch to merge into.
   */
  /**
   * Merges a pull request
   *
   * Merges the specified pull request using the configured
   * merge method. In dry-run mode, logs the merge action
   * without performing it.
   *
   * @param prNumber - Pull request number
   * @param releaseBranch - Branch to merge
   * @throws Error if merge fails
   *
   * @example Basic merge
   * ```typescript
   * await manager.mergePR('123', 'release-1.0.0');
   * // Merges PR #123 using configured merge method
   * ```
   *
   * @example Dry run
   * ```typescript
   * context.dryRun = true;
   * await manager.mergePR('123', 'release-1.0.0');
   * // Logs merge action without performing it
   * ```
   */
  public async mergePR(prNumber: string, releaseBranch: string): Promise<void> {
    if (!prNumber) {
      this.logger.error('Failed to create Pull Request.', prNumber);
      return;
    }

    const mergeMethod = this.autoMergeType;

    if (this.context.dryRun) {
      const { repoName, authorName } =
        this.context.getOptions<ReleaseContextConfig>();
      this.logger.info(
        `[DRY RUN] Would merge PR #${prNumber} with method '${mergeMethod}' in repo ${authorName}/${repoName}, branch ${releaseBranch}`
      );
      return;
    }

    await this.octokit.rest.pulls.merge({
      ...this.getGitHubUserInfo(),
      pull_number: Number(prNumber),
      merge_method: mergeMethod
    });
  }

  /**
   * Gets commits from a pull request
   *
   * Retrieves all commits associated with the specified pull request.
   * Useful for generating changelogs or analyzing changes.
   *
   * @param prNumber - Pull request number
   * @returns Promise resolving to array of commit information
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const commits = await manager.getPullRequestCommits(123);
   * commits.forEach(commit => {
   *   console.log(commit.sha, commit.commit.message);
   * });
   * ```
   */
  public async getPullRequestCommits(
    prNumber: number
  ): Promise<PullRequestCommits> {
    const pr = await this.octokit.rest.pulls.listCommits({
      ...this.getGitHubUserInfo(),
      pull_number: prNumber
    });

    return pr.data;
  }

  /**
   * Gets detailed information about a commit
   *
   * Retrieves detailed information about a specific commit,
   * including files changed, author details, and commit message.
   *
   * @param commitSha - Commit SHA
   * @returns Promise resolving to commit information
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const info = await manager.getCommitInfo('abc123');
   * console.log(info.commit.message);
   * console.log(info.files.map(f => f.filename));
   * ```
   */
  public async getCommitInfo(commitSha: string): Promise<CommitInfo> {
    const pr = await this.octokit.rest.repos.getCommit({
      ...this.getGitHubUserInfo(),
      ref: commitSha
    });

    return pr.data;
  }

  /**
   * Gets pull request information
   *
   * Retrieves detailed information about a pull request,
   * including title, body, labels, and review status.
   *
   * @param prNumber - Pull request number
   * @returns Promise resolving to pull request information
   * @throws Error if request fails
   *
   * @example
   * ```typescript
   * const pr = await manager.getPullRequest(123);
   * console.log(pr.title);
   * console.log(pr.labels.map(l => l.name));
   * console.log(pr.mergeable_state);
   * ```
   */
  public async getPullRequest(
    prNumber: number
  ): Promise<RestEndpointMethodTypes['pulls']['get']['response']['data']> {
    const pr = await this.octokit.rest.pulls.get({
      ...this.getGitHubUserInfo(),
      pull_number: prNumber
    });

    return pr.data;
  }

  /**
   * Checks the status of a pull request.
   *
   * @param prNumber - The pull request number to check.
   * @param releaseBranch - The branch to check against.
   */
  /**
   * Checks pull request status and cleans up
   *
   * Verifies pull request status and deletes the release branch
   * if the PR has been merged. Used for post-merge cleanup.
   *
   * Process:
   * 1. Verify PR exists and status
   * 2. Delete release branch if PR merged
   * 3. Log cleanup results
   *
   * @param prNumber - Pull request number
   * @param releaseBranch - Branch to clean up
   * @throws Error if verification or cleanup fails
   *
   * @example
   * ```typescript
   * await manager.checkedPR('123', 'release-1.0.0');
   * // Verifies PR #123 and deletes release-1.0.0 if merged
   * ```
   */
  public async checkedPR(
    prNumber: string,
    releaseBranch: string
  ): Promise<void> {
    try {
      // Get PR information
      await this.getPullRequest(Number(prNumber));

      // Delete remote branch
      await this.octokit.rest.git.deleteRef({
        ...this.getGitHubUserInfo(),
        ref: `heads/${releaseBranch}`
      });

      this.logger.info(`Branch ${releaseBranch} has been deleted`);
    } catch (error) {
      if ((error as { status: number }).status === 404) {
        this.logger.warn(
          `PR #${prNumber} or branch ${releaseBranch} not found`
        );
        return;
      }
      this.logger.error('Failed to check PR or delete branch', error);
      throw error;
    }
  }

  /**
   * Creates a release pull request label.
   *
   * @returns The created label.
   * @throws If the label is not valid or if the creation fails.
   */
  public async createReleasePRLabel(): Promise<ReleaseContextConfig['label']> {
    const label = this.context.getOptions<ReleaseContextConfig>().label;

    if (!label || !label.name || !label.description || !label.color) {
      throw new Error('Label is not valid, skipping creation');
    }

    if (this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR label with:`, label);
      return label;
    }

    try {
      const result = await this.octokit.rest.issues.createLabel({
        ...this.getGitHubUserInfo(),
        name: label.name,
        description: label.description,
        color: label.color.replace('#', '') // remove # prefix
      });

      this.logger.debug('Create PR label Success', result);

      return label;
    } catch (error) {
      if ((error as { status: number }).status === 422) {
        this.logger.warn(`Label ${label.name} already exists, skipping!`);
        return label;
      }
      this.logger.error('Create PR label Failed', error);
      throw error;
    }
  }

  /**
   * Creates a release pull request.
   *
   * @param options - The options for creating the pull request.
   * @returns The created pull request number.
   * @throws If the creation fails or if the pull request already exists.
   */
  public async createReleasePR(options: CreatePROptionsArgs): Promise<string> {
    const dryRunCreatePR = this.context.getOptions('githubPR.dryRunCreatePR');

    if (dryRunCreatePR || this.context.dryRun) {
      this.logger.info(`[DRY RUN] Would create PR with:`, {
        ...options,
        labels: options.labels
      });
      return this.dryRunPRNumber;
    }

    try {
      // create PR
      const response = await this.octokit.rest.pulls.create({
        ...this.getGitHubUserInfo(),
        ...options
      });
      const issue_number = response.data.number;
      if (!issue_number) {
        throw new Error('CreateReleasePR Failed, prNumber is empty');
      }

      this.logger.debug('Create PR Success', [response?.url]);

      // add label
      if (options.labels && options.labels.length) {
        const response = await this.octokit.rest.issues.addLabels({
          ...this.getGitHubUserInfo(),
          issue_number,
          labels: options.labels
        });

        this.logger.debug('Add PR label Success', [response.url]);
      }

      return issue_number.toString();
    } catch (error) {
      if (
        (error as { status: number }).status === 422 &&
        (error as { message: string }).message.includes('already exists')
      ) {
        this.logger.warn('PR already exists');
        const match = (error as { message: string }).message.match(
          /pull request #(\d+)/
        );
        return match ? match[1] : '';
      }
      this.logger.error('Failed to create PR', error);
      throw error;
    }
  }

  /**
   * Truncates long PR/release body text
   *
   * GitHub has a limit on PR and release body length.
   * This method ensures the text stays within limits by
   * truncating if necessary.
   *
   * @param body - Body text to truncate
   * @returns Truncated text (if > 124000 chars)
   *
   * @example
   * ```typescript
   * const body = manager.truncateBody(veryLongText);
   * // Returns truncated text if > 124000 chars
   * // Adds '...' to indicate truncation
   * ```
   * @private
   */
  private truncateBody(body: string): string {
    if (body && body.length >= 124000) return body.substring(0, 124000) + '...';
    return body;
  }

  /**
   * Builds GitHub release options
   *
   * Combines default release options with provided overrides
   * and context configuration. Handles formatting of release
   * name, body, and other settings.
   *
   * @param options - Override options for release
   * @returns Complete release options
   *
   * @example
   * ```typescript
   * const opts = manager.getOctokitReleaseOptions({
   *   tag_name: 'v1.0.0',
   *   body: 'Release notes...'
   * });
   * // Returns merged options with defaults:
   * // {
   * //   name: 'Release v1.0.0',
   * //   body: 'Release notes...',
   * //   draft: false,
   * //   prerelease: false,
   * //   ...
   * // }
   * ```
   * @private
   */
  private getOctokitReleaseOptions(
    options: Partial<CreateReleaseOptions>
  ): CreateReleaseOptions {
    const {
      releaseName,
      draft = false,
      preRelease = false,
      autoGenerate = false,
      makeLatest = true,
      releaseNotes,
      discussionCategoryName = undefined
    } = this.context.getOptions<GithubPRProps>('githubPR');

    const name = releaseName;
    const body = autoGenerate ? '' : this.truncateBody(String(releaseNotes));

    return {
      name,
      make_latest: makeLatest.toString() as 'true' | 'false' | 'legacy',
      body,
      draft,
      prerelease: preRelease,
      generate_release_notes: autoGenerate,
      discussion_category_name: discussionCategoryName,
      tag_name: '',
      ...options,
      ...this.getGitHubUserInfo()
    };
  }

  /**
   * Creates a GitHub release
   *
   * Creates a new GitHub release for a workspace with:
   * - Formatted release name
   * - Changelog as release notes
   * - Proper tag
   * - Configurable settings (draft, prerelease, etc.)
   *
   * Handles dry run mode and error cases gracefully.
   *
   * @param workspace - Workspace to create release for
   * @throws Error if tag name is missing or creation fails
   *
   * @example Basic release
   * ```typescript
   * await manager.createRelease({
   *   name: 'pkg-a',
   *   version: '1.0.0',
   *   tagName: 'v1.0.0',
   *   changelog: '...'
   * });
   * ```
   *
   * @example Dry run
   * ```typescript
   * context.dryRun = true;
   * await manager.createRelease(workspace);
   * // Logs release info without creating
   * ```
   */
  public async createRelease(workspace: WorkspaceValue): Promise<void> {
    const meragedOptions = this.getOctokitReleaseOptions({
      tag_name: workspace.tagName,
      body: workspace.changelog
    });

    meragedOptions.name = Shell.format(
      meragedOptions.name,
      workspace as unknown as Record<string, string>
    );

    this.logger.log(
      `[DRY RUN] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name})`,
      {
        isDryRun: this.context.dryRun
      }
    );

    if (!meragedOptions.tag_name) {
      throw new Error('TagName is undefined');
    }

    if (this.context.dryRun) {
      return;
    }

    try {
      const response = await this.octokit.repos.createRelease(meragedOptions);

      this.logger.debug(
        `[DONE] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name}) (${response.headers.location})`
      );
    } catch (error) {
      this.logger.error(
        `[FAILED] octokit repos.createRelease "${meragedOptions.name}" (${meragedOptions.tag_name})`,
        error
      );
    }
  }
}
