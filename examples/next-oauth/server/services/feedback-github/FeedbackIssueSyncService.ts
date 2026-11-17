import { inject, injectable } from '@shared/container';
import {
  UserFeedbackGithubSyncStatus,
  type UserFeedbackGithubSyncStatusType
} from '@schemas/UserFeedbackSchema';
import { GithubFeedbackIssueBundle } from './GithubFeedbackIssueBundle';

/**
 * 单条反馈 → GitHub Issue 同步（委托 issue-forge Bundle）。
 *
 * 已同步过（有 issue 号）不会重复创建，但仍会同步截图。
 * 自动同步入口保留：{@link syncFeedback}（`manual: false`），模板默认不在提交时调用。
 */
@injectable()
export class FeedbackIssueSyncService {
  constructor(
    @inject(GithubFeedbackIssueBundle)
    protected readonly issueBundle: GithubFeedbackIssueBundle
  ) {}

  /**
   * @param options.manual - 管理员手动：忽略自动同步开关，只要求 App 配置完整
   */
  public async syncFeedback(
    feedbackId: string,
    options: { readonly manual?: boolean } = {}
  ): Promise<UserFeedbackGithubSyncStatusType> {
    const status = await this.issueBundle.sync.syncFeedback(feedbackId, {
      manual: options.manual === true
    });
    if (status === UserFeedbackGithubSyncStatus.synced) {
      return UserFeedbackGithubSyncStatus.synced;
    }
    if (status === UserFeedbackGithubSyncStatus.failed) {
      return UserFeedbackGithubSyncStatus.failed;
    }
    if (status === UserFeedbackGithubSyncStatus.pending) {
      return UserFeedbackGithubSyncStatus.pending;
    }
    return UserFeedbackGithubSyncStatus.skipped;
  }
}
