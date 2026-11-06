import type { LoggerInterface } from '@qlover/logger';
import type { SiteSettingsServiceInterface } from '../interfaces/SiteSettingsServiceInterface';
import type { SiteSettingPrimitiveType } from '../interfaces/SiteSettingsServiceInterface';
import type { SiteSettingsStoreInterface } from '../interfaces/SiteSettingsStoreInterface';
import type { ApiCorsConfig } from '../utils/apiCors';
import type { TokenEncryption } from '../utils/TokenEncryption';
import type { KvCacheInterface, KvCacheSetOptions } from './MemoryKvCacheService';

export type SiteSettingsSnapshotType = {
  readonly values: ReadonlyMap<string, SiteSettingPrimitiveType>;
  readonly sources: ReadonlyMap<string, 'db' | 'default'>;
  readonly descriptions: ReadonlyMap<string, string>;
};

export type SiteSettingsCachedSnapshotType = {
  readonly values: Record<string, SiteSettingPrimitiveType>;
  readonly sources: Record<string, 'db' | 'default'>;
  readonly descriptions: Record<string, string>;
};

export type SiteSettingsKvCacheType = KvCacheInterface & {
  getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: KvCacheSetOptions
  ): Promise<T>;
};

function parseCsvEnv(value: string | undefined): string[] {
  if (!value?.trim()) {
    return [];
  }
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

/**
 * 站点设置抽象基类：缓存快照、密钥加解密钩子、CORS 热路径。
 * 应用子类提供键目录、默认值、种子与 Admin/Public 编排。
 */
export abstract class AbstractSiteSettingsService
  implements SiteSettingsServiceInterface
{
  constructor(
    protected readonly store: SiteSettingsStoreInterface,
    protected readonly cache: SiteSettingsKvCacheType,
    protected readonly logger: LoggerInterface
  ) {}

  protected abstract getSnapshotCacheKey(): string;
  protected abstract getCorsCacheKey(): string;
  protected abstract getSnapshotTtlMs(): number;
  protected abstract tryCreateSecretEncryption(): TokenEncryption | null;
  protected abstract isSensitiveKey(key: string): boolean;
  protected abstract resolveDefaultValue(
    key: string
  ): SiteSettingPrimitiveType;
  protected abstract loadCorsConfigFromStore(): Promise<ApiCorsConfig>;

  /**
   * 加载合并后的设置快照（含默认值）。
   */
  protected abstract buildSnapshot(): Promise<SiteSettingsSnapshotType>;

  protected toCachedSnapshot(
    snapshot: SiteSettingsSnapshotType
  ): SiteSettingsCachedSnapshotType {
    return {
      values: Object.fromEntries(snapshot.values),
      sources: Object.fromEntries(snapshot.sources),
      descriptions: Object.fromEntries(snapshot.descriptions)
    };
  }

  protected fromCachedSnapshot(
    cached: SiteSettingsCachedSnapshotType
  ): SiteSettingsSnapshotType {
    return {
      values: new Map(Object.entries(cached.values)),
      sources: new Map(Object.entries(cached.sources)),
      descriptions: new Map(Object.entries(cached.descriptions ?? {}))
    };
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
      return ciphertext;
    }
  }

  protected async loadSnapshot(): Promise<SiteSettingsSnapshotType> {
    const cached = (await this.cache.getItem(
      this.getSnapshotCacheKey()
    )) as SiteSettingsCachedSnapshotType | null;
    if (cached != null && typeof cached === 'object' && 'values' in cached) {
      return this.fromCachedSnapshot(cached);
    }

    const snapshot = await this.buildSnapshot();
    await this.cache.setItem(
      this.getSnapshotCacheKey(),
      this.toCachedSnapshot(snapshot),
      { ttlMs: this.getSnapshotTtlMs() }
    );
    return snapshot;
  }

  public async invalidateCache(): Promise<void> {
    await this.cache.removeItem(this.getSnapshotCacheKey());
  }

  public async getBoolean(key: string): Promise<boolean> {
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

  public async getString(key: string): Promise<string> {
    const value = await this.getValue(key);
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    if (Array.isArray(value)) {
      return value
        .map((entry) => (typeof entry === 'string' ? entry : ''))
        .filter(Boolean)
        .join(',');
    }
    return '';
  }

  public async getStringArray(key: string): Promise<string[]> {
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

  public async getSecretString(key: string): Promise<string> {
    if (!this.isSensitiveKey(key)) {
      return this.getString(key);
    }

    const snapshot = await this.loadSnapshot();
    const stored = snapshot.values.get(key);
    if (typeof stored !== 'string' || !stored.trim()) {
      return '';
    }

    return this.decryptSecret(stored);
  }

  public async getValue(key: string): Promise<SiteSettingPrimitiveType> {
    const snapshot = await this.loadSnapshot();
    const stored = snapshot.values.get(key);
    if (stored !== undefined) {
      return stored;
    }
    return this.resolveDefaultValue(key);
  }

  public async getCorsConfig(): Promise<ApiCorsConfig> {
    return this.cache.getOrSet(this.getCorsCacheKey(), () =>
      this.loadCorsConfigFromStore()
    );
  }
}
