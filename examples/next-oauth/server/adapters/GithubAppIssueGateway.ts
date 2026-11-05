import { inject, injectable } from '@shared/container';
import { GithubAppClient } from '@server/adapters/GithubAppClient';
import { GithubIssueError } from '@server/errors/GithubIssueError';
import type {
  GithubFeedbackConfigType,
  GithubIssueCreatedType,
  GithubIssueCreateInputType,
  GithubIssueGatewayInterface
} from '@server/interfaces/GithubIssueGatewayInterface';

/**
 * 以 GitHub App installation 身份创建 Issue；422 时去掉标签重试一次。
 */
@injectable()
export class GithubAppIssueGateway implements GithubIssueGatewayInterface {
  constructor(
    @inject(GithubAppClient)
    protected readonly client: GithubAppClient
  ) {}

  public async createIssue(
    config: GithubFeedbackConfigType,
    input: GithubIssueCreateInputType
  ): Promise<GithubIssueCreatedType> {
    const first = await this.postIssue(config, input, input.labels);
    if (first.ok) {
      return this.readCreated(first);
    }
    if (first.status === 422 && input.labels.length > 0) {
      const retry = await this.postIssue(config, input, []);
      if (retry.ok) {
        return this.readCreated(retry);
      }
      throw await this.client.toError('create issue', retry);
    }
    throw await this.client.toError('create issue', first);
  }

  protected postIssue(
    config: GithubFeedbackConfigType,
    input: GithubIssueCreateInputType,
    labels: readonly string[]
  ): Promise<Response> {
    return this.client.request(
      config,
      `/repos/${encodeURIComponent(config.owner)}/${encodeURIComponent(config.repo)}/issues`,
      {
        method: 'POST',
        body: {
          title: input.title,
          body: input.body,
          ...(labels.length > 0 ? { labels: [...labels] } : {})
        }
      }
    );
  }

  protected async readCreated(
    response: Response
  ): Promise<GithubIssueCreatedType> {
    const json = (await response.json()) as {
      readonly number?: unknown;
      readonly html_url?: unknown;
    };
    if (typeof json.number !== 'number' || typeof json.html_url !== 'string') {
      throw new GithubIssueError(
        'create issue: unexpected response',
        response.status
      );
    }
    return { number: json.number, url: json.html_url };
  }
}
