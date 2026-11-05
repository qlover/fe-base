/**
 * GitHub App 反馈同步配置（站点设置解析而来；私钥已解密）。
 */
export type GithubFeedbackConfigType = {
  readonly appId: string;
  readonly installationId: string;
  readonly privateKey: string;
  readonly owner: string;
  readonly repo: string;
};

export type GithubIssueCreateInputType = {
  readonly title: string;
  readonly body: string;
  readonly labels: readonly string[];
};

export type GithubIssueCreatedType = {
  readonly number: number;
  readonly url: string;
};

/**
 * GitHub Issue 创建网关（GitHub App installation 身份）。
 */
export interface GithubIssueGatewayInterface {
  /**
   * 在目标仓库创建 Issue。
   */
  createIssue(
    config: GithubFeedbackConfigType,
    input: GithubIssueCreateInputType
  ): Promise<GithubIssueCreatedType>;
}
