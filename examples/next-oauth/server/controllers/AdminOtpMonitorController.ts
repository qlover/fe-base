import { inject, injectable } from '@shared/container';
import type { OtpMonitorListResult } from '@schemas/OtpMonitorSchema';
import { PhoneOtpService } from '@server/services/PhoneOtpService';

@injectable()
export class AdminOtpMonitorController {
  constructor(
    @inject(PhoneOtpService)
    protected readonly phoneOtpService: PhoneOtpService
  ) {}

  public async list(query: {
    phone?: string | null;
  }): Promise<OtpMonitorListResult> {
    const phone =
      typeof query.phone === 'string' ? query.phone.trim() : undefined;
    const entries = await this.phoneOtpService.listForAdmin({
      phone: phone || undefined,
      limit: 80
    });
    return { entries, total: entries.length };
  }
}
