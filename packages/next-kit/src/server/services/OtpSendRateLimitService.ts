import { ExecutorError } from '@qlover/fe-corekit/executor';
import { API_OTP_SEND_RATE_LIMITED } from '../../common/config/i18nIdentifiers';
import type { KvCacheInterface } from './MemoryKvCacheService';

/** Must match frontend resend cooldown. */
export const OTP_SEND_COOLDOWN_MS = 60_000;

type OtpSendRateLimitEntry = {
  readonly blockedUntilMs: number;
};

export type OtpSendRateLimitServiceOptions = {
  readonly kv: KvCacheInterface;
  /** Key prefix, e.g. `app:otp:send:ip:` */
  readonly keyPrefix?: string;
  readonly cooldownMs?: number;
};

/**
 * IP-based OTP send cooldown. Reserves the slot before calling upstream
 * to avoid concurrent bursts.
 */
export class OtpSendRateLimitService {
  protected readonly kv: KvCacheInterface;
  protected readonly keyPrefix: string;
  protected readonly cooldownMs: number;

  constructor(options: OtpSendRateLimitServiceOptions) {
    this.kv = options.kv;
    this.keyPrefix = options.keyPrefix ?? 'otp:send:ip:';
    this.cooldownMs = options.cooldownMs ?? OTP_SEND_COOLDOWN_MS;
  }

  public async assertCanSend(clientIp: string): Promise<void> {
    const ip = clientIp.trim() || 'unknown';
    const key = `${this.keyPrefix}${ip}`;
    const entry = (await this.kv.getItem(key)) as OtpSendRateLimitEntry | null;
    const now = Date.now();

    if (entry && now < entry.blockedUntilMs) {
      const retryAfterSec = Math.max(
        1,
        Math.ceil((entry.blockedUntilMs - now) / 1000)
      );
      throw new ExecutorError(API_OTP_SEND_RATE_LIMITED, { retryAfterSec });
    }

    await this.kv.setItem(
      key,
      { blockedUntilMs: now + this.cooldownMs } satisfies OtpSendRateLimitEntry,
      { ttlMs: this.cooldownMs }
    );
  }
}
