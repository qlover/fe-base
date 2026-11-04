import { z } from 'zod';

/** 站点设置 `mail.provider` 的取值（含关闭）。 */
export const feMailProviderSettingSchema = z.enum([
  'disabled',
  'memory',
  'resend'
]);
export type FeMailProviderSettingType = z.infer<
  typeof feMailProviderSettingSchema
>;

/** 真正处理邮件的通道（不含 `disabled`）。 */
export const feMailProviderSchema = z.enum(['memory', 'resend']);
export type FeMailProviderType = z.infer<typeof feMailProviderSchema>;

/** 邮件模板标识。 */
export const feMailTemplateSchema = z.enum([
  'test',
  'password_reset',
  'password_changed'
]);
export type FeMailTemplateType = z.infer<typeof feMailTemplateSchema>;

export const feMailStatusSchema = z.enum(['sent', 'failed']);
export type FeMailStatusType = z.infer<typeof feMailStatusSchema>;

/** `fe_mail_logs` 表行。 */
export const feMailLogRowSchema = z.object({
  id: z.string().uuid(),
  to_email: z.string(),
  subject: z.string(),
  template: feMailTemplateSchema,
  provider: feMailProviderSchema,
  status: feMailStatusSchema,
  provider_message_id: z.string().nullable().optional(),
  error: z.string().nullable().optional(),
  body_text: z.string().nullable().optional(),
  user_id: z.string().uuid().nullable().optional(),
  created_ip: z.string().nullable().optional(),
  created_at: z.string()
});
export type FeMailLogRowType = z.infer<typeof feMailLogRowSchema>;

/** Admin 列表项；`bodyText` 仅 memory 通道会保留。 */
export const feMailLogAdminItemSchema = z.object({
  id: z.string().uuid(),
  toEmail: z.string(),
  subject: z.string(),
  template: feMailTemplateSchema,
  provider: feMailProviderSchema,
  status: feMailStatusSchema,
  providerMessageId: z.string().nullable(),
  error: z.string().nullable(),
  bodyText: z.string().nullable(),
  userId: z.string().nullable(),
  createdIp: z.string().nullable(),
  createdAt: z.string()
});
export type FeMailLogAdminItemType = z.infer<typeof feMailLogAdminItemSchema>;

/** GET /api/admin/mail-logs 响应。 */
export type FeMailLogListResultType = {
  readonly entries: FeMailLogAdminItemType[];
  readonly total: number;
};

/** POST /api/admin/mail/test 请求体。 */
export const feAdminMailTestSchema = z.object({
  to: z.string().trim().email()
});
export type FeAdminMailTestInputType = z.infer<typeof feAdminMailTestSchema>;
