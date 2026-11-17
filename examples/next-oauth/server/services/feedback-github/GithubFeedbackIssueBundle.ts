import {
  createGithubWebhookVerifier,
  type GithubAppAuthConfigType,
  type IssueWebhookVerifierInterface,
  type IssueWebhookVerifyResultType
} from '@brain-toolkit/issue-forge';
import {
  createGithubFeedbackIssueBundle,
  type FeedbackIssueContentResolveType,
  type FeedbackIssueHostInterface,
  type FeedbackIssueScreenshotSyncEngine,
  type FeedbackIssueStatusSyncEngine,
  type FeedbackIssueStatusType,
  type FeedbackIssueSyncEngine,
  type FeedbackIssueSyncFieldsType,
  type FeedbackIssueSyncOptionsType,
  type FeedbackScreenshotSyncStateType,
  type GithubFeedbackIssueBundleType
} from '@brain-toolkit/issue-forge/feedback';
import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type {
  FeedbackClientContextType,
  UserFeedbackAdminItemType,
  UserFeedbackGithubSyncStatusType,
  UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { GithubForgeAppClient } from '@server/adapters/GithubForgeAppClient';
import { FeUsersRepository } from '@server/repositorys/FeUsersRepository';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import type { LoggerInterface } from '@qlover/logger';

const REPO_PATTERN = /^([A-Za-z0-9-]+)\/([A-Za-z0-9._-]+)$/;
const NUMERIC_ID_PATTERN = /^\d+$/;
const EMPTY = '-';
const ADMIN_PATH = '/zh/admin/feedback';

const FEEDBACK_ISSUE_DEFAULT_TEMPLATE = `---
name: 用户反馈
about: next-oauth 用户反馈（后台手动创建 Issue 也使用本模板，占位符由服务端替换）
title: "[反馈][{{category}}] {{summary}}"
labels: feedback
---

> 来自 next-oauth 用户反馈 · 反馈 ID：\`{{feedback_id}}\` · [后台查看]({{admin_url}})

### 提交人

| 项目 | 值 |
| --- | --- |
| 昵称 | {{display_name}} |
| 邮箱 | {{email}} |
| 手机 | {{phone}} |
| 提交时间 | {{created_at}} |

### 描述

{{body}}

### 设备与环境

{{environment}}

### 页面

{{page_url}}

### 截图

如有截图，会以评论形式追加在下方。

{{user_agent}}
` as const;

type GithubFeedbackRawConfigType = {
  readonly appId: string;
  readonly installationId: string;
  readonly privateKey: string;
  readonly repo: string;
};

/**
 * 反馈→Issue 唯一 DI 入口：Host（含模板变量）+ 模板 + webhook 验签。
 */
@injectable()
export class GithubFeedbackIssueBundle
  implements IssueWebhookVerifierInterface
{
  public readonly sync: FeedbackIssueSyncEngine;
  public readonly screenshots: FeedbackIssueScreenshotSyncEngine;
  public readonly status: FeedbackIssueStatusSyncEngine;

  constructor(
    @inject(UserFeedbackRepository)
    feedbackRepository: UserFeedbackRepository,
    @inject(FeUsersRepository)
    usersRepository: FeUsersRepository,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService,
    @inject(GithubForgeAppClient)
    githubClient: GithubForgeAppClient,
    @inject(MemoryKvCacheService)
    cache: MemoryKvCacheService,
    @inject(I.AppConfig)
    serverConfig: SeedServerConfigInterface,
    @inject(I.Logger)
    logger: LoggerInterface
  ) {
    const bundle: GithubFeedbackIssueBundleType =
      createGithubFeedbackIssueBundle({
        host: new OauthFeedbackIssueHost(
          feedbackRepository,
          usersRepository,
          siteSettings,
          serverConfig.siteUrl
        ),
        client: githubClient.client,
        cache,
        logger,
        defaultTemplate: FEEDBACK_ISSUE_DEFAULT_TEMPLATE
      });
    this.sync = bundle.sync;
    this.screenshots = bundle.screenshots;
    this.status = bundle.status;
  }

  /**
   * @override
   */
  public async verify(
    rawBody: string,
    signatureHeader: string | null
  ): Promise<IssueWebhookVerifyResultType> {
    const secret = (
      await this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET
      )
    ).trim();
    return createGithubWebhookVerifier(secret).verify(rawBody, signatureHeader);
  }
}

class OauthFeedbackIssueHost implements FeedbackIssueHostInterface {
  constructor(
    protected readonly feedbackRepository: UserFeedbackRepository,
    protected readonly usersRepository: FeUsersRepository,
    protected readonly siteSettings: SiteSettingsService,
    protected readonly siteUrl: string
  ) {}

  /**
   * @override
   */
  public async resolveIssueContent(
    feedbackId: string
  ): Promise<FeedbackIssueContentResolveType | null> {
    const item = await this.feedbackRepository.findByIdAsAdmin(feedbackId);
    if (!item) {
      return null;
    }
    const contact = await this.resolveContact(item.userId);
    return {
      issueNumber: item.githubIssueNumber,
      variables: this.buildVariables(item, contact),
      labels: [`type:${item.category}`]
    };
  }

  /**
   * @override
   */
  public async updateSync(
    feedbackId: string,
    fields: FeedbackIssueSyncFieldsType
  ): Promise<void> {
    await this.feedbackRepository.updateGithubSyncAsAdmin(feedbackId, {
      status: fields.status as UserFeedbackGithubSyncStatusType,
      issueNumber: fields.issueNumber,
      issueUrl: fields.issueUrl,
      error: fields.error
    });
  }

  /**
   * @override
   */
  public async findScreenshotState(
    feedbackId: string
  ): Promise<FeedbackScreenshotSyncStateType | null> {
    return this.feedbackRepository.findScreenshotSyncStateAsAdmin(feedbackId);
  }

  /**
   * @override
   */
  public async compareAndSetScreenshotCount(
    feedbackId: string,
    from: number,
    to: number
  ): Promise<boolean> {
    return this.feedbackRepository.compareAndSetScreenshotCountAsAdmin(
      feedbackId,
      from,
      to
    );
  }

  /**
   * @override
   */
  public async downloadScreenshot(objectPath: string): Promise<Buffer> {
    return this.feedbackRepository.downloadScreenshotObject(objectPath);
  }

  /**
   * @override
   */
  public async releaseLocalScreenshotsAfterGithub(
    feedbackId: string,
    githubUrls: readonly string[],
    localPaths: readonly string[]
  ): Promise<void> {
    await this.feedbackRepository.releaseLocalScreenshotsAfterGithubAsAdmin(
      feedbackId,
      githubUrls,
      localPaths
    );
  }

  /**
   * @override
   */
  public formatScreenshotComment(
    imageUrls: readonly string[],
    startIndex: number
  ): string {
    const lines = imageUrls.map((url, i) => {
      const n = startIndex + i + 1;
      return `![截图 ${String(n)}](${url})`;
    });
    return ['### 截图', '', ...lines].join('\n');
  }

  /**
   * @override
   */
  public async updateStatusByIssueNumber(
    issueNumber: number,
    status: FeedbackIssueStatusType
  ): Promise<number> {
    return this.feedbackRepository.updateStatusByIssueNumberAsAdmin(
      issueNumber,
      status as UserFeedbackStatusType
    );
  }

  /**
   * @override
   */
  public async resolveForgeAuth(
    options: FeedbackIssueSyncOptionsType = {}
  ): Promise<GithubAppAuthConfigType | null> {
    if (!options.manual) {
      const enabled = await this.siteSettings.getBoolean(
        FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED
      );
      if (!enabled) {
        return null;
      }
    }

    const raw = await this.readRaw();
    const repoMatch = REPO_PATTERN.exec(raw.repo);
    if (!this.isRawValid(raw) || !repoMatch) {
      return null;
    }

    return {
      appId: raw.appId,
      installationId: raw.installationId,
      privateKey: raw.privateKey,
      owner: repoMatch[1] ?? '',
      repo: repoMatch[2] ?? ''
    };
  }

  /**
   * @override
   */
  public async getFeedbackRepoFullName(): Promise<string> {
    const configured = await this.siteSettings.getString(
      FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO
    );
    return configured.trim();
  }

  protected buildVariables(
    item: UserFeedbackAdminItemType,
    contact: { readonly email: string | null; readonly phone: string | null }
  ): Record<string, string> {
    const summary = Array.from(item.body.replace(/\s+/g, ' ').trim())
      .slice(0, 60)
      .join('');
    const root = this.siteUrl.replace(/\/$/, '');
    return {
      feedback_id: item.id,
      category: item.category,
      summary: summary || item.category,
      display_name: item.displayName.trim() || EMPTY,
      email: contact.email ?? EMPTY,
      phone: contact.phone ?? EMPTY,
      created_at: item.createdAt,
      body: this.sanitizeMentions(item.body),
      environment: this.formatEnvironment(item.clientContext),
      page_url: item.pageUrl?.trim() || EMPTY,
      user_agent: item.userAgent
        ? `\`${this.sanitizeMentions(item.userAgent)}\``
        : '',
      admin_url: root ? `${root}${ADMIN_PATH}` : ADMIN_PATH
    };
  }

  protected formatEnvironment(ctx: FeedbackClientContextType | null): string {
    if (!ctx) {
      return EMPTY;
    }
    const lines: string[] = [
      `- language: ${ctx.language || EMPTY}`,
      `- time_zone: ${ctx.timeZone || EMPTY}`,
      `- reported_at: ${ctx.reportedAt || EMPTY}`
    ];
    if (ctx.userAgent) {
      lines.push(`- user_agent: ${this.sanitizeMentions(ctx.userAgent)}`);
    }
    return lines.join('\n');
  }

  protected async resolveContact(
    userId: string
  ): Promise<{ readonly email: string | null; readonly phone: string | null }> {
    try {
      const row = await this.usersRepository.findById(userId);
      if (!row) {
        return { email: null, phone: null };
      }
      return {
        email: row.email,
        phone: row.phone
          ? /^\d+$/.test(row.phone)
            ? `+${row.phone}`
            : row.phone
          : null
      };
    } catch {
      return { email: null, phone: null };
    }
  }

  protected sanitizeMentions(text: string): string {
    return text.replace(/@/g, '@\u200B');
  }

  protected async readRaw(): Promise<GithubFeedbackRawConfigType> {
    const [appId, installationId, privateKey, repo] = await Promise.all([
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.GITHUB_APP_ID),
      this.siteSettings.getString(
        FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID
      ),
      this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY
      ),
      this.siteSettings.getString(FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO)
    ]);
    return {
      appId: appId.trim(),
      installationId: installationId.trim(),
      privateKey,
      repo: repo.trim()
    };
  }

  protected isRawValid(raw: GithubFeedbackRawConfigType): boolean {
    return (
      NUMERIC_ID_PATTERN.test(raw.appId) &&
      NUMERIC_ID_PATTERN.test(raw.installationId) &&
      raw.privateKey.includes('PRIVATE KEY') &&
      REPO_PATTERN.test(raw.repo)
    );
  }
}
