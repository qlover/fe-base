import type ReleaseContext from '../implments/ReleaseContext';
import isString from 'lodash/isString';

type UserInfoType = {
  repoName: string;
  authorName: string;
};

export default class GitBase {
  constructor(private context: ReleaseContext) {}

  async onBefore(): Promise<void> {
    const repoInfo = await this.getUserInfo();

    if (!repoInfo) {
      throw new Error('Failed to get repoInfo');
    }

    const sourceBranch = this.context.shared.sourceBranch;

    // switch to source branch
    await this.context.shell.exec(`git checkout ${sourceBranch}`);

    this.context.setShared({
      repoName: repoInfo.repoName,
      authorName: repoInfo.authorName
    });
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
    // 获取 git remote origin url
    let repoUrl: string;
    try {
      repoUrl = (
        await this.context.shell.exec('git config --get remote.origin.url', {
          dryRun: false
        })
      ).trim();
    } catch (error) {
      throw new Error(
        'Failed to get git remote url. Please ensure this is a git repository with a valid remote.'
      );
    }

    if (!repoUrl) {
      throw new Error(
        'Git remote URL is empty. Please set a valid GitHub remote URL.'
      );
    }

    this.context.logger.verbose('repoUrl: ', repoUrl);

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
}
