import type { BindEmailVerifyResultType } from '@schemas/BindEmailSchema';
import type { SignOtpResult } from '@qlover/oauth-wrapper';

/**
 * 手机号账户绑定业务邮箱（可合并到已有邮箱账户）。
 */
export interface BindEmailServiceInterface {
  /**
   * 向目标邮箱发送绑定用 OTP（Supabase Auth email OTP）。
   *
   * @param params - 当前用户与目标邮箱
   */
  send(params: {
    readonly currentUserId: string;
    readonly email: string;
  }): Promise<SignOtpResult>;

  /**
   * 校验 OTP：无冲突则绑到当前用户；邮箱已有其他用户则合并。
   *
   * @param params - 当前用户、邮箱与验证码
   */
  verify(params: {
    readonly currentUserId: string;
    readonly email: string;
    readonly token: string;
  }): Promise<BindEmailVerifyResultType>;
}
