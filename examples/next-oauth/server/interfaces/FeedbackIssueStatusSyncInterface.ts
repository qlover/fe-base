import type { GithubIssueEventType } from '@schemas/GithubWebhookSchema';

/**
 * Issue 事件 → 反馈状态回写。
 */
export interface FeedbackIssueStatusSyncInterface {
  /**
   * @returns 实际更新的反馈条数
   */
  applyIssueEvent(event: GithubIssueEventType): Promise<number>;
}
