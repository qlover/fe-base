import type ReleaseContext from '../../interface/ReleaseContext';
import type { UserInfoType } from '../../type';
import isString from 'lodash/isString';

export default class ReleaseBase {
  constructor(private context: ReleaseContext) {}

  get repoInfo(): UserInfoType | undefined {
    return this.context.shared.repoInfo;
  }

  async init(): Promise<void> {
    const repoInfo = await this.getUserInfo();
    this.context.shared.repoInfo = repoInfo;
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

    // 解析 GitHub URL 获取 owner 和 repo name
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
