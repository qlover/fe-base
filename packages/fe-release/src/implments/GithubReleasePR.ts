import {
  InitOptions,
  PullRequestInterface
} from '../interface/PullRequestInterface';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';
import ReleaseContext from '../interface/ReleaseContext';

export default class GithubReleasePR implements PullRequestInterface {
  private octokit?: Octokit;
  private options: InitOptions = {};

  constructor(context: ReleaseContext) {
    this.hasGithubToken(context);
  }

  hasGithubToken(context: ReleaseContext): boolean {
    const token =
      context.getEnv().get('GITHUB_TOKEN') || context.getEnv().get('PAT_TOKEN');

    if (!token) {
      throw new Error(
        'GITHUB_TOKEN or PAT_TOKEN environment variable is not set.'
      );
    }

    this.options.token = token;

    return true;
  }

  async init(options: InitOptions = {}): Promise<Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    const { token, repoName, authorName } = { ...this.options, ...options };
    if (!token) {
      throw new Error('Github token is not set');
    }

    this.options.repoName = repoName;
    this.options.authorName = authorName;

    const { Octokit } = await import('@octokit/rest');

    this.octokit = new Octokit({ auth: token });

    return this.octokit;
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
}
