import { z } from 'zod';

/** POST /api/user/password/forgot 请求体。 */
export const forgotPasswordSchema = z.object({
  email: z.string().trim().email(),
  /** 邮件语言提示；缺省时服务端按 Cookie / Accept-Language 解析。 */
  locale: z.string().optional()
});
export type ForgotPasswordInputType = z.infer<typeof forgotPasswordSchema>;

/**
 * POST /api/user/password/reset 请求体。
 * `new_password` 与登录一致由客户端加密，服务端解密后再按
 * {@link isValidPassword}（6–50 位、无空白）校验。
 */
export const resetPasswordRequestSchema = z.object({
  token: z.string().trim().min(1),
  new_password: z.string().min(1),
  locale: z.string().optional()
});
export type ResetPasswordInputType = z.infer<typeof resetPasswordRequestSchema>;

/** GET /api/user/password/reset?token= 响应。 */
export type ResetTokenVerifyResultType = {
  readonly valid: boolean;
};
