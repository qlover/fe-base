import { inject, injectable } from '@shared/container';
import { API_ADMIN_FEEDBACK } from '@config/apiRoutes';
import {
  userFeedbackAdminListSchema,
  userFeedbackAdminStatusOkSchema,
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
}
