import { ExecutorError } from '@qlover/fe-corekit/executor';
import { getClientIpFromRequest } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { API_MAIL_RECIPIENT_INVALID } from '@config/i18n-identifier/api';
import type {
  FeMailLogListResultType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';
import {
  feAdminMailTestSchema,
  feMailTemplateSchema
} from '@schemas/FeMailSchema';
import { MailService } from '@server/services/mail/MailService';
import type { MailServiceInterface } from '@server/services/mail/MailServiceInterface';
import { OAuthUserService } from '@server/services/OAuthUserService';
import { RequestLocaleResolver } from '@server/services/RequestLocaleResolver';
import type { UserServiceInterface } from '../interfaces/UserServiceInterface';
import type { NextRequest } from 'next/server';

/**
 * Admin 邮件：测试发信（`admin_mail_test`）与发送日志（`admin_mail_logs_read`）。
 * 权限由路由层 `RequirePermissionPlugin` 把关。
 */
@injectable()
export class AdminMailController {
  constructor(
    @inject(MailService)
    protected readonly mailService: MailServiceInterface,
    @inject(OAuthUserService)
    protected readonly userService: UserServiceInterface,
    @inject(RequestLocaleResolver)
    protected readonly localeResolver: RequestLocaleResolver
  ) {}

  /**
   * 向指定邮箱发送测试邮件。
   *
   * @param body - `{ to: string }`
   * @param request - 当前请求（解析语言与来源 IP）
   * @returns 通道侧消息 id（可能为 null）
   * @throws ExecutorError 收件人非法、通道未就绪或发送失败
   */
  public async sendTest(
    body: unknown,
    request: NextRequest
  ): Promise<{ messageId: string | null }> {
    const parsed = feAdminMailTestSchema.safeParse(body);
    if (!parsed.success) {
      throw new ExecutorError(API_MAIL_RECIPIENT_INVALID);
    }

    const user = await this.userService.getSessionUser();
    const result = await this.mailService.sendTest({
      to: parsed.data.to,
      locale: this.localeResolver.resolve(request),
      userId: user?.id ?? null,
      clientIp: getClientIpFromRequest(request)
    });
    return { messageId: result.messageId };
  }

  /**
   * 邮件日志列表。
   *
   * @param query - `email` 模糊匹配收件人；`template` 模板过滤
   */
  public async listLogs(query: {
    email?: string | null;
    template?: string | null;
  }): Promise<FeMailLogListResultType> {
    const template = this.parseTemplate(query.template);
    const entries = await this.mailService.listForAdmin({
      email: query.email?.trim() || undefined,
      template,
      limit: 100
    });
    return { entries, total: entries.length };
  }

  protected parseTemplate(
    value: string | null | undefined
  ): FeMailTemplateType | undefined {
    const parsed = feMailTemplateSchema.safeParse(value);
    return parsed.success ? parsed.data : undefined;
  }
}
