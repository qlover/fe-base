import { ExecutorError } from '@qlover/fe-corekit/executor';
import { after } from 'next/server';
import { inject, injectable } from '@shared/container';
import {
  API_FEEDBACK_NOT_FOUND,
  API_FEEDBACK_SCREENSHOT_EMPTY,
  API_FEEDBACK_SCREENSHOT_SYNC_FAILED,
  API_FEEDBACK_SCREENSHOT_TOO_LARGE,
  API_FEEDBACK_SCREENSHOT_TYPE_UNSUPPORTED,
  API_FEEDBACK_SCREENSHOTS_REQUIRED,
  API_FEEDBACK_SCREENSHOTS_TOO_MANY
} from '@config/i18n-identifier/api';
import {
  FEEDBACK_SCREENSHOT_MAX_BYTES,
  FEEDBACK_SCREENSHOT_MAX_COUNT,
  type UserFeedbackAdminGithubIssueOkType,
  type UserFeedbackAdminListType,
  type UserFeedbackAdminStatusOkType,
  type UserFeedbackAdminSyncScreenshotsOkType,
  type UserFeedbackCreateBodyType,
  type UserFeedbackCreateOkType,
  type UserFeedbackListPublicType,
  type UserFeedbackScreenshotsOkType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { UserFeedbackRepository } from '@server/repositorys/UserFeedbackRepository';
import { GithubFeedbackIssueBundle } from '@server/services/feedback-github/GithubFeedbackIssueBundle';
import { RequestAuthUserIdService } from '@server/services/RequestAuthUserIdService';

export type FeedbackScreenshotUploadType = {
  readonly bytes: Buffer;
  readonly contentType: string;
  readonly fileName: string;
};

/**
 * 用户反馈业务编排（截图上传 + Admin 手动 GitHub Issue；不自动建 Issue）。
 */
@injectable()
export class UserFeedbackService {
  constructor(
    @inject(UserFeedbackRepository)
    protected readonly feedbackRepository: UserFeedbackRepository,
    @inject(RequestAuthUserIdService)
    protected readonly requestAuthUserId: RequestAuthUserIdService,
    @inject(GithubFeedbackIssueBundle)
    protected readonly issueBundle: GithubFeedbackIssueBundle
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
      throw new ExecutorError(API_FEEDBACK_NOT_FOUND);
    }
    return { ok: true, id: feedbackId, status: saved };
  }

  /**
   * 管理端手动创建 GitHub Issue；已有 Issue 时仍会触发截图同步。
   */
  public async createGithubIssueForAdmin(
    feedbackId: string
  ): Promise<UserFeedbackAdminGithubIssueOkType> {
    await this.issueBundle.sync.syncFeedback(feedbackId, { manual: true });
    const item = await this.feedbackRepository.findByIdAsAdmin(feedbackId);
    if (!item) {
      throw new ExecutorError(API_FEEDBACK_NOT_FOUND);
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
   * Admin 补挂截图到已有 Issue（或先确保 Issue 存在再挂图）。
   */
  public async syncScreenshotsForAdmin(
    feedbackId: string
  ): Promise<UserFeedbackAdminSyncScreenshotsOkType> {
    const existing = await this.feedbackRepository.findByIdAsAdmin(feedbackId);
    if (!existing) {
      throw new ExecutorError(API_FEEDBACK_NOT_FOUND);
    }
    const before =
      await this.feedbackRepository.findScreenshotSyncStateAsAdmin(feedbackId);
    if (before && before.paths.length > 0) {
      await this.feedbackRepository.forceScreenshotCountAsAdmin(feedbackId, 0);
    }
    let postedCount = await this.issueBundle.screenshots.syncScreenshots(
      feedbackId,
      { manual: true }
    );
    const afterFirst =
      await this.feedbackRepository.findScreenshotSyncStateAsAdmin(feedbackId);
    if (afterFirst && afterFirst.paths.length > afterFirst.postedCount) {
      await this.issueBundle.sync.syncFeedback(feedbackId, { manual: true });
      postedCount += await this.issueBundle.screenshots.syncScreenshots(
        feedbackId,
        { manual: true }
      );
    }
    postedCount +=
      await this.issueBundle.screenshots.ensureGithubScreenshotComments(
        feedbackId,
        { manual: true }
      );
    const item = await this.feedbackRepository.findByIdAsAdmin(feedbackId);
    if (!item) {
      throw new ExecutorError(API_FEEDBACK_NOT_FOUND);
    }
    const afterAll =
      await this.feedbackRepository.findScreenshotSyncStateAsAdmin(feedbackId);
    const screenshotError =
      typeof item.githubSyncError === 'string' &&
      item.githubSyncError.startsWith('screenshot:');
    if (
      !afterAll ||
      afterAll.paths.length > afterAll.postedCount ||
      screenshotError ||
      (postedCount === 0 && afterAll.paths.length > 0) ||
      (postedCount === 0 &&
        afterAll.paths.length === 0 &&
        afterAll.githubUrls.length === 0)
    ) {
      throw new ExecutorError(API_FEEDBACK_SCREENSHOT_SYNC_FAILED);
    }
    return {
      ok: true,
      id: item.id,
      postedCount,
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
      throw new ExecutorError(API_FEEDBACK_SCREENSHOTS_REQUIRED);
    }
    if (files.length > FEEDBACK_SCREENSHOT_MAX_COUNT) {
      throw new ExecutorError(API_FEEDBACK_SCREENSHOTS_TOO_MANY);
    }
    const ownedId = await this.feedbackRepository.findOwnedId(feedbackId);
    if (ownedId === null) {
      throw new ExecutorError(API_FEEDBACK_NOT_FOUND);
    }
    const userId = await this.requestAuthUserId.requireUserId();
    const paths: string[] = [];
    for (const [index, file] of files.entries()) {
      if (file.bytes.byteLength === 0) {
        throw new ExecutorError(API_FEEDBACK_SCREENSHOT_EMPTY);
      }
      if (file.bytes.byteLength > FEEDBACK_SCREENSHOT_MAX_BYTES) {
        throw new ExecutorError(API_FEEDBACK_SCREENSHOT_TOO_LARGE);
      }
      if (!isAllowedImageType(file.contentType)) {
        throw new ExecutorError(API_FEEDBACK_SCREENSHOT_TYPE_UNSUPPORTED);
      }
      const ext = extensionForContentType(file.contentType);
      const objectPath = this.feedbackRepository.buildScreenshotObjectPath(
        userId,
        feedbackId,
        index,
        ext
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
    after(() => {
      void this.syncScreenshotsAfterAttach(feedbackId);
    });
    return { ok: true, screenshotPaths: [...saved] };
  }

  /**
   * 截图入库后：仅尝试挂到已有 Issue；无 Issue 时不自动创建（Admin 手动）。
   */
  protected async syncScreenshotsAfterAttach(
    feedbackId: string
  ): Promise<void> {
    await this.issueBundle.screenshots.syncScreenshots(feedbackId);
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

function extensionForContentType(contentType: string): string {
  if (contentType === 'image/png') {
    return 'png';
  }
  if (contentType === 'image/webp') {
    return 'webp';
  }
  return 'jpg';
}
