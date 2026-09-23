import { OtpSendRateLimitService as KitOtpSendRateLimitService } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { MemoryKvCacheService } from './MemoryKvCacheService';

/** Process MemoryKv key prefix for OTP send IP rate limits. */
export const OTP_SEND_RATE_LIMIT_KEY_PREFIX = 'next-oauth:otp:send:ip:';

@injectable()
export class OtpSendRateLimitService extends KitOtpSendRateLimitService {
  constructor(@inject(MemoryKvCacheService) kv: MemoryKvCacheService) {
    super({ kv, keyPrefix: OTP_SEND_RATE_LIMIT_KEY_PREFIX });
  }
}
