import isString from 'lodash/isString';
import ReleaseContext from '../implments/ReleaseContext';
import { ScriptPlugin, ScriptPluginProps } from '@qlover/scripts-context';

type UserInfoType = {
  repoName: string;
  authorName: string;
};

export interface GitBaseProps extends ScriptPluginProps {
  /**
   * The token for the GitHub API
   *
   * @default `GITHUB_TOKEN`
   */
  tokenRef?: string;

  /**
   * The timeout for the GitHub API
   */
  timeout?: number;
}

export default class GitBase<T extends GitBaseProps> extends ScriptPlugin<
  ReleaseContext,
  T
> {
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

  async getCurrentBranch(): Promise<string> {
    // Add a small delay to ensure Git internal state is updated
    await new Promise((resolve) => setTimeout(resolve, 100));

    return this.context.shell.exec('git rev-parse --abbrev-ref HEAD', {
      dryRun: false
    });
  }

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
  isValidString(value: unknown): value is string {
    return !!value && isString(value);
  }

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
