import { inject, injectable } from '@shared/container';
import { API_ADMIN_OTP_MONITOR } from '@config/apiRoutes';
import type {
  OtpMonitorListResult,
  OtpMonitorPurgeBody,
  OtpMonitorPurgeResult
} from '@schemas/OtpMonitorSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

@injectable()
export class AdminOtpMonitorApi {
  constructor(
    @inject(AppApiRequester) private readonly appApiRequester: AppApiRequester
  ) {}

  public async list(params?: { ip?: string }): Promise<OtpMonitorListResult> {
    const response = await this.appApiRequester.get(API_ADMIN_OTP_MONITOR, {
      params: {
        ip: params?.ip ?? ''
      }
    });
    const envelope = response.data as NextKitApiSuccess<OtpMonitorListResult>;
    return envelope.data ?? { entries: [], total: 0 };
  }

  public async purge(
    body: OtpMonitorPurgeBody
  ): Promise<OtpMonitorPurgeResult> {
    const response = await this.appApiRequester.post(
      API_ADMIN_OTP_MONITOR,
      body
    );
    const envelope = response.data as NextKitApiSuccess<OtpMonitorPurgeResult>;
    return envelope.data ?? { removed: 0 };
  }
}
