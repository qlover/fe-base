import { inject, injectable } from '@shared/container';
import {
  API_USER_PASSWORD_FORGOT,
  API_USER_PASSWORD_RESET
} from '@config/apiRoutes';
import type { ResetTokenVerifyResultType } from '@schemas/PasswordResetSchema';
import { AppApiRequester } from './AppApiRequester';
import type { NextKitApiSuccess } from '@qlover/next-kit/common';

/**
 * 忘记 / 重置密码的前端 API（匿名可调用）。
 * 失败以 `ExecutorError` 抛出（id 为 `api:*` i18n key），由调用方就地展示，不弹全局对话框。
 */
@injectable()
export class PasswordResetApi {
  constructor(
    @inject(AppApiRequester) protected readonly appApiRequester: AppApiRequester
  ) {}

  /**
   * 申请重置邮件；无论邮箱是否存在都返回成功。
   *
   * @param email - 账号邮箱
   * @param locale - 邮件语言提示
   */
  public async requestReset(email: string, locale?: string): Promise<void> {
    await this.appApiRequester.post(
      API_USER_PASSWORD_FORGOT,
      { email, locale },
      { disabledDialogError: true }
    );
  }

  /**
   * 校验邮件链接中的令牌。
   *
   * @param token - URL 中的 `token`
   * @returns 令牌当前是否可用
   */
  public async verifyToken(token: string): Promise<boolean> {
    const response = await this.appApiRequester.get(API_USER_PASSWORD_RESET, {
      params: { token },
      disabledDialogError: true
    });
    const envelope =
      response.data as NextKitApiSuccess<ResetTokenVerifyResultType>;
    return envelope.data?.valid ?? false;
  }

  /**
   * 凭令牌设置新密码（`new_password` 由请求插件加密）。
   *
   * @param params - 令牌、新密码与语言提示
   */
  public async resetPassword(params: {
    token: string;
    newPassword: string;
    locale?: string;
  }): Promise<void> {
    await this.appApiRequester.post(
      API_USER_PASSWORD_RESET,
      {
        token: params.token,
        new_password: params.newPassword,
        locale: params.locale
      },
      { encryptProps: 'new_password', disabledDialogError: true }
    );
  }
}
