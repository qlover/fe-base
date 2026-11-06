/**
 * GitHub API 调用失败（换取 installation token 或创建 Issue）。
 */
export class GithubIssueError extends Error {
  public readonly code = 'GITHUB_ISSUE_FAILED' as const;
  /** HTTP 状态码；网络错误等无响应时为 null */
  public readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'GithubIssueError';
    this.status = status;
  }
}
