import {
  ResourceSearchParams,
  ResourceSearchResult,
  ResourceSortClause
} from '@qlover/corekit-bridge';
import { splitI18nKey, type LocalesSchema } from '@qlover/next-kit/common';
import { omit } from 'lodash-es';
import { revalidateTag } from 'next/cache';
import { inject, injectable } from '@shared/container';
import { useApiLocales } from '@config/common';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';
import { MemoryKvCacheService } from '@server/services/MemoryKvCacheService';
import {
  LocalesRepository,
  UpsertResult
} from '../repositorys/LocalesRepository';

export type ImportLocalesData = {
  namespace?: string;

  values: {
    [key in LocaleType]?: Record<string, string>;
  };
};

const LOCALE_DB_CACHE_PREFIX = 'fe:locales:db:';
const LOCALE_DB_CACHE_TTL_MS = i18nConfig.localeCacheTime * 1000;

@injectable()
export class ApiLocaleService {
  constructor(
    @inject(LocalesRepository)
    protected localesRepository: LocalesRepository,
    @inject(MemoryKvCacheService)
    protected readonly kv: MemoryKvCacheService
  ) {}

  public async getLocalesJson(
    localeName: string,
    _orderBy?: ResourceSortClause
  ): Promise<Record<string, string>> {
    const staticJson = await this.loadStaticLocaleJson(localeName);

    if (!useApiLocales) {
      return staticJson;
    }

    try {
      const fromDb = await this.kv.getOrSet(
        `${LOCALE_DB_CACHE_PREFIX}${localeName}`,
        () => this.localesRepository.getLocaleTextMap(localeName),
        { ttlMs: LOCALE_DB_CACHE_TTL_MS }
      );
      return { ...staticJson, ...fromDb };
    } catch {
      return staticJson;
    }
  }

  /**
   * Loads generated locale JSON from `public/locales`, including next_kit merge.
   *
   * @param localeName - Locale code
   */
  protected async loadStaticLocaleJson(
    localeName: string
  ): Promise<Record<string, string>> {
    if (!i18nConfig.supportedLngs.includes(localeName as LocaleType)) {
      return {};
    }

    // Static imports keep the bundler able to resolve locale JSON modules.
    const loaders: Record<
      LocaleType,
      () => Promise<{ default: Record<string, string> }>
    > = {
      en: () => import('@locales/en.json'),
      zh: () => import('@locales/zh.json')
    };

    const mod = await loaders[localeName as LocaleType]();
    const base = mod.default;

    try {
      const nextKitMod =
        localeName === 'zh'
          ? await import('@locales/next_kit.zh.json')
          : await import('@locales/next_kit.en.json');
      return { ...base, ...nextKitMod.default };
    } catch {
      return base;
    }
  }

  public async getLocales(
    params: ResourceSearchParams
  ): Promise<ResourceSearchResult<LocalesSchema>> {
    return this.localesRepository.pagination(params);
  }

  public async listNamespaces(): Promise<string[]> {
    return this.localesRepository.listNamespaces();
  }

  public async update(data: Partial<LocalesSchema>): Promise<void> {
    if (!data.id || typeof data.id !== 'number') {
      throw new Error(
        'ID is required and must be a number for update operation'
      );
    }

    await this.localesRepository.updateById(
      data.id,
      omit(data, ['id', 'created_at'])
    );

    await this.invalidateLocaleCaches();
  }

  public async create(data: Partial<LocalesSchema>): Promise<void> {
    await this.localesRepository.add(data as LocalesSchema);

    await this.invalidateLocaleCaches();
  }

  public async importLocales(data: ImportLocalesData): Promise<UpsertResult> {
    const { namespace = 'common', values } = data;

    const result: Record<string, Record<string, string>> = {};

    Object.entries(values).forEach(([locale, values2]) => {
      Object.entries(values2).forEach(([key, value]) => {
        if (!result[key]) {
          result[key] = {};
        }

        result[key]!['value'] = key;
        result[key]![locale] = value;

        if (locale === i18nConfig.fallbackLng) {
          result[key]!['description'] = value;
        }

        const { namespace: namespace2 } = splitI18nKey(key);
        result[key]!['namespace'] = namespace2 || namespace;
      });
    });

    const localesSchemas = Object.values(result) as Partial<LocalesSchema>[];

    // Use batch upsert method with chunk processing
    const upsertResult = await this.localesRepository.upsert(localesSchemas, {
      chunkSize: 100, // 100 items per chunk
      concurrency: 3 // max 3 concurrent requests
    });

    if (upsertResult.successCount > 0) {
      await this.invalidateLocaleCaches();
    }

    return upsertResult;
  }

  /**
   * Clears MemoryKv locale overrides + Next data-cache tags (CDN / route).
   */
  protected async invalidateLocaleCaches(): Promise<void> {
    await this.kv.removeByPrefix(LOCALE_DB_CACHE_PREFIX);
    await Promise.all(
      i18nConfig.supportedLngs.map((locale) =>
        revalidateTag(`i18n-${locale}`, 'default')
      )
    );
  }
}
