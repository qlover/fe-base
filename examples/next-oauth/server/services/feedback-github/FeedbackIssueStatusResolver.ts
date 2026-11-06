import { injectable } from '@shared/container';
import {
  GithubIssueStateReason,
  type GithubIssueEventType
} from '@schemas/GithubWebhookSchema';
import {
  UserFeedbackStatus,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';

const ISSUE_ACTION_CLOSED = 'closed';
const ISSUE_ACTION_REOPENED = 'reopened';

/**
 * Issue 动作 + 关闭原因 → 反馈状态。
 *
 * - completed / 缺省 → resolved
 * - not_planned / duplicate → closed
 * - reopened → open
 */
@injectable()
export class FeedbackIssueStatusResolver {
  public resolve(event: GithubIssueEventType): UserFeedbackStatusType | null {
    if (event.action === ISSUE_ACTION_REOPENED) {
      return UserFeedbackStatus.open;
    }
    if (event.action !== ISSUE_ACTION_CLOSED) {
      return null;
    }
    const reason = event.issue.state_reason ?? null;
    if (
      reason === GithubIssueStateReason.notPlanned ||
      reason === GithubIssueStateReason.duplicate
    ) {
      return UserFeedbackStatus.closed;
    }
    return UserFeedbackStatus.resolved;
  }
}
