import { injectable } from '@shared/container';
import type {
  PhoneOtpProviderInterface,
  PhoneOtpSendContext
} from './PhoneOtpProviderInterface';

/**
 * No SMS. Code is stored in fe_phone_otps.code_plain for Admin monitoring.
 */
@injectable()
export class MemoryPhoneOtpProvider implements PhoneOtpProviderInterface {
  public readonly name = 'memory' as const;

  /**
   * @override
   */
  public async send(_context: PhoneOtpSendContext): Promise<void> {
    // Intentionally empty — Admin「验证码监控」is the delivery channel.
  }

  /**
   * @override
   */
  public exposePlainCode(): boolean {
    return true;
  }
}
