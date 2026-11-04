import { z } from 'zod';

/** 个人中心展示的第三方登录提供方。 */
export const linkedLoginProviderSchema = z.enum([
  'brain',
  'github',
  'google'
]);

export type LinkedLoginProviderType = z.infer<typeof linkedLoginProviderSchema>;

/**
 * 当前用户已关联的第三方登录（只读）。
 */
export const linkedLoginSchema = z.object({
  provider: linkedLoginProviderSchema,
  /** 提供方侧账号名（如 GitHub username）；未知时为 null。 */
  account: z.string().nullable(),
  /** brain-oauth 登录环境；其它提供方为 null。 */
  env: z.string().nullable(),
  linked_at: z.string().nullable(),
  last_login_at: z.string().nullable()
});

export type LinkedLoginType = z.infer<typeof linkedLoginSchema>;
