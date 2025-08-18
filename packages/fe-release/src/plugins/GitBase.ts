/**
 * @module GitBase
 * @description Base class for Git-related plugins
 *
 * This module provides a base class for plugins that interact with Git
 * repositories. It handles common Git operations like branch management,
 * repository information retrieval, and commit operations.
 *
 * Core Features:
 * - Git repository information retrieval
 * - Branch management
 * - Commit operations
 * - GitHub remote URL parsing
 * - Error handling
 *
 * @example Basic usage
 * ```typescript
 * class MyGitPlugin extends GitBase<GitBaseProps> {
 *   async onExec() {
 *     // Get current branch
 *     const branch = await this.getCurrentBranch();
 *
 *     // Create commit
 *     await this.commit('feat: new feature');
 *   }
 * }
 * ```
 *
 * @example Repository info
 * ```typescript
 * class RepoPlugin extends GitBase<GitBaseProps> {
 *   async onExec() {
 *     const info = await this.getUserInfo();
 *     // {
 *     //   repoName: 'my-repo',
 *     //   authorName: 'org-name'
 *     // }
 *   }
 * }
 * ```
 */
import isString from 'lodash/isString';
import ReleaseContext from '../implments/ReleaseContext';
import { ScriptPlugin, ScriptPluginProps } from '@qlover/scripts-context';

/**
 * Repository information type
 *
 * Contains essential information about a GitHub repository,
 * including repository name and owner/organization name.
 *
 * @example
 * ```typescript
 * const info: UserInfoType = {
 *   repoName: 'my-project',
 *   authorName: 'my-org'
 * };
 * ```
 */
type UserInfoType = {
  /** Repository name without owner */
  repoName: string;
  /** Repository owner or organization name */
  authorName: string;
};

/**
 * Base configuration for Git-related plugins
 *
 * Extends ScriptPluginProps with GitHub-specific configuration
 * options for API access and timeouts.
 *
 * @example
 * ```typescript
 * const config: GitBaseProps = {
 *   tokenRef: 'CUSTOM_TOKEN',
 *   timeout: 5000
 * };
 * ```
 */
export interface GitBaseProps extends ScriptPluginProps {
  /**
   * Environment variable name for GitHub API token
   *
   * The value of this environment variable will be used
   * for GitHub API authentication.
   *
   * @default 'GITHUB_TOKEN'
   *
   * @example
   * ```typescript
   * process.env.CUSTOM_TOKEN = 'ghp_123...';
   * const config = { tokenRef: 'CUSTOM_TOKEN' };
   * ```
   */
  tokenRef?: string;

  /**
   * Timeout for GitHub API requests in milliseconds
   *
   * Controls how long to wait for GitHub API responses
   * before timing out.
   *
   * @example
   * ```typescript
   * const config = { timeout: 5000 }; // 5 seconds
   * ```
   */
  timeout?: number;
}

/**
 * Base class for Git-related plugins
 *
 * Provides common functionality for plugins that interact with
 * Git repositories and GitHub. Handles repository information,
 * branch management, and commit operations.
 *
 * Features:
 * - Automatic repository info detection
 * - Branch management
 * - Commit creation
 * - Error handling
 *
 * @template T - Plugin configuration type extending GitBaseProps
 *
 * @example Basic plugin
 * ```typescript
 * class CustomGitPlugin extends GitBase<GitBaseProps> {
 *   async onExec() {
 *     const branch = await this.getCurrentBranch();
 *     await this.commit('feat: add feature');
 *   }
 * }
 * ```
 *
 * @example Custom configuration
 * ```typescript
 * interface CustomProps extends GitBaseProps {
 *   customOption: string;
 * }
 *
 * class CustomPlugin extends GitBase<CustomProps> {
 *   async onExec() {
 *     const option = this.getConfig('customOption');
 *     // Implementation
 *   }
 * }
 * ```
 */
export default class GitBase<T extends GitBaseProps> extends ScriptPlugin<
  ReleaseContext,
  T
> {
  /**
   * Plugin initialization hook
   *
   * Runs before plugin execution to set up repository context:
   * 1. Retrieves repository information
   * 2. Gets current branch
   * 3. Switches to current branch if needed
   * 4. Updates context with repository info
   *
   * @throws Error if repository information cannot be retrieved
   *
   * @example
   * ```typescript
   * class MyPlugin extends GitBase<GitBaseProps> {
   *   async onExec() {
   *     // onBefore has already:
   *     // - Set up repository info
   *     // - Switched to correct branch
   *     // - Updated context
   *     await this.doSomething();
   *   }
   * }
   * ```
   */
  override async onBefore(): Promise<void> {
    const repoInfo = await this.getUserInfo();

    if (!repoInfo) {
      throw new Error('Failed to get repoInfo');
    }

    let currentBranch = this.context.options.currentBranch;
    if (!currentBranch) {
      currentBranch = await this.getCurrentBranch();
    }

    if (currentBranch) {
      // switch to current branch
      await this.context.shell.exec(`git checkout ${currentBranch}`, {
        dryRun: false
      });
    }

    this.context.setOptions({
      repoName: repoInfo.repoName,
      authorName: repoInfo.authorName,
      currentBranch
    });
  }

  /**
   * Gets the current Git branch name
   *
   * Retrieves the name of the currently checked out Git branch.
   * Includes a small delay to ensure Git's internal state is updated.
   *
   * @returns Promise resolving to branch name
   * @throws Error if branch name cannot be retrieved
   *
   * @example
   * ```typescript
   * const branch = await plugin.getCurrentBranch();
   * // 'main' or 'feature/new-feature'
   * ```
   */
  async getCurrentBranch(): Promise<string> {
    // Add a small delay to ensure Git internal state is updated
    await new Promise((resolve) => setTimeout(resolve, 100));

    return this.context.shell.exec('git rev-parse --abbrev-ref HEAD', {
      dryRun: false
    });
  }

  /**
   * Gets the Git remote URL
   *
   * Retrieves the URL of the 'origin' remote from Git configuration.
   * This URL is used to identify the GitHub repository.
   *
   * @returns Promise resolving to remote URL
   * @throws Error if remote URL cannot be retrieved
   *
   * @example
   * ```typescript
   * const url = await plugin.getRemoteUrl();
   * // 'https://github.com/org/repo.git'
   * // or
   * // 'git@github.com:org/repo.git'
   * ```
   */
  async getRemoteUrl(): Promise<string> {
    return (
      await this.context.shell.exec('git config --get remote.origin.url', {
        dryRun: false
      })
    ).trim();
  }

  /**
   * Retrieves repository owner and name from Git remote URL.
   *
   * This method gets repository information directly from git remote origin URL.
   * Requires the project to be a git repository with a valid GitHub remote URL.
   *
   * @param shell - The shell instance for executing commands
   * @returns An object containing repository name and owner name
   * @throws Will throw an error if repository information cannot be determined
   */
  async getUserInfo(): Promise<UserInfoType> {
    let repoUrl: string;
    try {
      repoUrl = await this.getRemoteUrl();
    } catch {
      throw new Error(
        'Failed to get git remote url. Please ensure this is a git repository with a valid remote.'
      );
    }

    if (!repoUrl) {
      throw new Error(
        'Git remote URL is empty. Please set a valid GitHub remote URL.'
      );
    }

    this.context.logger.debug('repoUrl: ', repoUrl);

    // Parse GitHub URL to get owner and repo name
    const githubUrlPattern = /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/;
    const match = repoUrl.match(githubUrlPattern);

    if (!match) {
      throw new Error(
        'Invalid GitHub repository URL format. Please ensure the remote URL is from GitHub.'
      );
    }

    const [, authorName, repoName] = match;

    if (!this.isValidString(authorName) || !this.isValidString(repoName)) {
      throw new Error(
        'Failed to extract owner or repository name from GitHub URL'
      );
    }

    return { repoName, authorName };
  }

  /**
   * Checks if the provided value is a valid string.
   *
   * A valid string is defined as a non-empty string.
   *
   * @param value - The value to check.
   * @returns True if the value is a valid string, otherwise false.
   */
  /**
   * Type guard for valid string values
   *
   * Checks if a value is a non-empty string. Used for validating
   * repository information and other string inputs.
   *
   * @param value - Value to check
   * @returns True if value is a non-empty string
   *
   * @example
   * ```typescript
   * if (plugin.isValidString(value)) {
   *   // value is definitely a non-empty string
   *   console.log(value.toUpperCase());
   * }
   * ```
   */
  isValidString(value: unknown): value is string {
    return !!value && isString(value);
  }

  /**
   * Creates a Git commit
   *
   * Creates a new Git commit with the specified message and optional
   * additional arguments. The message is automatically JSON-stringified
   * to handle special characters properly.
   *
   * @param message - Commit message
   * @param args - Additional Git commit arguments
   * @returns Promise resolving to command output
   *
   * @example Basic commit
   * ```typescript
   * await plugin.commit('feat: add new feature');
   * ```
   *
   * @example Commit with arguments
   * ```typescript
   * await plugin.commit('fix: update deps', ['--no-verify']);
   * ```
   *
   * @example Commit with special characters
   * ```typescript
   * await plugin.commit('fix: handle "quotes" & symbols');
   * // Message is automatically escaped
   * ```
   */
  commit(message: string, args: string[] = []): Promise<string> {
    return this.context.shell.exec([
      'git',
      'commit',
      '--message',
      JSON.stringify(message),
      ...args
    ]);
  }
}
