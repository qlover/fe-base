import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { API_REQUEST_BODY_EMPTY } from '@config/i18n-identifier/api';
import {
  userFeedbackAdminGithubIssueBodySchema,
  userFeedbackAdminStatusPatchSchema,
  userFeedbackCreateBodySchema,
  type UserFeedbackAdminGithubIssueOkType,
  type UserFeedbackAdminListType,
  type UserFeedbackAdminStatusOkType,
  type UserFeedbackCreateOkType,
  type UserFeedbackListPublicType,
  type UserFeedbackScreenshotsOkType
} from '@schemas/UserFeedbackSchema';
import {
  UserFeedbackService,
  type FeedbackScreenshotUploadType
} from '@server/services/UserFeedbackService';

/**
 * 用户反馈：入参 Zod，委托 Service。
 */
@injectable()
export class UserFeedbackController {
  constructor(
    @inject(UserFeedbackService)
    protected readonly feedbackService: UserFeedbackService
  ) {}

  public async create(
    body: unknown,
    meta: { readonly userAgent: string | null }
  ): Promise<UserFeedbackCreateOkType> {
    const parsed = userFeedbackCreateBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_REQUEST_BODY_EMPTY, 'Invalid feedback body');
    }
    return this.feedbackService.createForCurrentUser(parsed.data, meta);
  }

  public async listMine(): Promise<UserFeedbackListPublicType> {
    return this.feedbackService.listForCurrentUser();
  }

  public async listAdmin(): Promise<UserFeedbackAdminListType> {
    return this.feedbackService.listAllForAdmin();
  }

  public async patchStatus(
    body: unknown
  ): Promise<UserFeedbackAdminStatusOkType> {
    const parsed = userFeedbackAdminStatusPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(
        API_REQUEST_BODY_EMPTY,
        'Invalid feedback status patch'
      );
    }
    return this.feedbackService.updateStatusForAdmin(
      parsed.data.id,
      parsed.data.status
    );
  }

  public async createAdminGithubIssue(
    body: unknown
  ): Promise<UserFeedbackAdminGithubIssueOkType> {
    const parsed = userFeedbackAdminGithubIssueBodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(
        API_REQUEST_BODY_EMPTY,
        'Invalid github issue body'
      );
    }
    return this.feedbackService.createGithubIssueForAdmin(parsed.data.id);
  }

  public async attachScreenshots(
    feedbackId: string,
    files: readonly FeedbackScreenshotUploadType[]
  ): Promise<UserFeedbackScreenshotsOkType> {
    return this.feedbackService.attachScreenshotsForCurrentUser(
      feedbackId,
      files
    );
  }
}
