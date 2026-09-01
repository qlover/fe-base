import { OtpSendRateLimitService as KitOtpSendRateLimitService } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { MemoryKvCacheService } from './MemoryKvCacheService';

@injectable()
export class OtpSendRateLimitService extends KitOtpSendRateLimitService {
  constructor(@inject(MemoryKvCacheService) kv: MemoryKvCacheService) {
    super({ kv, keyPrefix: 'next-oauth:otp:send:ip:' });
  }
}
