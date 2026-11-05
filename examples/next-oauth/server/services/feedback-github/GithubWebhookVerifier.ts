import { createHmac, timingSafeEqual } from 'crypto';
import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import {
  GithubWebhookVerifyFailureReason,
  type GithubWebhookVerifierInterface,
  type GithubWebhookVerifyResultType
} from '@server/interfaces/GithubWebhookVerifierInterface';
import { SiteSettingsService } from '@server/services/SiteSettingsService';

const SIGNATURE_PREFIX = 'sha256=';

/**
 * 用站点设置 Webhook Secret 做 HMAC-SHA256；未配置密钥时一律拒绝。
 */
@injectable()
export class GithubWebhookVerifier implements GithubWebhookVerifierInterface {
  constructor(
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  public async verify(
    rawBody: string,
    signatureHeader: string | null
  ): Promise<GithubWebhookVerifyResultType> {
    if (signatureHeader == null || signatureHeader.trim() === '') {
      return {
        ok: false,
        reasonCode: GithubWebhookVerifyFailureReason.signatureHeaderMissing
      };
    }
    if (!signatureHeader.startsWith(SIGNATURE_PREFIX)) {
      return {
        ok: false,
        reasonCode: GithubWebhookVerifyFailureReason.signatureHeaderInvalid
      };
    }
    const secret = (
      await this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET
      )
    ).trim();
    if (!secret) {
      return {
        ok: false,
        reasonCode: GithubWebhookVerifyFailureReason.secretNotConfigured
      };
    }

    const expectedHex =
      SIGNATURE_PREFIX +
      createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex');
    const expected = new Uint8Array(Buffer.from(expectedHex, 'utf8'));
    const received = new Uint8Array(Buffer.from(signatureHeader, 'utf8'));
    if (
      expected.length !== received.length ||
      !timingSafeEqual(expected, received)
    ) {
      return {
        ok: false,
        reasonCode: GithubWebhookVerifyFailureReason.digestMismatch
      };
    }
    return { ok: true };
  }
}
