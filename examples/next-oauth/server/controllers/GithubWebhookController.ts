import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { API_NOT_AUTHORIZED } from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import {
  GithubWebhookEvent,
  githubIssueEventSchema,
  githubWebhookResultSchema,
  type GithubWebhookResultType
} from '@schemas/GithubWebhookSchema';
import type { FeedbackIssueStatusSyncInterface } from '@server/interfaces/FeedbackIssueStatusSyncInterface';
import type { GithubWebhookVerifierInterface } from '@server/interfaces/GithubWebhookVerifierInterface';
import { FeedbackIssueStatusSyncService } from '@server/services/feedback-github/FeedbackIssueStatusSyncService';
import { GithubWebhookVerifier } from '@server/services/feedback-github/GithubWebhookVerifier';
import type { LoggerInterface } from '@qlover/logger';

export type GithubWebhookHeadersType = {
  readonly event: string | null;
  readonly signature: string | null;
};

/**
 * GitHub App Webhook：先校验签名，再按事件分发。
 */
@injectable()
export class GithubWebhookController {
  constructor(
    @inject(GithubWebhookVerifier)
    protected readonly verifier: GithubWebhookVerifierInterface,
    @inject(FeedbackIssueStatusSyncService)
    protected readonly statusSync: FeedbackIssueStatusSyncInterface,
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

  public async handle(
    rawBody: string,
    headers: GithubWebhookHeadersType
  ): Promise<GithubWebhookResultType> {
    const verified = await this.verifier.verify(rawBody, headers.signature);
    if (!verified.ok) {
      this.logger.warn('github webhook signature rejected', {
        reasonCode: verified.reasonCode,
        event: headers.event
      });
      throw new ExecutorError(API_NOT_AUTHORIZED, verified.reasonCode);
    }

    const event = headers.event ?? '';
    let updated = 0;
    if (event === GithubWebhookEvent.issues) {
      const payload = githubIssueEventSchema.parse(JSON.parse(rawBody));
      updated = await this.statusSync.applyIssueEvent(payload);
    }
    return githubWebhookResultSchema.parse({ ok: true, event, updated });
  }
}
