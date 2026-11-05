import { inject, injectable } from '@shared/container';
import {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  FEEDBACK_SCREENSHOT_MAX_COUNT,
  type UserFeedbackAdminGithubIssueOkType,
  type UserFeedbackAdminListType,
  type UserFeedbackAdminStatusOkType,
  type UserFeedbackCreateBodyType,
  type UserFeedbackCreateOkType,
  type UserFeedbackListPublicType,
  type UserFeedbackScreenshotsOkType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import { RequestAuthUserIdService } from '@server/services/RequestAuthUserIdService';
import { FeedbackIssueSyncService } from '@server/services/feedback-github/FeedbackIssueSyncService';

export type FeedbackScreenshotUploadType = {
  readonly bytes: Buffer;
  readonly contentType: string;
  readonly fileName: string;
};

/**
 * 用户反馈业务编排（截图上传 + 手动 GitHub Issue；不自动建 Issue）。
 */
@injectable()
export class UserFeedbackService {
  constructor(
    @inject(UserFeedbackRepository)
    protected readonly feedbackRepository: UserFeedbackRepository,
    @inject(RequestAuthUserIdService)
    protected readonly requestAuthUserId: RequestAuthUserIdService,
    @inject(FeedbackIssueSyncService)
    protected readonly issueSyncService: FeedbackIssueSyncService
  ) {}

  public async createForCurrentUser(
    body: UserFeedbackCreateBodyType,
    meta: { readonly userAgent: string | null }
  ): Promise<UserFeedbackCreateOkType> {
    const item = await this.feedbackRepository.insertForCurrentUser({
      category: body.category,
      body: body.body,
      pageUrl: body.pageUrl?.trim() ? body.pageUrl.trim() : null,
      userAgent: meta.userAgent,
      clientContext: body.clientContext ?? null
    });
    return { ok: true, item };
  }

  public async listForCurrentUser(): Promise<UserFeedbackListPublicType> {
    const items = await this.feedbackRepository.listForCurrentUser();
    return { items };
  }

  public async listAllForAdmin(): Promise<UserFeedbackAdminListType> {
    const items = await this.feedbackRepository.listAllForAdmin(100);
    return { items };
  }

  public async updateStatusForAdmin(
    feedbackId: string,
    status: UserFeedbackStatusType
  ): Promise<UserFeedbackAdminStatusOkType> {
    const saved = await this.feedbackRepository.updateStatusAsAdmin(
      feedbackId,
      status
    );
    if (saved === null) {
      throw new Error('feedback not found');
    }
    return { ok: true, id: feedbackId, status: saved };
  }

  /**
   * 管理端手动创建 GitHub Issue；已有 Issue 时直接返回现状。
   * 自动同步入口见 {@link FeedbackIssueSyncService.syncFeedback}（本服务不在提交时调用）。
   */
  public async createGithubIssueForAdmin(
    feedbackId: string
  ): Promise<UserFeedbackAdminGithubIssueOkType> {
    await this.issueSyncService.syncFeedback(feedbackId, { manual: true });
    const item = await this.feedbackRepository.findByIdAsAdmin(feedbackId);
    if (!item) {
      throw new Error('feedback not found');
    }
    return {
      ok: true,
      id: item.id,
      githubSyncStatus: item.githubSyncStatus,
      githubIssueNumber: item.githubIssueNumber,
      githubIssueUrl: item.githubIssueUrl,
      githubSyncError: item.githubSyncError
    };
  }

  /**
   * 当前用户为自己的反馈追加截图（最多 3 张；覆盖写入路径列表）。
   */
  public async attachScreenshotsForCurrentUser(
    feedbackId: string,
    files: readonly FeedbackScreenshotUploadType[]
  ): Promise<UserFeedbackScreenshotsOkType> {
    if (files.length === 0) {
      throw new Error('screenshots required');
    }
    if (files.length > FEEDBACK_SCREENSHOT_MAX_COUNT) {
      throw new Error('too many screenshots');
    }
    const ownedId = await this.feedbackRepository.findOwnedId(feedbackId);
    if (ownedId === null) {
      throw new Error('feedback not found');
    }
    const userId = await this.requestAuthUserId.requireUserId();
    const paths: string[] = [];
    for (const [index, file] of files.entries()) {
      if (file.bytes.byteLength === 0) {
        throw new Error('empty screenshot');
      }
      if (file.bytes.byteLength > FEEDBACK_SCREENSHOT_MAX_BYTES) {
        throw new Error('screenshot too large');
      }
      if (!isAllowedImageType(file.contentType)) {
        throw new Error('unsupported screenshot type');
      }
      const objectPath = this.feedbackRepository.buildScreenshotObjectPath(
        userId,
        feedbackId,
        index
      );
      await this.feedbackRepository.uploadScreenshotObject(
        objectPath,
        file.bytes,
        file.contentType.startsWith('image/') ? file.contentType : 'image/jpeg'
      );
      paths.push(objectPath);
    }
    const saved = await this.feedbackRepository.updateScreenshotPathsAsAdmin(
      feedbackId,
      userId,
      paths
    );
    return { ok: true, screenshotPaths: [...saved] };
  }
}

function isAllowedImageType(contentType: string): boolean {
  return (
    contentType === 'image/jpeg' ||
    contentType === 'image/png' ||
    contentType === 'image/webp' ||
    contentType === 'image/jpg'
  );
}
