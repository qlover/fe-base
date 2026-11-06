import { Base64Serializer } from '@qlover/fe-corekit/serializer';
import { StringEncryptor } from '@qlover/next-kit/common';
import {
  AbstractSiteSettingsService,
  TokenEncryption,
  buildRuntimeCorsConfig,
  type RuntimeCorsConfigType,
  type SiteSettingPrimitiveType,
  type SiteSettingsSnapshotType
} from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
import { oauthUpstreamProviders } from '@config/common';
import {
  FE_DEFAULT_CORS_RULES,
  FE_SITE_SETTING_DEFINITIONS,
  FE_SITE_SETTING_KEYS,
  FE_SITE_SETTING_SECRET_UNCHANGED,
  getFeSiteSettingDefinition,
  type FeCorsRule,
  type FeSiteSettingDefinition,
  type FeSiteSettingKey,
  type FeSiteSettingPrimitive
} from '@config/feSiteSettings';
import { I } from '@config/ioc-identifiter';
import type {
  FeAdminSiteSettingEntry,
  FeAdminSiteSettingsPatch,
  FePublicConfig
} from '@schemas/FeSiteSettingsSchema';
import {
  isFeSiteSettingKey,
  parseCorsValue,
  safeParseCorsValue
} from '@schemas/FeSiteSettingsSchema';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import { SiteSettingEncryptionRequiredError } from '@server/errors/SiteSettingEncryptionRequiredError';
import { SiteSettingInvalidSecretError } from '@server/errors/SiteSettingInvalidSecretError';
import { SiteSettingsRepo } from '@server/repositorys/SiteSettingsRepo';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import {
  buildFeSiteSettingSeedRows,
  resolveFeSiteSettingDefaultValue
} from '@server/utils/feSiteSettingDefaults';
import type { LoggerInterface } from '@qlover/logger';

const SNAPSHOT_CACHE_KEY = 'site-settings:snapshot';
/** Process-local CORS hot path; no TTL — write-through on Admin save. */
export const RUNTIME_CORS_CACHE_KEY = 'runtime-cors-config';
/** @deprecated 使用 {@link RUNTIME_CORS_CACHE_KEY} */
export const FE_RUNTIME_CORS_CACHE_KEY = RUNTIME_CORS_CACHE_KEY;
const CACHE_TTL_MS = 60_000;

function resolveSettingDescription(
  definition: FeSiteSettingDefinition,
  storedDesc?: string
): string {
  const trimmed = storedDesc?.trim();
  return trimmed || definition.description;
}

/**
 * next-oauth 站点设置：键目录 / Public / Admin；通用读写与 CORS 在 kit 基类。
 */
@injectable()
export class SiteSettingsService extends AbstractSiteSettingsService {
  protected readonly base64Serializer = new Base64Serializer();

  constructor(
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(SiteSettingsRepo)
    repo: SiteSettingsRepo,
    @inject(MemoryKvCacheService)
    cache: MemoryKvCacheService,
    @inject(I.Logger)
    logger: LoggerInterface
  ) {
    super(repo, cache, logger);
  }

  protected getSnapshotCacheKey(): string {
    return SNAPSHOT_CACHE_KEY;
  }

  protected getCorsCacheKey(): string {
    return RUNTIME_CORS_CACHE_KEY;
  }

  protected getSnapshotTtlMs(): number {
    return CACHE_TTL_MS;
  }

  protected tryCreateSecretEncryption(): TokenEncryption | null {
    const key = this.serverConfig.encryptionKey?.trim();
    if (!key) {
      return null;
    }
    try {
      return new TokenEncryption(key);
    } catch (error) {
      this.logger.warn('Invalid ENCRYPTION_KEY for site settings', { error });
      return null;
    }
  }

  protected isSensitiveKey(key: string): boolean {
    if (!isFeSiteSettingKey(key)) {
      return false;
    }
    return getFeSiteSettingDefinition(key).isSensitive;
  }

  protected resolveDefaultValue(key: string): SiteSettingPrimitiveType {
    if (!isFeSiteSettingKey(key)) {
      return '';
    }
    return resolveFeSiteSettingDefaultValue(
      getFeSiteSettingDefinition(key)
    ) as SiteSettingPrimitiveType;
  }

  /**
   * 管理端提交的敏感值经 `stringEncryptorKey` 传输加密；解出空串或含控制字符视为非法。
   */
  protected decryptTransitSecret(settingKey: string, transit: string): string {
    let plain = '';
    try {
      plain = new StringEncryptor(
        this.serverConfig.stringEncryptorKey,
        this.base64Serializer
      )
        .decrypt(transit)
        .trim();
    } catch {
      plain = '';
    }

    if (
      !plain ||
      /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/.test(plain)
    ) {
      throw new SiteSettingInvalidSecretError(settingKey);
    }
    return plain;
  }

  public async getBoolean(key: FeSiteSettingKey): Promise<boolean> {
    return super.getBoolean(key);
  }

  public async getString(key: FeSiteSettingKey): Promise<string> {
    return super.getString(key);
  }

  public async getStringArray(key: FeSiteSettingKey): Promise<string[]> {
    return super.getStringArray(key);
  }

  public async getSecretString(key: FeSiteSettingKey): Promise<string> {
    return super.getSecretString(key);
  }

  public async getValue(
    key: FeSiteSettingKey
  ): Promise<FeSiteSettingPrimitive> {
    return (await super.getValue(key)) as FeSiteSettingPrimitive;
  }

  public async getCorsConfig(): Promise<RuntimeCorsConfigType> {
    return (await super.getCorsConfig()) as RuntimeCorsConfigType;
  }

  protected resolveDefaultCorsMethods(): readonly string[] {
    return this.serverConfig.apiCorsAllowedMethods.length > 0
      ? this.serverConfig.apiCorsAllowedMethods
      : Object.freeze(['GET', 'POST', 'OPTIONS']);
  }

  protected async loadCorsConfigFromStore(): Promise<RuntimeCorsConfigType> {
    const rulesRaw = await this.getValue(FE_SITE_SETTING_KEYS.API_CORS_RULES);
    const apiCorsAllowedMethods = this.resolveDefaultCorsMethods();
    const parsedRules = this.normalizeCorsRules(rulesRaw);

    if (parsedRules.length > 0) {
      return buildRuntimeCorsConfig(parsedRules, apiCorsAllowedMethods);
    }

    const envOrigins = this.serverConfig.apiCorsAllowedOrigins;
    const envRules: FeCorsRule[] = envOrigins.map((origin) => ({
      origin,
      path: '*',
      methods: ['*']
    }));

    return buildRuntimeCorsConfig(
      envRules.length > 0 ? envRules : [...FE_DEFAULT_CORS_RULES],
      apiCorsAllowedMethods
    );
  }

  protected normalizeCorsRules(value: FeSiteSettingPrimitive): FeCorsRule[] {
    const parsed = safeParseCorsValue(value);
    if (parsed) {
      return parsed;
    }
    if (Array.isArray(value) && value.length > 0) {
      this.logger.warn('Invalid api.cors_rules in store; falling back', {
        sample: value[0]
      });
    }
    return [];
  }

  public async getPublicConfig(): Promise<FePublicConfig> {
    const [
      phoneLoginEnabled,
      phoneOtpProvider,
      githubOauthEnabled,
      googleOauthEnabled,
      passwordResetFlag,
      mailProvider
    ] = await Promise.all([
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_PHONE_LOGIN_ENABLED),
      this.getString(FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER),
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_GITHUB_OAUTH_ENABLED),
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED),
      this.getBoolean(FE_SITE_SETTING_KEYS.MAIL_PASSWORD_RESET_ENABLED),
      this.getString(FE_SITE_SETTING_KEYS.MAIL_PROVIDER)
    ]);

    const mailReady = ['memory', 'resend'].includes(
      mailProvider.trim().toLowerCase()
    );
    const passwordResetEnabled =
      passwordResetFlag &&
      mailReady &&
      this.serverConfig.oauthUpstreamProvider !==
        oauthUpstreamProviders.brainUser;

    return {
      auth: {
        phoneLoginEnabled,
        phoneOtpProvider: phoneOtpProvider.trim().toLowerCase() || 'memory',
        githubOauthEnabled,
        googleOauthEnabled,
        passwordResetEnabled
      }
    };
  }

  public async getAdminSettings(): Promise<FeAdminSiteSettingEntry[]> {
    const snapshot = await this.loadSnapshot();
    return FE_SITE_SETTING_DEFINITIONS.map((definition) => {
      const stored = snapshot.values.get(definition.key);
      const source = snapshot.sources.get(definition.key) ?? 'default';

      if (definition.isSensitive) {
        const configured =
          source === 'db' &&
          typeof stored === 'string' &&
          stored.trim().length > 0;
        return {
          key: definition.key,
          label: definition.label,
          description: resolveSettingDescription(
            definition,
            snapshot.descriptions.get(definition.key)
          ),
          value: configured ? FE_SITE_SETTING_SECRET_UNCHANGED : '',
          configured,
          isSensitive: true,
          multiline: definition.multiline === true,
          source
        };
      }

      const value =
        (stored as FeSiteSettingPrimitive | undefined) ??
        resolveFeSiteSettingDefaultValue(definition);

      return {
        key: definition.key,
        label: definition.label,
        description: resolveSettingDescription(
          definition,
          snapshot.descriptions.get(definition.key)
        ),
        value,
        configured: source === 'db',
        isSensitive: false,
        multiline: definition.multiline === true,
        source
      };
    });
  }

  public async updateAdminSettings(
    patch: FeAdminSiteSettingsPatch
  ): Promise<FeAdminSiteSettingEntry[]> {
    const rows: {
      key: string;
      value: unknown;
      description: string;
      isSensitive: boolean;
    }[] = [];
    let corsRulesForCache: FeCorsRule[] | undefined;

    for (const [rawKey, rawValue] of Object.entries(patch.settings)) {
      if (!isFeSiteSettingKey(rawKey)) {
        continue;
      }

      const definition = getFeSiteSettingDefinition(rawKey);

      if (definition.isSensitive) {
        if (
          typeof rawValue !== 'string' ||
          !rawValue.trim() ||
          rawValue === FE_SITE_SETTING_SECRET_UNCHANGED
        ) {
          continue;
        }
        if (
          definition.requiresEncryption === true &&
          this.tryCreateSecretEncryption() === null
        ) {
          throw new SiteSettingEncryptionRequiredError(rawKey);
        }
        rows.push({
          key: rawKey,
          value: this.encryptSecret(
            this.decryptTransitSecret(rawKey, rawValue.trim())
          ),
          description: definition.description,
          isSensitive: true
        });
        continue;
      }

      if (rawKey === FE_SITE_SETTING_KEYS.API_CORS_RULES) {
        const parsed = parseCorsValue(rawValue);
        rows.push({
          key: rawKey,
          value: parsed,
          description: definition.description,
          isSensitive: false
        });
        corsRulesForCache = parsed;
        continue;
      }

      rows.push({
        key: rawKey,
        value: rawValue,
        description: definition.description,
        isSensitive: false
      });
    }

    await this.store.upsertMany(rows);
    await this.invalidateCache();

    if (corsRulesForCache) {
      await this.cache.setItem(
        RUNTIME_CORS_CACHE_KEY,
        buildRuntimeCorsConfig(
          corsRulesForCache,
          this.resolveDefaultCorsMethods()
        )
      );
    }

    return this.getAdminSettings();
  }

  protected async ensureSeeded(
    existingKeys: ReadonlySet<string>
  ): Promise<void> {
    const missing = buildFeSiteSettingSeedRows().filter(
      (row) => !existingKeys.has(row.key)
    );
    if (missing.length === 0) {
      return;
    }
    await this.store.upsertMany(missing);
  }

  protected async buildSnapshot(): Promise<SiteSettingsSnapshotType> {
    let rows = await this.store.getAll();
    if (rows.length < FE_SITE_SETTING_DEFINITIONS.length) {
      await this.ensureSeeded(new Set(rows.map((row) => row.key)));
      rows = await this.store.getAll();
    }

    const values = new Map<string, SiteSettingPrimitiveType>();
    const sources = new Map<string, 'db' | 'default'>();
    const descriptions = new Map<string, string>();

    for (const row of rows) {
      if (!isFeSiteSettingKey(row.key)) {
        continue;
      }
      const definition = getFeSiteSettingDefinition(row.key);
      if (definition.isSensitive) {
        values.set(row.key, String(row.value ?? ''));
      } else {
        values.set(row.key, row.value as SiteSettingPrimitiveType);
      }
      sources.set(row.key, 'db');
      if (row.description?.trim()) {
        descriptions.set(row.key, row.description.trim());
      }
    }

    for (const definition of FE_SITE_SETTING_DEFINITIONS) {
      if (values.has(definition.key)) {
        continue;
      }
      values.set(
        definition.key,
        resolveFeSiteSettingDefaultValue(definition) as SiteSettingPrimitiveType
      );
      sources.set(definition.key, 'default');
    }

    return { values, sources, descriptions };
  }
}
