import { inject, injectable } from '@shared/container';
import {
  API_USER_FEEDBACK,
  API_USER_FEEDBACK_SCREENSHOTS
} from '@config/apiRoutes';
import {
  userFeedbackCreateOkSchema,
  userFeedbackListPublicSchema,
  type UserFeedbackCategoryType,
  type UserFeedbackCreateBodyType,
  type UserFeedbackCreateOkType,
  type UserFeedbackItemPublicType,
  type UserFeedbackListPublicType
} from '@schemas/UserFeedbackSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

export type FeedbackSubmitInputType = {
  readonly category: UserFeedbackCategoryType;
  readonly body: string;
  readonly pageUrl?: string;
  readonly clientContext?: UserFeedbackCreateBodyType['clientContext'];
  readonly screenshots?: readonly File[];
};

export type FeedbackSubmitResultType = {
  readonly item: UserFeedbackItemPublicType;
  readonly screenshotsFailed: boolean;
};

/**
 * 当前用户反馈 API。
 */
@injectable()
export class UserFeedbackApi {
  constructor(
    @inject(AppApiRequester)
    protected readonly appApiRequester: AppApiRequester
  ) {}

  public async listMine(): Promise<UserFeedbackListPublicType> {
    const response = await this.appApiRequester.get(API_USER_FEEDBACK);
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackListPublicSchema.parse(envelope.data ?? envelope);
  }

  public async create(
    body: UserFeedbackCreateBodyType
  ): Promise<UserFeedbackCreateOkType> {
    const response = await this.appApiRequester.post(API_USER_FEEDBACK, body);
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackCreateOkSchema.parse(envelope.data ?? envelope);
  }

  /**
   * 创建反馈并可选上传截图；截图失败时仍返回已创建项（partial success）。
   */
  public async submit(
    input: FeedbackSubmitInputType
  ): Promise<FeedbackSubmitResultType> {
    const created = await this.create({
      category: input.category,
      body: input.body,
      pageUrl: input.pageUrl,
      clientContext: input.clientContext
    });
    const files = input.screenshots ?? [];
    const screenshotsFailed =
      files.length > 0
        ? !(await this.uploadScreenshotsQuiet(created.item.id, files))
        : false;
    return { item: created.item, screenshotsFailed };
  }

  protected async uploadScreenshotsQuiet(
    feedbackId: string,
    files: readonly File[]
  ): Promise<boolean> {
    const form = new FormData();
    for (const file of files) {
      form.append('screenshots', file, file.name);
    }
    try {
      const path = API_USER_FEEDBACK_SCREENSHOTS.replace(
        ':id',
        encodeURIComponent(feedbackId)
      );
      const res = await fetch(path, {
        method: 'POST',
        credentials: 'include',
        body: form
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}
