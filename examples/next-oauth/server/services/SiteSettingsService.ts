import { TokenEncryption } from '@qlover/next-kit/server';
import { inject, injectable } from '@shared/container';
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
import { SiteSettingsRepo } from '@server/repositorys/SiteSettingsRepo';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import {
  buildFeSiteSettingSeedRows,
  resolveFeSiteSettingDefaultValue
} from '@server/utils/feSiteSettingDefaults';
import {
  buildRuntimeCorsConfig,
  type RuntimeCorsConfig
} from '@server/utils/resolveRuntimeCorsConfig';
import type { LoggerInterface } from '@qlover/logger';

const CACHE_KEY = 'fe:site-settings:snapshot';
/** Process-local CORS hot path; no TTL — write-through on Admin save. */
export const FE_RUNTIME_CORS_CACHE_KEY = 'fe:runtime-cors-config';
const CACHE_TTL_MS = 60_000;

function parseCsvEnv(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

type SnapshotType = {
  readonly values: ReadonlyMap<string, FeSiteSettingPrimitive>;
  readonly sources: ReadonlyMap<string, 'db' | 'default'>;
  readonly descriptions: ReadonlyMap<string, string>;
};

type CachedSnapshotType = {
  readonly values: Record<string, FeSiteSettingPrimitive>;
  readonly sources: Record<string, 'db' | 'default'>;
  readonly descriptions: Record<string, string>;
};

function toCachedSnapshot(snapshot: SnapshotType): CachedSnapshotType {
  return {
    values: Object.fromEntries(snapshot.values),
    sources: Object.fromEntries(snapshot.sources),
    descriptions: Object.fromEntries(snapshot.descriptions)
  };
}

function fromCachedSnapshot(cached: CachedSnapshotType): SnapshotType {
  return {
    values: new Map(Object.entries(cached.values)),
    sources: new Map(Object.entries(cached.sources)),
    descriptions: new Map(Object.entries(cached.descriptions ?? {}))
  };
}

function resolveSettingDescription(
  definition: FeSiteSettingDefinition,
  storedDesc?: string
): string {
  const trimmed = storedDesc?.trim();
  return trimmed || definition.description;
}

@injectable()
export class SiteSettingsService {
  constructor(
    @inject(I.AppConfig)
    protected readonly serverConfig: SeedServerConfigInterface,
    @inject(SiteSettingsRepo)
    protected readonly repo: SiteSettingsRepo,
    @inject(MemoryKvCacheService)
    protected readonly cache: MemoryKvCacheService,
    @inject(I.Logger)
    protected readonly logger: LoggerInterface
  ) {}

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

  protected encryptSecret(plaintext: string): string {
    const encryption = this.tryCreateSecretEncryption();
    if (!encryption) {
      return plaintext;
    }
    return encryption.encrypt(plaintext);
  }

  protected decryptSecret(ciphertext: string): string {
    const encryption = this.tryCreateSecretEncryption();
    if (!encryption) {
      return ciphertext;
    }
    try {
      return encryption.decrypt(ciphertext);
    } catch (error) {
      this.logger.warn('Failed to decrypt site setting secret', { error });
      // Plaintext stored when ENCRYPTION_KEY was missing at write time.
      return ciphertext;
    }
  }

  public async invalidateCache(): Promise<void> {
    await this.cache.removeItem(CACHE_KEY);
  }

  public async getBoolean(key: FeSiteSettingKey): Promise<boolean> {
    const value = await this.getValue(key);
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true') {
        return true;
      }
      if (normalized === 'false') {
        return false;
      }
    }
    return false;
  }

  public async getString(key: FeSiteSettingKey): Promise<string> {
    const value = await this.getValue(key);
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (Array.isArray(value)) {
      return value.join(',');
    }
    return '';
  }

  public async getStringArray(key: FeSiteSettingKey): Promise<string[]> {
    const value = await this.getValue(key);
    if (Array.isArray(value)) {
      return value.filter(
        (entry): entry is string => typeof entry === 'string'
      );
    }
    if (typeof value === 'string' && value.trim()) {
      return parseCsvEnv(value);
    }
    return [];
  }

  public async getSecretString(key: FeSiteSettingKey): Promise<string> {
    const definition = getFeSiteSettingDefinition(key);
    if (!definition.isSensitive) {
      return this.getString(key);
    }

    const snapshot = await this.loadSnapshot();
    const stored = snapshot.values.get(key);
    if (typeof stored !== 'string' || !stored.trim()) {
      return '';
    }

    return this.decryptSecret(stored);
  }

  public async getValue(
    key: FeSiteSettingKey
  ): Promise<FeSiteSettingPrimitive> {
    const definition = getFeSiteSettingDefinition(key);
    const snapshot = await this.loadSnapshot();
    const stored = snapshot.values.get(key);
    if (stored !== undefined) {
      return stored;
    }
    return resolveFeSiteSettingDefaultValue(definition);
  }

  /**
   * CORS from `api.cors_rules`; cached in {@link MemoryKvCacheService} (no TTL).
   */
  public async getCorsConfig(): Promise<RuntimeCorsConfig> {
    return this.cache.getOrSet(FE_RUNTIME_CORS_CACHE_KEY, () =>
      this.loadCorsConfigFromStore()
    );
  }

  protected resolveDefaultCorsMethods(): readonly string[] {
    return this.serverConfig.apiCorsAllowedMethods.length > 0
      ? this.serverConfig.apiCorsAllowedMethods
      : Object.freeze(['GET', 'POST', 'OPTIONS']);
  }

  protected async loadCorsConfigFromStore(): Promise<RuntimeCorsConfig> {
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
      googleOauthEnabled
    ] = await Promise.all([
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_PHONE_LOGIN_ENABLED),
      this.getString(FE_SITE_SETTING_KEYS.AUTH_PHONE_OTP_PROVIDER),
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_GITHUB_OAUTH_ENABLED),
      this.getBoolean(FE_SITE_SETTING_KEYS.AUTH_GOOGLE_OAUTH_ENABLED)
    ]);

    return {
      auth: {
        phoneLoginEnabled,
        phoneOtpProvider: phoneOtpProvider.trim().toLowerCase() || 'memory',
        githubOauthEnabled,
        googleOauthEnabled
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
          source
        };
      }

      const value = stored ?? resolveFeSiteSettingDefaultValue(definition);

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
        rows.push({
          key: rawKey,
          value: this.encryptSecret(rawValue.trim()),
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

    await this.repo.upsertMany(rows);
    await this.invalidateCache();

    if (corsRulesForCache) {
      await this.cache.setItem(
        FE_RUNTIME_CORS_CACHE_KEY,
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
    await this.repo.upsertMany(missing);
  }

  protected async loadSnapshot(): Promise<SnapshotType> {
    const cached = await this.cache.getItem<CachedSnapshotType>(CACHE_KEY);
    if (cached) {
      return fromCachedSnapshot(cached);
    }

    let rows = await this.repo.getAll();
    if (rows.length < FE_SITE_SETTING_DEFINITIONS.length) {
      await this.ensureSeeded(new Set(rows.map((row) => row.key)));
      rows = await this.repo.getAll();
    }

    const values = new Map<string, FeSiteSettingPrimitive>();
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
        values.set(row.key, row.value as FeSiteSettingPrimitive);
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
      values.set(definition.key, resolveFeSiteSettingDefaultValue(definition));
      sources.set(definition.key, 'default');
    }

    const snapshot: SnapshotType = {
      values,
      sources,
      descriptions
    };

    await this.cache.setItem(CACHE_KEY, toCachedSnapshot(snapshot), {
      ttlMs: CACHE_TTL_MS
    });
    return snapshot;
  }
}
