export const GithubWebhookVerifyFailureReason = {
  signatureHeaderMissing: 'signature_header_missing',
  signatureHeaderInvalid: 'signature_header_invalid',
  secretNotConfigured: 'secret_not_configured',
  digestMismatch: 'digest_mismatch'
} as const;

export type GithubWebhookVerifyFailureReasonType =
  (typeof GithubWebhookVerifyFailureReason)[keyof typeof GithubWebhookVerifyFailureReason];

export type GithubWebhookVerifyResultType =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reasonCode: GithubWebhookVerifyFailureReasonType;
    };

/**
 * GitHub Webhook 签名校验（`X-Hub-Signature-256`）。
 */
export interface GithubWebhookVerifierInterface {
  verify(
    rawBody: string,
    signatureHeader: string | null
  ): Promise<GithubWebhookVerifyResultType>;
}
