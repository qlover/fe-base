import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { API_REQUEST_BODY_EMPTY } from '@config/i18n-identifier/api';
import {
  otpMonitorPurgeSchema,
  type OtpMonitorAdminEntry,
  type OtpMonitorListResult,
  type OtpMonitorPurgeResult
} from '@schemas/OtpMonitorSchema';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import { OTP_SEND_RATE_LIMIT_KEY_PREFIX } from '@server/services/OtpSendRateLimitService';

@injectable()
export class AdminOtpMonitorController {
  constructor(
    @inject(MemoryKvCacheService)
    protected readonly kv: MemoryKvCacheService
  ) {}

  public async list(query: {
    ip?: string | null;
  }): Promise<OtpMonitorListResult> {
    const ipFilter =
      typeof query.ip === 'string' ? query.ip.trim().toLowerCase() : '';
    const raw = await this.kv.listEntries(OTP_SEND_RATE_LIMIT_KEY_PREFIX);
    const entries: OtpMonitorAdminEntry[] = raw
      .map((entry) => {
        const ip = entry.key.slice(OTP_SEND_RATE_LIMIT_KEY_PREFIX.length);
        const blockedUntilMs =
          entry.value &&
          typeof entry.value === 'object' &&
          'blockedUntilMs' in entry.value &&
          typeof (entry.value as { blockedUntilMs: unknown }).blockedUntilMs ===
            'number'
            ? (entry.value as { blockedUntilMs: number }).blockedUntilMs
            : null;
        return {
          key: entry.key,
          ip,
          blockedUntilMs,
          ttlMs: entry.ttlMs,
          value: entry.value
        };
      })
      .filter((entry) =>
        ipFilter ? entry.ip.toLowerCase().includes(ipFilter) : true
      );
    return { entries, total: entries.length };
  }

  public async purge(body: unknown): Promise<OtpMonitorPurgeResult> {
    const parsed = otpMonitorPurgeSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_REQUEST_BODY_EMPTY);
    }
    if (parsed.data.all) {
      const removed = await this.kv.removeByPrefix(
        OTP_SEND_RATE_LIMIT_KEY_PREFIX
      );
      return { removed };
    }
    if (parsed.data.key) {
      if (!parsed.data.key.startsWith(OTP_SEND_RATE_LIMIT_KEY_PREFIX)) {
        throw new ExecutorError(
          'api:invalid_params',
          'Invalid OTP monitor key'
        );
      }
      await this.kv.removeItem(parsed.data.key);
      return { removed: 1 };
    }
    throw new ExecutorError(API_REQUEST_BODY_EMPTY);
  }
}
