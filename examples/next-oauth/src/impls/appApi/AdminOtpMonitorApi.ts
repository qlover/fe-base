import { inject, injectable } from '@shared/container';
import { API_ADMIN_OTP_MONITOR } from '@config/apiRoutes';
import type { OtpMonitorListResult } from '@schemas/OtpMonitorSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminOtpMonitorApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(params?: {
    phone?: string;
  }): Promise<OtpMonitorListResult> {
    const response = await this.appApiRequester.get(API_ADMIN_OTP_MONITOR, {
      params: {
        phone: params?.phone ?? ''
      }
    });
    const envelope = response.data as NextKitApiSuccess<OtpMonitorListResult>;
    return envelope.data ?? { entries: [], total: 0 };
  }
}
