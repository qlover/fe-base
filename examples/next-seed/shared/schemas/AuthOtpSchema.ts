import { z } from 'zod';

/**
 * 邮箱 / 手机 OTP 登录入参（Controller 校验用）。
 */
export const signWithPhoneOtpSchema = z.object({
  phone: z.string(),
  token: z.string().optional()
});

export const signWithEmailOtpSchema = z.object({
  email: z.email(),
  token: z.string().optional()
});

export type SignWithPhoneOtpInput = z.infer<typeof signWithPhoneOtpSchema>;
export type SignWithEmailOtpInput = z.infer<typeof signWithEmailOtpSchema>;
