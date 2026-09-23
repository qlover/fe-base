export const FE_SITE_SETTING_KEYS = {
  AUTH_PHONE_LOGIN_ENABLED: 'auth.phone_login_enabled',
  /**
   * Phone OTP delivery channel.
   * - `memory`: app-owned codes (Admin 验证码监控可见明文)
   * - `supabase`: Supabase Auth SMS (需在 Supabase 启用 Phone)
   * Add more providers (e.g. aliyun) via PhoneOtpProviderInterface.
   */
  AUTH_PHONE_OTP_PROVIDER: 'auth.phone_otp_provider',
  AUTH_GITHUB_OAUTH_ENABLED: 'auth.github_oauth_enabled',
  AUTH_GOOGLE_OAUTH_ENABLED: 'auth.google_oauth_enabled',

  OPENAI_API_KEY: 'openai.api_key',
  OPENAI_BASE_URL: 'openai.base_url',

  /**
   * CORS rules: origin × path × methods.
   * Each rule: `{ origin, path, methods }`. Use `*` for any dimension.
   */
  API_CORS_RULES: 'api.cors_rules'
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
        'memory：本地发码，Admin「验证码监控」可见明文；supabase：走 Supabase Auth SMS。新增短信商时实现 Provider 后在此切换。',
      isSensitive: false,
      defaultValue: 'memory'
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
        'OpenAI 或兼容网关（Cerebras、自建代理等）的 API 密钥。有 ENCRYPTION_KEY 时加密存储，界面不回显明文。',
      isSensitive: true
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
  FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED
] as const;

export type FePublicSiteSettingKey =
  (typeof FE_PUBLIC_SITE_SETTING_KEYS)[number];
