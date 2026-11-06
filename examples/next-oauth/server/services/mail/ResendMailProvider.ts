import { ExecutorError } from '@qlover/fe-corekit/executor';
import { inject, injectable } from '@shared/container';
import { FE_SITE_SETTING_KEYS } from '@config/feSiteSettings';
import {
  API_MAIL_PROVIDER_NOT_READY,
  API_MAIL_SEND_FAILED
} from '@config/i18n-identifier/api';
import { I } from '@config/ioc-identifiter';
import { SiteSettingsService } from '@server/services/SiteSettingsService';
import type {
  MailAddressType,
  MailProviderInterface,
  MailSendInputType,
  MailSendResultType
} from './MailProviderInterface';
import type { LoggerInterface } from '@qlover/logger';

const RESEND_API_URL = 'https://api.resend.com/emails';
const RESEND_TIMEOUT_MS = 15_000;

function formatAddress(address: MailAddressType): string {
  const name = address.name?.trim().replace(/["<>]/g, '');
  return name ? `${name} <${address.email}>` : address.email;
}

/**
 * Resend HTTP API（`POST /emails`）。
 * API Key 来自 Admin 站点设置 `mail.resend_api_key`（落库加密）。
 */
@injectable()
export class ResendMailProvider implements MailProviderInterface {
  public readonly name = 'resend' as const;

  constructor(
    @inject(I.Logger) protected readonly logger: LoggerInterface,
    @inject(SiteSettingsService)
    protected readonly siteSettings: SiteSettingsService
  ) {}

  /**
   * @override
   */
  public async send(input: MailSendInputType): Promise<MailSendResultType> {
    const apiKey = (
      await this.siteSettings.getSecretString(
        FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY
      )
    ).trim();
    if (!apiKey) {
      throw new ExecutorError(
        API_MAIL_PROVIDER_NOT_READY,
        'Resend API key is missing (Admin site settings mail.resend_api_key)'
      );
    }

    const body: Record<string, unknown> = {
      from: formatAddress(input.from),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text
    };
    if (input.replyTo) {
      body.reply_to = input.replyTo;
    }

    let response: Response;
    try {
      response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(RESEND_TIMEOUT_MS)
      });
    } catch (error) {
      this.logger.error('Resend request failed', { to: input.to, error });
      throw new ExecutorError(
        API_MAIL_SEND_FAILED,
        error instanceof Error ? error.message : 'Resend request failed'
      );
    }

    const payload = (await response.json().catch(() => null)) as {
      id?: string;
      name?: string;
      message?: string;
    } | null;

    if (!response.ok) {
      const detail = payload?.message || payload?.name || response.statusText;
      this.logger.error('Resend rejected', {
        to: input.to,
        status: response.status,
        detail
      });
      throw new ExecutorError(
        API_MAIL_SEND_FAILED,
        `Resend ${response.status}: ${detail}`
      );
    }

    return { messageId: payload?.id ?? null };
  }

  /**
   * @override
   */
  public exposeContent(): boolean {
    return false;
  }
}
