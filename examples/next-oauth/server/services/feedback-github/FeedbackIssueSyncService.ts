import { inject, injectable } from '@shared/container';
import { I } from '@config/ioc-identifiter';
import {
  UserFeedbackGithubSyncStatus,
  type UserFeedbackGithubSyncStatusType
} from '@schemas/UserFeedbackSchema';
import type { GithubIssueGatewayInterface } from '@server/interfaces/GithubIssueGatewayInterface';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import {
  FeedbackIssueContentBuilder,
  type FeedbackReporterContactType
} from './FeedbackIssueContentBuilder';
import { GithubFeedbackConfigResolver } from './GithubFeedbackConfigResolver';
import type { LoggerInterface } from '@qlover/logger';

const EMPTY_CONTACT: FeedbackReporterContactType = Object.freeze({
  email: null,
  phone: null
});

/**
 * 单条反馈 → GitHub Issue 同步。
 *
 * 已同步过（有 issue 号）不会重复创建。手动触发时忽略「自动同步」开关。
 * 自动同步入口保留：{@link syncFeedback}（`manual: false`），模板默认不在提交时调用。
 */
@injectable()
export class FeedbackIssueSyncService {
  constructor(
    @inject(UserFeedbackRepository)
    protected readonly repository: UserFeedbackRepository,
    @inject(FeUsersRepository)
    protected readonly usersRepository: FeUsersRepository,
    @inject(GithubFeedbackConfigResolver)
    protected readonly configResolver: GithubFeedbackConfigResolver,
    @inject(FeedbackIssueContentBuilder)
    protected readonly contentBuilder: FeedbackIssueContentBuilder,
    @inject(I.GithubIssueGatewayInterface)
    protected readonly gateway: GithubIssueGatewayInterface,
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

  /**
   * @param options.manual - 管理员手动：忽略自动同步开关，只要求 App 配置完整
   */
  public async syncFeedback(
    feedbackId: string,
    options: { readonly manual?: boolean } = {}
  ): Promise<UserFeedbackGithubSyncStatusType> {
    const item = await this.repository.findByIdAsAdmin(feedbackId);
    if (!item) {
      return UserFeedbackGithubSyncStatus.skipped;
    }
    if (item.githubIssueNumber !== null) {
      return UserFeedbackGithubSyncStatus.synced;
    }

    const config = await this.configResolver.resolve({
      ignoreEnabled: options.manual === true
    });
    if (!config) {
      await this.repository.updateGithubSyncAsAdmin(feedbackId, {
        status: UserFeedbackGithubSyncStatus.skipped,
        issueNumber: null,
        issueUrl: null,
        error: null
      });
      return UserFeedbackGithubSyncStatus.skipped;
    }

    try {
      const contact = await this.resolveContact(item.userId);
      const created = await this.gateway.createIssue(
        config,
        this.contentBuilder.build(item, contact)
      );
      await this.repository.updateGithubSyncAsAdmin(feedbackId, {
        status: UserFeedbackGithubSyncStatus.synced,
        issueNumber: created.number,
        issueUrl: created.url,
        error: null
      });
      return UserFeedbackGithubSyncStatus.synced;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error('feedback github sync failed', {
        feedbackId,
        message
      });
      await this.repository.updateGithubSyncAsAdmin(feedbackId, {
        status: UserFeedbackGithubSyncStatus.failed,
        issueNumber: null,
        issueUrl: null,
        error: message
      });
      return UserFeedbackGithubSyncStatus.failed;
    }
  }

  protected async resolveContact(
    userId: string
  ): Promise<FeedbackReporterContactType> {
    try {
      const row = await this.usersRepository.findById(userId);
      if (!row) {
        return EMPTY_CONTACT;
      }
      return {
        email: row.email,
        phone: row.phone
          ? /^\d+$/.test(row.phone)
            ? `+${row.phone}`
            : row.phone
          : null
      };
    } catch (error) {
      this.logger.warn('feedback reporter contact lookup failed', {
        userId,
        message: error instanceof Error ? error.message : String(error)
      });
      return EMPTY_CONTACT;
    }
  }
}
