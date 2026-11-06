import { inject, injectable } from '@shared/container';
import { API_ADMIN_MAIL_LOGS, API_ADMIN_MAIL_TEST } from '@config/apiRoutes';
import type {
  FeMailLogListResultType,
  FeMailTemplateType
} from '@schemas/FeMailSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

/** Admin 邮件前端 API：测试发信与日志查询。 */
@injectable()
export class AdminMailApi {
  constructor(
    @inject(AppApiRequester) protected readonly appApiRequester: AppApiRequester
  ) {}

  /**
   * 发送测试邮件。
   *
   * @param to - 收件人邮箱
   * @returns 通道侧消息 id（可能为 null）
   */
  public async sendTest(to: string): Promise<{ messageId: string | null }> {
    const response = await this.appApiRequester.post(API_ADMIN_MAIL_TEST, {
      to
    });
    const envelope = response.data as NextKitApiSuccess<{
      messageId: string | null;
    }>;
    return envelope.data ?? { messageId: null };
  }

  /**
   * 查询邮件日志。
   *
   * @param params - 收件人模糊匹配与模板过滤
   */
  public async listLogs(params?: {
    email?: string;
    template?: FeMailTemplateType | '';
  }): Promise<FeMailLogListResultType> {
    const response = await this.appApiRequester.get(API_ADMIN_MAIL_LOGS, {
      params: {
        email: params?.email ?? '',
        template: params?.template ?? ''
      }
    });
    const envelope =
      response.data as NextKitApiSuccess<FeMailLogListResultType>;
    return envelope.data ?? { entries: [], total: 0 };
  }
}
