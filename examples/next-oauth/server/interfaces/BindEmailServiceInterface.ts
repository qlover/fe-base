import type { BindEmailVerifyResultType } from '@schemas/BindEmailSchema';
import type { SignOtpResult } from '@qlover/oauth-wrapper';

/**
 * 手机号账户绑定业务邮箱。验证码发到当前手机号。
 */
export interface BindEmailServiceInterface {
  /**
   * 向当前账号的手机号发送绑定用验证码。
   *
   * @param params - 当前用户、目标邮箱与可选客户端 IP
   */
  send(params: {
    readonly currentUserId: string;
    readonly email: string;
    readonly clientIp?: string;
  }): Promise<SignOtpResult>;

  /**
   * 校验手机验证码，通过后把邮箱绑到当前用户。
   *
   * @param params - 当前用户、邮箱与验证码
   */
  verify(params: {
    readonly currentUserId: string;
    readonly email: string;
    readonly token: string;
  }): Promise<BindEmailVerifyResultType>;
}
