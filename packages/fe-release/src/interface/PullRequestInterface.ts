export interface InitOptions {
  token?: string;
  repoName?: string;
  authorName?: string;
}

// TODO: fix type
export interface PullRequestInterface {
  init(params: InitOptions): Promise<unknown>;

  mergePullRequest(params: unknown): Promise<unknown>;

  /**
   *
   * @param params
   */
  getPullRequest(params: { pull_number: number }): Promise<unknown>;

  deleteBranch(params: unknown): Promise<unknown>;
  addPullRequestLabels(params: unknown): Promise<unknown>;
  createPullRequestLabel(params: unknown): Promise<unknown>;

  createPullRequest(params: unknown): Promise<{
    /**
     * pr number
     */
    number: number;
    [key: string]: unknown;
  }>;
}
