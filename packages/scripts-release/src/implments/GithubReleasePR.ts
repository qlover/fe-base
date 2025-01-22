import {
  InitOptions,
  PullRequestInterface
} from '../interface/PullRequestInterface';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import ReleaseContext from '../interface/ReleaseContext';
import isString from 'lodash/isString';

export default class GithubReleasePR implements PullRequestInterface {
  private octokit?: Octokit;

  constructor(
    private context: ReleaseContext,
    private options: InitOptions = {}
  ) {}

  async init({ token }: InitOptions): Promise<Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    if (!token) {
      throw new Error('Github token is not set');
    }

    const { repoName, authorName } = await this.getUserInfo();
    this.options.repoName = repoName;
    this.options.authorName = authorName;

    const { Octokit } = await import('@octokit/rest');

    const octokit = new Octokit({ auth: token });

    this.octokit = octokit;

    return octokit;
  }

  getOctokit(): Octokit {
    if (!this.octokit) {
      throw new Error('Octokit is not initialized');
    }

    return this.octokit;
  }

  mergePullRequest(
    params: RestEndpointMethodTypes['pulls']['merge']['parameters']
  ): Promise<RestEndpointMethodTypes['pulls']['merge']['response']> {
    return this.getOctokit().rest.pulls.merge({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });
  }

  getPullRequest(
    params: RestEndpointMethodTypes['pulls']['get']['parameters']
  ): Promise<RestEndpointMethodTypes['pulls']['get']['response']> {
    return this.getOctokit().rest.pulls.get({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });
  }

  deleteBranch(
    params: RestEndpointMethodTypes['git']['deleteRef']['parameters']
  ): Promise<RestEndpointMethodTypes['git']['deleteRef']['response']> {
    return this.getOctokit().rest.git.deleteRef({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });
  }

  addPullRequestLabels(
    params: RestEndpointMethodTypes['issues']['addLabels']['parameters']
  ): Promise<RestEndpointMethodTypes['issues']['addLabels']['response']> {
    return this.getOctokit().rest.issues.addLabels({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });
  }

  async createPullRequestLabel(
    params: RestEndpointMethodTypes['issues']['createLabel']['parameters']
  ): Promise<RestEndpointMethodTypes['issues']['createLabel']['response']> {
    const response = await this.getOctokit().rest.issues.createLabel({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });

    return response;
  }

  async createPullRequest(
    params: RestEndpointMethodTypes['pulls']['create']['parameters']
  ): Promise<{
    number: number;
    [key: string]: unknown;
  }> {
    const response = await this.getOctokit().rest.pulls.create({
      ...params,
      owner: params.owner || this.options.authorName || '',
      repo: params.repo || this.options.repoName || ''
    });

    return {
      ...response.data,
      number: response.data.number
    };
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
  async getUserInfo(): Promise<{
    repoName: string;
    authorName: string;
  }> {
    // 获取 git remote origin url
    let repoUrl: string;
    try {
      repoUrl = (
        await this.context.shell.exec('git config --get remote.origin.url')
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
  private isValidString(value: unknown): value is string {
    return !!value && isString(value);
  }
}
