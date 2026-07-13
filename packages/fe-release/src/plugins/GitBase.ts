/**
 * @module GitBase
 * @description Base class for Git-related plugins
 *
 * This module provides a base class for plugins that interact with Git
 * repositories. It handles common Git operations like branch management,
 * repository information retrieval, and commit operations.
 *
 * Core Features:
 * - Git repository information retrieval (generic, supports GitHub/GitLab/Gitee etc.)
 * - Branch management
 * - Commit operations
 * - Error handling
 *
 * @example Basic usage
 * ```typescript
 * class MyGitPlugin extends GitBase<GitBaseProps> {
 *   async onExec() {
 *     const branch = await this.getCurrentBranch();
 *     await this.commit('feat: new feature');
 *   }
 * }
 * ```
 *
 * @example Repository info
 * ```typescript
 * class RepoPlugin extends GitBase<GitBaseProps> {
 *   async onExec() {
 *     const info = await this.getGitRepositoryInfo();
 *     // {
 *     //   repoName: 'my-repo',
 *     //   authorName: 'org-or-group'
 *     // }
 *   }
 * }
 * ```
 */
import isString from 'lodash/isString';
import type ReleaseContext from '../implments/ReleaseContext';
import { ScriptPlugin, type ScriptPluginProps } from '@qlover/scripts-context';
import parse from 'git-url-parse';

/**
 * Type guard for valid string values
 *
 * Checks if a value is a non-empty string. Used for validating
 * repository information and other string inputs.
 *
 * @param value - Value to check
 * @returns True if value is a non-empty string
 */
function isValidString(value: unknown): value is string {
  return !!value && isString(value);
}

/**
 * Repository information type
 *
 * Contains essential information about a Git repository,
 * including repository name and owner/organization/namespace.
 *
 * @example
 * ```typescript
 * const info: GitRepositoryInfoType = {
 *   repoName: 'my-project',
 *   authorName: 'my-org' // or 'my-group/subgroup'
 * };
 * ```
 */
type GitRepositoryInfoType = {
  /** Repository name without owner */
  repoName: string;
  /** Repository owner, organization, or namespace (e.g., for GitLab subgroups) */
  authorName: string;
};

export type GitRepositoryParsedType = parse.GitUrl;

/**
 * Base configuration for Git-related plugins
 *
 * Extends ScriptPluginProps with generic options.
 *
 * @example
 * ```typescript
 * const config: GitBaseProps = {
 *   timeout: 5000
 * };
 * ```
 */
export interface GitBaseProps extends ScriptPluginProps {
  /**
   * Environment variable name for GitHub API token
   * @deprecated This property is GitHub-specific, use a subclass if needed.
   */
  tokenRef?: string;

  /**
   * Timeout for API requests in milliseconds (generic)
   */
  timeout?: number;
}

/**
 * Base class for Git-related plugins
 *
 * Provides common functionality for plugins that interact with
 * Git repositories. Handles repository information,
 * branch management, and commit operations.
 *
 * Features:
 * - Automatic repository info detection (generic)
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
 * @example Custom repository parsing (override protected method)
 * ```typescript
 * class CustomParserPlugin extends GitBase<GitBaseProps> {
 *   protected parseRemoteUrl(remoteUrl: string) {
 *     // Custom logic for a private Git server
 *     const match = remoteUrl.match(/mygit\.com\/([^/]+)\/([^/.]+)/);
 *     if (!match) throw new Error('Unsupported URL format');
 *     return { owner: match[1], name: match[2] };
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
   * 1. Checks if the current directory is a Git repository
   * 2. Retrieves repository information (owner, name)
   * 3. Gets current branch and switches to it (if needed)
   * 4. Updates context with repository info
   *
   * @throws Error if repository information cannot be retrieved
   */
  public override async onBefore(): Promise<void> {
    // 1. Verify this is a Git repository
    const isRepo = await this.isGitRepository();
    if (!isRepo) {
      throw new Error(
        'Current directory is not a Git repository. Please run inside a Git repo.'
      );
    }

    // 2. Retrieve repository info (owner and repo name)
    const repoInfo = await this.getGitRepositoryInfo();
    if (!repoInfo) {
      throw new Error('Failed to retrieve repository information from remote.');
    }

    // 3. Get current branch (use provided or auto-detect)
    let currentBranch = this.context.options.currentBranch;
    if (!currentBranch) {
      currentBranch = await this.getCurrentBranch();
    }

    // 4. Switch to the current branch (ensure we are on the correct branch)
    if (currentBranch) {
      await this.context.shell.exec(`git checkout ${currentBranch}`, {
        dryRun: false
      });
    }

    // 5. Store info in context for downstream plugins
    this.context.setParameters({
      repoName: repoInfo.repoName,
      authorName: repoInfo.authorName,
      currentBranch
    });
  }

  /**
   * Checks if the current directory is a Git repository
   *
   * @returns Promise resolving to boolean
   */
  public async isGitRepository(): Promise<boolean> {
    try {
      await this.context.shell.exec('git rev-parse --git-dir', {
        dryRun: false,
        silent: true // 避免输出错误信息
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets the current Git branch name
   *
   * Retrieves the name of the currently checked out Git branch.
   * Includes a small delay to ensure Git's internal state is updated.
   *
   * @returns Promise resolving to branch name
   * @throws Error if branch name cannot be retrieved
   */
  public async getCurrentBranch(): Promise<string> {
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
   *
   * @returns Promise resolving to remote URL
   * @throws Error if remote URL cannot be retrieved
   */
  public async getRemoteUrl(): Promise<string> {
    return (
      await this.context.shell.exec('git config --get remote.origin.url', {
        dryRun: false
      })
    ).trim();
  }

  /**
   * Retrieves repository owner and name from Git remote URL.
   *
   * This method uses the protected `parseRemoteUrl` to extract the owner and name.
   * By default, it uses the `git-url-parse` library, which supports GitHub, GitLab,
   * Gitee, Bitbucket, and many other Git hosting services.
   *
   * Subclasses can override `parseRemoteUrl` to implement custom parsing logic.
   *
   * @returns An object containing repository name and owner name
   * @throws Will throw an error if repository information cannot be determined
   */
  public async getGitRepositoryInfo(): Promise<GitRepositoryInfoType> {
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
        'Git remote URL is empty. Please set a valid Git remote URL.'
      );
    }

    this.logger.debug(`Git Repository URL: ${repoUrl}`);

    let owner: string;
    let name: string;
    try {
      const parsed = this.parseRemoteUrl(repoUrl);
      owner = parsed.owner;
      name = parsed.name;
    } catch (err) {
      throw new Error(
        `Failed to parse Git remote URL: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    if (!isValidString(owner) || !isValidString(name)) {
      throw new Error(
        'Failed to extract owner or repository name from Git URL.'
      );
    }

    return { repoName: name, authorName: owner };
  }

  /**
   * Parses a Git remote URL to extract repository owner and name.
   *
   * This method is protected and can be overridden by subclasses to provide
   * custom parsing logic for private Git servers or other edge cases.
   *
   * The default implementation uses `git-url-parse` which supports most common
   * Git hosting services (GitHub, GitLab, Gitee, Bitbucket, etc.).
   *
   * @param remoteUrl - The full remote URL (e.g., https://github.com/owner/repo.git)
   * @returns An object containing `owner` and `name` of the repository.
   * @throws Error if the URL cannot be parsed.
   */
  protected parseRemoteUrl(remoteUrl: string): GitRepositoryParsedType {
    const parsed = parse(remoteUrl);
    // For GitLab subgroups, parsed.owner may contain the full path (e.g., 'group/subgroup')
    // For GitHub, it's just the user/organization name.
    return parsed;
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
  public commit(message: string, args: string[] = []): Promise<string> {
    return this.shell.exec([
      'git',
      'commit',
      '--message',
      JSON.stringify(message),
      ...args
    ]);
  }

  /**
   * Checks whether the working tree has staged or unstaged changes
   */
  public async hasWorkingTreeChanges(): Promise<boolean> {
    const output = await this.shell.exec('git status --porcelain', {
      dryRun: false,
      silent: true
    });
    return output.trim().length > 0;
  }

  /**
   * Creates a local branch from the current branch
   *
   * @param newBranch - The name of the new branch
   * @param sourceBranch - The name of the source branch
   * @param currentBranch - The name of the current branch
   */
  public async createBranch(
    newBranch: string,
    sourceBranch: string,
    currentBranch: string
  ): Promise<void> {
    await this.shell.exec(`git fetch origin ${sourceBranch} ${currentBranch}`);
    await this.shell.exec(`git checkout -b ${newBranch} ${currentBranch}`);
  }

  /**
   * Pushes a branch to the origin remote
   *
   * @param branch - The name of the branch to push
   */
  public async pushBranch(branch: string): Promise<void> {
    await this.shell.exec(`git push origin ${branch}`);
  }
}
