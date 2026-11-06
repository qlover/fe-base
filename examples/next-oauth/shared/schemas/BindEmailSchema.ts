import { userSchema } from '@qlover/next-kit/common';
import { z } from 'zod';

/** POST /api/user/bind-email/send */
export const bindEmailSendSchema = z.object({
  email: z.string().email()
});

export type BindEmailSendInputType = z.infer<typeof bindEmailSendSchema>;

/** POST /api/user/bind-email/verify */
export const bindEmailVerifySchema = z.object({
  email: z.string().email(),
  token: z.string().min(4).max(12)
});

export type BindEmailVerifyInputType = z.infer<typeof bindEmailVerifySchema>;

/** 验证成功：是否合并进已有邮箱账户 + 新会话用户。 */
export const bindEmailVerifyResultSchema = z.object({
  merged: z.boolean(),
  user: userSchema
});

export type BindEmailVerifyResultType = z.infer<
  typeof bindEmailVerifyResultSchema
>;
