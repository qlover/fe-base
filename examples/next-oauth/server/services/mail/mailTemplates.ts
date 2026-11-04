import type { LocaleType } from '@config/i18n';

/**
 * 事务邮件模板（test / password_reset / password_changed），支持 `zh` | `en`。
 * 纯函数：只负责把参数渲染成 subject + html + text，不触碰通道与存储。
 */

/** 渲染完成的邮件内容。 */
export type RenderedMailType = {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function layout(params: {
  title: string;
  paragraphs: string[];
  action?: { label: string; url: string };
  footer: string;
}): string {
  const paragraphs = params.paragraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;line-height:1.6;color:#374151;">${escapeHtml(p)}</p>`
    )
    .join('');
  const action = params.action
    ? `<p style="margin:24px 0;"><a href="${escapeHtml(params.action.url)}" style="display:inline-block;padding:10px 20px;border-radius:8px;background:#2563eb;color:#ffffff;text-decoration:none;font-weight:600;">${escapeHtml(params.action.label)}</a></p><p style="margin:0 0 16px;line-height:1.6;color:#6b7280;font-size:12px;word-break:break-all;">${escapeHtml(params.action.url)}</p>`
    : '';
  return `<!doctype html><html><body style="margin:0;padding:24px;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'PingFang SC','Microsoft YaHei',sans-serif;"><div style="max-width:560px;margin:0 auto;padding:32px;border-radius:12px;background:#ffffff;"><h1 style="margin:0 0 20px;font-size:20px;color:#111827;">${escapeHtml(params.title)}</h1>${paragraphs}${action}<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;"/><p style="margin:0;line-height:1.6;color:#9ca3af;font-size:12px;">${escapeHtml(params.footer)}</p></div></body></html>`;
}

function textBody(parts: Array<string | undefined>): string {
  return parts.filter((part): part is string => Boolean(part)).join('\n\n');
}

/**
 * 渲染「邮件通道测试」邮件。
 *
 * @param params - locale 语言；siteName 站点名称
 * @returns 渲染结果
 */
export function renderTestMail(params: {
  locale: LocaleType;
  siteName: string;
}): RenderedMailType {
  const zh = params.locale === 'zh';
  const title = zh
    ? `${params.siteName} 邮件通道测试`
    : `${params.siteName} mail channel test`;
  const paragraphs = zh
    ? ['这是一封测试邮件。收到说明邮件通道配置正确。']
    : [
        'This is a test email. If you received it, the mail channel is configured correctly.'
      ];
  const footer = zh
    ? '此邮件由管理员在后台触发发送。'
    : 'Sent by an administrator from the admin console.';
  return {
    subject: title,
    html: layout({ title, paragraphs, footer }),
    text: textBody([title, ...paragraphs, footer])
  };
}

/**
 * 渲染「重置密码」邮件。
 *
 * @param params - resetUrl 带 token 的重置链接；expiresInMinutes 有效期（分钟）
 * @returns 渲染结果
 */
export function renderPasswordResetMail(params: {
  locale: LocaleType;
  siteName: string;
  resetUrl: string;
  expiresInMinutes: number;
}): RenderedMailType {
  const zh = params.locale === 'zh';
  const title = zh
    ? `重置你的 ${params.siteName} 密码`
    : `Reset your ${params.siteName} password`;
  const paragraphs = zh
    ? [
        '我们收到了重置该账号密码的请求。点击下方按钮设置新密码。',
        `链接 ${params.expiresInMinutes} 分钟内有效，且只能使用一次。重置成功后所有设备都需要重新登录。`
      ]
    : [
        'We received a request to reset the password for this account. Click the button below to set a new password.',
        `The link expires in ${params.expiresInMinutes} minutes and can only be used once. After resetting, all devices will need to sign in again.`
      ];
  const label = zh ? '重置密码' : 'Reset password';
  const footer = zh
    ? '如果不是你本人操作，请忽略此邮件，你的密码不会被修改。'
    : 'If you did not request this, you can ignore this email; your password will not change.';
  return {
    subject: title,
    html: layout({
      title,
      paragraphs,
      action: { label, url: params.resetUrl },
      footer
    }),
    text: textBody([
      title,
      ...paragraphs,
      `${label}: ${params.resetUrl}`,
      footer
    ])
  };
}

/**
 * 渲染「密码已修改」安全通知邮件。
 *
 * @param params - changedAt 修改时间；ip / userAgent 操作来源；
 *   forgotPasswordUrl 非本人操作时的重置入口（功能未开启时为空）
 * @returns 渲染结果
 */
export function renderPasswordChangedMail(params: {
  locale: LocaleType;
  siteName: string;
  changedAt: Date;
  ip?: string | null;
  userAgent?: string | null;
  forgotPasswordUrl?: string | null;
}): RenderedMailType {
  const zh = params.locale === 'zh';
  const time = params.changedAt.toISOString().replace('T', ' ').slice(0, 19);
  const title = zh
    ? `你的 ${params.siteName} 密码已修改`
    : `Your ${params.siteName} password was changed`;
  const details = zh
    ? [
        `时间（UTC）：${time}`,
        params.ip ? `IP：${params.ip}` : undefined,
        params.userAgent ? `设备：${params.userAgent}` : undefined
      ]
    : [
        `Time (UTC): ${time}`,
        params.ip ? `IP: ${params.ip}` : undefined,
        params.userAgent ? `Device: ${params.userAgent}` : undefined
      ];
  const paragraphs = [
    zh
      ? '你的账号密码刚刚被修改。'
      : 'The password for your account was just changed.',
    ...details.filter((item): item is string => Boolean(item)),
    zh
      ? '如果不是你本人操作，请立即重置密码并检查账号安全。'
      : 'If this was not you, reset your password immediately and review your account security.'
  ];
  const action = params.forgotPasswordUrl
    ? {
        label: zh ? '重置密码' : 'Reset password',
        url: params.forgotPasswordUrl
      }
    : undefined;
  const footer = zh
    ? '这是一封安全通知邮件，无需回复。'
    : 'This is a security notification; no reply is needed.';
  return {
    subject: title,
    html: layout({ title, paragraphs, action, footer }),
    text: textBody([
      title,
      ...paragraphs,
      action ? `${action.label}: ${action.url}` : undefined,
      footer
    ])
  };
}
