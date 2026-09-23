import type { PhoneOtpProviderName } from '@schemas/PhoneOtpSchema';

export type PhoneOtpSendContext = {
  readonly phone: string;
  readonly code: string;
  readonly expiresAt: Date;
};

/**
 * How OTP is delivered. Verification always goes through fe_phone_otps
 * (except when channel is `supabase`, which uses GoTrue SMS end-to-end).
 */
export interface PhoneOtpProviderInterface {
  readonly name: PhoneOtpProviderName;

  /**
   * Deliver OTP (or no-op for memory). Must not throw for successful "queued".
   */
  send(context: PhoneOtpSendContext): Promise<void>;

  /** Whether Admin may show plaintext code. */
  exposePlainCode(): boolean;
}
