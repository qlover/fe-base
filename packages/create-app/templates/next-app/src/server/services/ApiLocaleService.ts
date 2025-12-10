import { inject, injectable } from 'inversify';
import { omit } from 'lodash';
import { revalidateTag } from 'next/cache';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import type { LocaleType } from '@config/i18n';
import { i18nConfig } from '@config/i18n';
import { splitI18nKey } from '@config/i18n/i18nKeyScheam';
import { LocalesRepository } from '../repositorys/LocalesRepository';
import type { BridgeOrderBy } from '../port/DBBridgeInterface';
import type {
  LocalesRepositoryInterface,
  UpsertResult
} from '../port/LocalesRepositoryInterface';
import type { PaginationInterface } from '../port/PaginationInterface';

export type ImportLocalesData = {
  namespace?: string;

  values: {
    [key in LocaleType]?: Record<string, string>;
  };
};

export type GetLocalesParams = {
  page: number;
  pageSize: number;
  orderBy?: BridgeOrderBy;
};

@injectable()
export class ApiLocaleService {
  constructor(
    @inject(LocalesRepository)
    protected localesRepository: LocalesRepositoryInterface
  ) {}

  async getLocalesJson(
    localeName: string,
    orderBy?: BridgeOrderBy
  ): Promise<Record<string, string>> {
    const locales = await this.localesRepository.getLocales(
      localeName,
      orderBy
    );
    return locales.reduce(
      (acc, locale) => {
        // @ts-expect-error localeName is valid
        acc[locale.value] = locale[localeName];
        return acc;
      },
      {} as Record<string, string>
    );
  }

  async getLocales(
    params: GetLocalesParams
  ): Promise<PaginationInterface<LocalesSchema>> {
    return this.localesRepository.pagination({
      page: params.page,
      pageSize: params.pageSize,
      orderBy: params.orderBy
    });
  }

  async update(data: Partial<LocalesSchema>): Promise<void> {
    if (!data.id || typeof data.id !== 'number') {
      throw new Error(
        'ID is required and must be a number for update operation'
      );
    }

    await this.localesRepository.updateById(
      data.id,
      omit(data, ['id', 'created_at'])
    );

    // 清除所有支持的语言的缓存
    const revalidatePromises = i18nConfig.supportedLngs.map(async (locale) => {
      await revalidateTag(`i18n-${locale}`, 'default');
    });
    await Promise.all(revalidatePromises);
  }

  async create(data: Partial<LocalesSchema>): Promise<void> {
    await this.localesRepository.add(data as LocalesSchema);

    // 清除所有支持的语言的缓存
    const revalidatePromises = i18nConfig.supportedLngs.map(async (locale) => {
      await revalidateTag(`i18n-${locale}`, 'default');
    });
    await Promise.all(revalidatePromises);
  }

  async importLocales(data: ImportLocalesData): Promise<UpsertResult> {
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

    // Clear cache for all supported languages if any data was successfully imported
    if (upsertResult.successCount > 0) {
      const revalidatePromises = i18nConfig.supportedLngs.map(
        async (locale) => {
          await revalidateTag(`i18n-${locale}`, 'default');
        }
      );
      await Promise.all(revalidatePromises);
    }

    return upsertResult;
  }
}
