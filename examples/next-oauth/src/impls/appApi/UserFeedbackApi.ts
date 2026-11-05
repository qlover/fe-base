import { inject, injectable } from '@shared/container';
import {
  API_USER_FEEDBACK,
  API_USER_FEEDBACK_SCREENSHOTS
} from '@config/apiRoutes';
import {
  userFeedbackCreateOkSchema,
  userFeedbackListPublicSchema,
  userFeedbackScreenshotsOkSchema,
  type UserFeedbackCreateBodyType,
  type UserFeedbackCreateOkType,
  type UserFeedbackListPublicType,
  type UserFeedbackScreenshotsOkType
} from '@schemas/UserFeedbackSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

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

  public async uploadScreenshots(
    feedbackId: string,
    files: readonly File[]
  ): Promise<UserFeedbackScreenshotsOkType> {
    const form = new FormData();
    for (const file of files) {
      form.append('screenshots', file);
    }
    const path = API_USER_FEEDBACK_SCREENSHOTS.replace(':id', feedbackId);
    const response = await this.appApiRequester.post(path, form);
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackScreenshotsOkSchema.parse(envelope.data ?? envelope);
  }
}
