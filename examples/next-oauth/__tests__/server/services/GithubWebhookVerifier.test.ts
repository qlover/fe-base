import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import { GithubWebhookVerifyFailureReason } from '@server/interfaces/GithubWebhookVerifierInterface';
import { GithubWebhookVerifier } from '@server/services/feedback-github/GithubWebhookVerifier';
import type { SiteSettingsService } from '@server/services/SiteSettingsService';

const SECRET = 'webhook-secret-for-tests';

function sign(body: string, secret: string = SECRET): string {
  return `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
}

function createSiteSettings(secret: string): SiteSettingsService {
  return {
    getSecretString: async (key: string) =>
      key === FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET ? secret : ''
  } as unknown as SiteSettingsService;
}

describe('GithubWebhookVerifier', () => {
  it('accepts a correctly signed body', async () => {
    const verifier = new GithubWebhookVerifier(createSiteSettings(SECRET));
    const body = '{"action":"closed"}';
    await expect(verifier.verify(body, sign(body))).resolves.toEqual({
      ok: true
    });
  });

  it('rejects bad signature or missing secret', async () => {
    const verifier = new GithubWebhookVerifier(createSiteSettings(SECRET));
    const body = '{"action":"closed"}';
    await expect(verifier.verify(body, sign(body, 'other'))).resolves.toEqual({
      ok: false,
      reasonCode: GithubWebhookVerifyFailureReason.digestMismatch
    });
    await expect(verifier.verify(body, null)).resolves.toEqual({
      ok: false,
      reasonCode: GithubWebhookVerifyFailureReason.signatureHeaderMissing
    });

    const empty = new GithubWebhookVerifier(createSiteSettings(''));
    await expect(empty.verify(body, sign(body, ''))).resolves.toEqual({
      ok: false,
      reasonCode: GithubWebhookVerifyFailureReason.secretNotConfigured
    });
  });
});
