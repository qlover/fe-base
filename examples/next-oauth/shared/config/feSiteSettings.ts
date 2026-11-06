export const FE_SITE_SETTING_KEYS = {
  AUTH_PHONE_LOGIN_ENABLED: 'auth.phone_login_enabled',
  /**
   * Phone OTP delivery channel.
   * - `memory`: app-owned codes (Admin 验证码监控可见明文)
   * - `supabase`: Supabase Auth SMS (需在 Supabase 启用 Phone)
   * - `aliyun`: 阿里云短信（见 aliyun_sms.*）
   */
  AUTH_PHONE_OTP_PROVIDER: 'auth.phone_otp_provider',
  AUTH_GITHUB_OAUTH_ENABLED: 'auth.github_oauth_enabled',
  AUTH_GOOGLE_OAUTH_ENABLED: 'auth.google_oauth_enabled',

  /** 阿里云短信 AccessKey ID。 */
  ALIYUN_SMS_ACCESS_KEY_ID: 'aliyun_sms.access_key_id',
  /** 阿里云短信 AccessKey Secret（敏感，加密存储）。 */
  ALIYUN_SMS_ACCESS_KEY_SECRET: 'aliyun_sms.access_key_secret',
  /** 短信签名（控制台已审）。 */
  ALIYUN_SMS_SIGN_NAME: 'aliyun_sms.sign_name',
  /** 短信模板 CODE（须含验证码变量，默认变量名 code）。 */
  ALIYUN_SMS_TEMPLATE_CODE: 'aliyun_sms.template_code',
  /**
   * 模板中验证码变量名，默认 `code`。
   * 对应 TemplateParam：`{"<key>":"<otp>"}`。
   */
  ALIYUN_SMS_TEMPLATE_PARAM_KEY: 'aliyun_sms.template_param_key',

  OPENAI_API_KEY: 'openai.api_key',
  OPENAI_BASE_URL: 'openai.base_url',

  /**
   * CORS rules: origin × path × methods.
   * Each rule: `{ origin, path, methods }`. Use `*` for any dimension.
   */
  API_CORS_RULES: 'api.cors_rules',

  /** 事务邮件通道：`disabled` | `memory` | `resend`。 */
  MAIL_PROVIDER: 'mail.provider',
  /** Resend API Key（敏感，加密存储）。 */
  MAIL_RESEND_API_KEY: 'mail.resend_api_key',
  MAIL_FROM_ADDRESS: 'mail.from_address',
  /** 发件人显示名，同时作为邮件模板里的站点名称。 */
  MAIL_FROM_NAME: 'mail.from_name',
  MAIL_REPLY_TO: 'mail.reply_to',
  /** 是否开放「忘记密码」邮件重置。 */
  MAIL_PASSWORD_RESET_ENABLED: 'mail.password_reset_enabled',
  /** 密码被修改后是否发送安全通知邮件。 */
  MAIL_PASSWORD_CHANGED_NOTIFY_ENABLED: 'mail.password_changed_notify_enabled',

  /** 预留：提交反馈后是否自动建 GitHub Issue（默认关；仅 Admin 手动 API）。 */
  GITHUB_FEEDBACK_SYNC_ENABLED: 'github.feedback_sync_enabled',
  GITHUB_APP_ID: 'github.app_id',
  GITHUB_APP_INSTALLATION_ID: 'github.app_installation_id',
  GITHUB_APP_PRIVATE_KEY: 'github.app_private_key',
  GITHUB_FEEDBACK_REPO: 'github.feedback_repo',
  GITHUB_WEBHOOK_SECRET: 'github.webhook_secret'
} as const;

export type FeSiteSettingKey =
  (typeof FE_SITE_SETTING_KEYS)[keyof typeof FE_SITE_SETTING_KEYS];

/** One CORS allow rule stored in site settings. */
export type FeCorsRule = {
  readonly origin: string;
  readonly path: string;
  readonly methods: readonly string[];
};

export type FeSiteSettingPrimitive = string | boolean | string[] | FeCorsRule[];

export type FeSiteSettingDefinition = {
  readonly key: FeSiteSettingKey;
  /** Short title shown in Admin UI. */
  readonly label: string;
  /** Help text for operators (Chinese). */
  readonly description: string;
  readonly isSensitive: boolean;
  readonly defaultValue?: FeSiteSettingPrimitive;
  /** Admin 用多行文本框编辑（如 PEM） */
  readonly multiline?: boolean;
  /** 无 ENCRYPTION_KEY 时拒绝保存（禁止明文落库） */
  readonly requiresEncryption?: boolean;
};

/** Sentinel: admin PATCH omits secret change when value equals this. */
export const FE_SITE_SETTING_SECRET_UNCHANGED = '__UNCHANGED__' as const;

export const FE_DEFAULT_CORS_RULES: readonly FeCorsRule[] = Object.freeze([
  {
    origin: 'http://localhost:3100',
    path: '*',
    methods: ['*']
  }
]);

export const FE_SITE_SETTING_DEFINITIONS: readonly FeSiteSettingDefinition[] =
  Object.freeze([
    {
      key: FE_SITE_SETTING_KEYS.AUTH_PHONE_LOGIN_ENABLED,
      label: '手机验证码登录',
      description:
        '是否在登录页展示「手机号」Tab。通道由「手机验证码通道」决定。',
      isSensitive: false,
      defaultValue: true
    },
    {
      key: FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER,
      label: '手机验证码通道',
      description:
        'memory：本地发码，Admin「验证码监控」可见明文；supabase：Supabase Auth SMS；aliyun：阿里云短信（下方配置）。',
      isSensitive: false,
      defaultValue: 'memory'
    },
    {
      key: FE_SITE_SETTING_KEYS.ALIYUN_SMS_ACCESS_KEY_ID,
      label: '阿里云 AccessKey ID',
      description: '短信通道为 aliyun 时必填。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.ALIYUN_SMS_ACCESS_KEY_SECRET,
      label: '阿里云 AccessKey Secret',
      description:
        '短信通道为 aliyun 时必填。必须配置 ENCRYPTION_KEY 加密存储，界面不回显明文。',
      isSensitive: true,
      requiresEncryption: true
    },
    {
      key: FE_SITE_SETTING_KEYS.ALIYUN_SMS_SIGN_NAME,
      label: '短信签名',
      description: '阿里云短信控制台已审核通过的签名名称。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.ALIYUN_SMS_TEMPLATE_CODE,
      label: '短信模板 CODE',
      description: '已审核模板代码；模板内容需包含验证码变量（默认变量名 code）。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.ALIYUN_SMS_TEMPLATE_PARAM_KEY,
      label: '模板验证码变量名',
      description: 'TemplateParam 中验证码字段名，默认 code。',
      isSensitive: false,
      defaultValue: 'code'
    },
    {
      key: FE_SITE_SETTING_KEYS.AUTH_GITHUB_OAUTH_ENABLED,
      label: 'GitHub 登录',
      description:
        '是否在登录页展示 GitHub OAuth 按钮。需在 Supabase Auth 中启用 GitHub 提供商。',
      isSensitive: false,
      defaultValue: true
    },
    {
      key: FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED,
      label: 'Google 登录',
      description:
        '是否在登录页展示 Google OAuth 按钮。需在 Supabase Auth 中启用 Google 提供商。',
      isSensitive: false,
      defaultValue: false
    },
    {
      key: FE_SITE_SETTING_KEYS.OPENAI_API_KEY,
      label: 'OpenAI 兼容 API Key',
      description:
        'OpenAI 或兼容网关（Cerebras、自建代理等）的 API 密钥。必须配置 ENCRYPTION_KEY 加密存储，界面不回显明文。',
      isSensitive: true,
      requiresEncryption: true
    },
    {
      key: FE_SITE_SETTING_KEYS.OPENAI_BASE_URL,
      label: 'OpenAI 兼容 Base URL',
      description:
        'Chat Completions 兼容接口根地址。示例：https://api.openai.com/v1',
      isSensitive: false
    },
    {
      key: FE_SITE_SETTING_KEYS.API_CORS_RULES,
      label: 'CORS 规则',
      description:
        '每条规则选择或填写：来源 Origin、API 路径、HTTP 方法。均可选 *；路径支持 /oauth/*。',
      isSensitive: false,
      defaultValue: [...FE_DEFAULT_CORS_RULES]
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_PROVIDER,
      label: '邮件通道',
      description:
        'disabled：关闭；memory：不真实发送，仅记录（Admin「邮件日志」可见正文，用于开发联调）；resend：通过 Resend 发送。与 Supabase Auth 自带邮件相互独立。',
      isSensitive: false,
      defaultValue: 'disabled'
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_RESEND_API_KEY,
      label: 'Resend API Key',
      description:
        '邮件通道为 resend 时必填。必须配置 ENCRYPTION_KEY 加密存储，界面不回显明文。',
      isSensitive: true,
      requiresEncryption: true
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_FROM_ADDRESS,
      label: '发件邮箱',
      description:
        '发件人邮箱地址；resend 通道需使用已在 Resend 验证的发信域名。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_FROM_NAME,
      label: '发件人名称',
      description:
        '发件人显示名，同时作为邮件模板中的站点名称；留空使用默认名称。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_REPLY_TO,
      label: '回复邮箱',
      description: '可选：用户回复邮件时的收件地址。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_PASSWORD_RESET_ENABLED,
      label: '忘记密码（邮件重置）',
      description:
        '开启后登录页展示「忘记密码」入口。仅 Supabase upstream 可用，且须先启用邮件通道（不走 Supabase Recovery）。',
      isSensitive: false,
      defaultValue: false
    },
    {
      key: FE_SITE_SETTING_KEYS.MAIL_PASSWORD_CHANGED_NOTIFY_ENABLED,
      label: '密码变更通知',
      description:
        '密码被修改（登录态修改或邮件重置）后，是否向用户邮箱发送安全通知。需先启用邮件通道。',
      isSensitive: false,
      defaultValue: false
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_SYNC_ENABLED,
      label: '反馈自动建 Issue（预留）',
      description:
        '开启表示允许自动同步；模板默认不在用户提交时调用，仅 Admin「创建 Issue」可用。',
      isSensitive: false,
      defaultValue: false
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_APP_ID,
      label: 'GitHub App ID',
      description: 'GitHub App 设置页顶部的 App ID（数字）。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_APP_INSTALLATION_ID,
      label: 'GitHub App Installation ID',
      description: 'App 安装到仓库后地址栏 /installations/ 后面的数字。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_APP_PRIVATE_KEY,
      label: 'GitHub App 私钥',
      description:
        'GitHub App 私钥（.pem 全文）。必须配置 ENCRYPTION_KEY 加密存储，界面不回显明文。',
      isSensitive: true,
      requiresEncryption: true,
      multiline: true
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_FEEDBACK_REPO,
      label: '反馈 Issue 仓库',
      description: '目标仓库，格式 owner/repo。',
      isSensitive: false,
      defaultValue: ''
    },
    {
      key: FE_SITE_SETTING_KEYS.GITHUB_WEBHOOK_SECRET,
      label: 'GitHub Webhook Secret',
      description:
        '用于校验 /api/webhooks/github 的 HMAC 签名。必须配置 ENCRYPTION_KEY。',
      isSensitive: true,
      requiresEncryption: true
    }
  ]);

const definitionByKey = new Map(
  FE_SITE_SETTING_DEFINITIONS.map((definition) => [definition.key, definition])
);

export function getFeSiteSettingDefinition(
  key: FeSiteSettingKey
): FeSiteSettingDefinition {
  const definition = definitionByKey.get(key);
  if (!definition) {
    throw new Error(`Unknown site setting key: ${key}`);
  }
  return definition;
}

export function isFeCorsRuleArray(value: unknown): value is FeCorsRule[] {
  // Structural check for Admin draft; authoritative validation is corsValueSchema.
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(
    (item) =>
      item !== null &&
      typeof item === 'object' &&
      typeof (item as FeCorsRule).origin === 'string' &&
      typeof (item as FeCorsRule).path === 'string' &&
      Array.isArray((item as FeCorsRule).methods) &&
      (item as FeCorsRule).methods.every((method) => typeof method === 'string')
  );
}

export const FE_PUBLIC_SITE_SETTING_KEYS = [
  FE_SITE_SETTING_KEYS.AUTH_PHONE_LOGIN_ENABLED,
  FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER,
  FE_SITE_SETTING_KEYS.AUTH_GITHUB_OAUTH_ENABLED,
  FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED,
  FE_SITE_SETTING_KEYS.MAIL_PASSWORD_RESET_ENABLED
] as const;

export type FePublicSiteSettingKey =
  (typeof FE_PUBLIC_SITE_SETTING_KEYS)[number];
