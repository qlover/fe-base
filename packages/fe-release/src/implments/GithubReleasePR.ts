import {
  InitOptions,
  PullRequestInterface
} from '../interface/PullRequestInterface';
import { Octokit, RestEndpointMethodTypes } from '@octokit/rest';

export default class GithubReleasePR implements PullRequestInterface {
  private octokit?: Octokit;

  constructor(private options: InitOptions = {}) {}

  async init({ token, repoName, authorName }: InitOptions): Promise<Octokit> {
    if (this.octokit) {
      return this.octokit;
    }

    if (!token) {
      throw new Error('Github token is not set');
    }

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
}
