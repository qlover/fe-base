import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import type { GithubIssueEventType } from '@schemas/GithubWebhookSchema';
import type { FeedbackIssueStatusSyncInterface } from '@server/interfaces/FeedbackIssueStatusSyncInterface';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import { FeedbackIssueStatusResolver } from './FeedbackIssueStatusResolver';
import type { LoggerInterface } from '@qlover/logger';

/**
 * Issue 事件 → 反馈状态：只处理配置仓库的 Issue。
 */
@injectable()
export class FeedbackIssueStatusSyncService
  implements FeedbackIssueStatusSyncInterface
{
  constructor(
    @inject(UserFeedbackRepository)
    protected readonly repository: UserFeedbackRepository,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(FeedbackIssueStatusResolver)
    protected readonly statusResolver: FeedbackIssueStatusResolver,
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

  public async applyIssueEvent(event: GithubIssueEventType): Promise<number> {
    const status = this.statusResolver.resolve(event);
    if (status === null) {
      return 0;
    }
    if (!(await this.isFeedbackRepo(event.repository.full_name))) {
      this.logger.warn('feedback status sync skipped: repo mismatch', {
        issueNumber: event.issue.number,
        repo: event.repository.full_name
      });
      return 0;
    }
    const updated = await this.repository.updateStatusByIssueNumberAsAdmin(
      event.issue.number,
      status
    );
    if (updated > 0) {
      this.logger.info('feedback status synced from github issue', {
        issueNumber: event.issue.number,
        action: event.action,
        status,
        updated
      });
    }
    return updated;
  }

  protected async isFeedbackRepo(fullName: string): Promise<boolean> {
    const configured = await this.siteSettings.getString(
      FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO
    );
    return configured.trim().toLowerCase() === fullName.trim().toLowerCase();
  }
}
