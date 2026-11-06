import { inject, injectable } from '@shared/container';
import {
  API_ADMIN_FEEDBACK,
  API_ADMIN_FEEDBACK_GITHUB_ISSUE
} from '@config/apiRoutes';
import {
  userFeedbackAdminGithubIssueOkSchema,
  userFeedbackAdminListSchema,
  userFeedbackAdminStatusOkSchema,
  type UserFeedbackAdminGithubIssueOkType,
  type UserFeedbackAdminListType,
  type UserFeedbackAdminStatusOkType,
  type UserFeedbackStatusType
} from '@schemas/UserFeedbackSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

/**
 * Admin 反馈 API。
 */
@injectable()
export class AdminFeedbackApi {
  constructor(
    @inject(AppApiRequester)
    protected readonly appApiRequester: AppApiRequester
  ) {}

  public async list(): Promise<UserFeedbackAdminListType> {
    const response = await this.appApiRequester.get(API_ADMIN_FEEDBACK);
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackAdminListSchema.parse(envelope.data ?? envelope);
  }

  public async updateStatus(
    id: string,
    status: UserFeedbackStatusType
  ): Promise<UserFeedbackAdminStatusOkType> {
    const response = await this.appApiRequester.patch(API_ADMIN_FEEDBACK, {
      id,
      status
    });
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackAdminStatusOkSchema.parse(envelope.data ?? envelope);
  }

  public async createGithubIssue(
    id: string
  ): Promise<UserFeedbackAdminGithubIssueOkType> {
    const response = await this.appApiRequester.post(
      API_ADMIN_FEEDBACK_GITHUB_ISSUE,
      { id }
    );
    const envelope = response.data as NextKitApiSuccess<unknown>;
    return userFeedbackAdminGithubIssueOkSchema.parse(
      envelope.data ?? envelope
    );
  }
}
