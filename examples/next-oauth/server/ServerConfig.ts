import { CompositeEnvSource } from '@shared/env/CompositeEnvSource';
import type { EnvSourceInterface } from '@shared/env/EnvSourceInterface';
import { ProcessEnvSource } from '@shared/env/ProcessEnvSource';
import { runtimeEnvBridge } from '@shared/env/RuntimeEnvBridge';
import {
  logPrefixTemplate,
  resolveOAuthUpstreamProvider,
  type OAuthUpstreamId
} from '@config/common';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { name, version } from '../package.json';
import type { StringValue } from 'ms';

function parseCsvEnv(
  value: string | undefined,
  fallback?: string
): readonly string[] {
  const raw = value?.trim() ? value : fallback;
  if (!raw?.trim()) {
    return [];
  }
  return Object.freeze(
    raw
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  );
}

/**
 * Require `SITE_URL` and normalize it to always end with `/`.
 */
function requireSiteUrl(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('SITE_URL must be a non-empty string');
  }
  const trimmed = value.trim();
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

/**
 * 服务端配置：环境项经 `EnvSourceInterface` 惰性读。
 *
 * 默认读 `process.env`（本地 dotenv / 插件已写入）。
 * 可选 `bindPamenvBag`：袋优先，平台键回落进程；不依赖 `@pamenv/next`。
 * 构造期不要把密钥抄进字段，否则解封袋挂上之后读不到。
 */
export class ServerConfig implements SeedServerConfigInterface {
  public readonly name: string = name;
  public readonly version: string = version;

  protected envSource: EnvSourceInterface = ProcessEnvSource.INSTANCE;

  /**
   * 挂上解封袋，并同步 `runtimeEnvBridge` 给 Supabase 等不能注入 config 的模块。
   */
  public bindPamenvBag(bag: EnvSourceInterface): void {
    this.envSource = new CompositeEnvSource(bag, ProcessEnvSource.INSTANCE);
    runtimeEnvBridge.bind(this.envSource);
  }

  /**
   * login user token expires in
   *
   * @example '30 days'
   * @example '1 year'
   */
  public readonly jwtExpiresIn: StringValue = '30 days';

  /**
   * 公开地址。布局和 favicon 不走解封。
   * 必须静态读 `process.env.SITE_URL`，构建期 `inlineEnv` 才能写进包里。
   * 动态 `envSource.get` 拿不到这份内联。
   *
   * @override
   */
  public get siteUrl(): string {
    return requireSiteUrl(
      process.env.SITE_URL || this.envSource.get('SITE_URL')
    );
  }

  /**
   * @override
   */
  public get appHost(): string {
    return this.siteUrl;
  }

  /**
   * @override
   */
  public get env(): string {
    return this.envSource.get('APP_ENV') ?? 'development';
  }

  /**
   * @override
   */
  public get isProduction(): boolean {
    return this.envSource.get('APP_ENV') === 'production';
  }

  /**
   * @override
   */
  public get logLevel(): string {
    return (
      this.envSource.get('NEXT_PUBLIC_LOG_LEVEL') ??
      this.envSource.get('LOG_LEVEL') ??
      'info'
    );
  }

  /**
   * @override
   */
  public get userTokenKey(): string {
    return this.envSource.get('NEXT_PUBLIC_USER_TOKEN_KEY') ?? '';
  }

  /**
   * @override
   */
  public get jwtSecret(): string {
    return this.envSource.get('JWT_SECRET') ?? '';
  }

  /**
   * @override
   */
  public get openaiBaseUrl(): string {
    return this.envSource.get('CEREBRAS_BASE_URL') ?? '';
  }

  /**
   * @override
   */
  public get openaiApiKey(): string {
    return this.envSource.get('CEREBRAS_API_KEY') ?? '';
  }

  /**
   * @override
   */
  public get stringEncryptorKey(): string {
    return this.envSource.get('NEXT_PUBLIC_STRING_ENCRYPT_KEY') ?? '';
  }

  /**
   * @override
   */
  public get sessionSecret(): string {
    return this.envSource.get('SESSION_SECRET') ?? '';
  }

  /**
   * @override
   */
  public get encryptionKey(): string {
    return this.envSource.get('ENCRYPTION_KEY') ?? '';
  }

  /**
   * @override
   */
  public get apiCorsAllowedOrigins(): readonly string[] {
    return parseCsvEnv(this.envSource.get('API_CORS_ALLOWED_ORIGINS'));
  }

  /**
   * @override
   */
  public get apiCorsAllowedMethods(): readonly string[] {
    return parseCsvEnv(
      this.envSource.get('API_CORS_ALLOWED_METHODS'),
      'GET,POST,OPTIONS'
    );
  }

  /**
   * @override
   */
  public get logPrefixTemplate(): string {
    return this.envSource.get('LOG_PREFIX_TEMPLATE') ?? logPrefixTemplate;
  }

  /**
   * @override
   */
  public get oauthSessionKey(): string {
    return this.envSource.get('OAUTH_SESSION_KEY') ?? 'next_oauth_session';
  }

  /**
   * @override
   * Same `NEXT_PUBLIC_` key as AppConfig so client/server stay aligned.
   */
  public get oauthUpstreamProvider(): OAuthUpstreamId {
    return resolveOAuthUpstreamProvider(
      this.envSource.get('NEXT_PUBLIC_OAUTH_UPSTREAM_PROVIDER')
    );
  }
}
