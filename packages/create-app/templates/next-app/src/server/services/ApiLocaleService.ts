import { inject, injectable } from 'inversify';
import { revalidateTag } from 'next/cache';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import { i18nConfig } from '@config/i18n';
import { LocalesRepository } from '../repositorys/LocalesRepository';
import type { BridgeOrderBy } from '../port/DBBridgeInterface';
import type { LocalesRepositoryInterface } from '../port/LocalesRepositoryInterface';
import type { PaginationInterface } from '../port/PaginationInterface';

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

  async getLocales(params: {
    page: number;
    pageSize: number;
    orderBy?: BridgeOrderBy;
  }): Promise<PaginationInterface<LocalesSchema>> {
    return this.localesRepository.pagination({
      page: params.page,
      pageSize: params.pageSize,
      orderBy: params.orderBy
    });
  }

  async update(data: Partial<LocalesSchema>): Promise<void> {
    await this.localesRepository.updateById(
      data.id!,
      data as Omit<LocalesSchema, 'id' | 'created_at'>
    );

    // 清除所有支持的语言的缓存
    const revalidatePromises = i18nConfig.supportedLngs.map(async (locale) => {
      await revalidateTag(`i18n-${locale}`);
    });
    await Promise.all(revalidatePromises);
  }
}
