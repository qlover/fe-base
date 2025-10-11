import { inject, injectable } from 'inversify';
import { revalidateTag } from 'next/cache';
import type { LocalesSchema } from '@migrations/schema/LocalesSchema';
import { LocalesRepository } from '../repositorys/LocalesRepository';
import type { LocalesRepositoryInterface } from '../port/LocalesRepositoryInterface';
import type { PaginationInterface } from '../port/PaginationInterface';

@injectable()
export class ApiLocaleService {
  constructor(
    @inject(LocalesRepository)
    protected localesRepository: LocalesRepositoryInterface
  ) {}

  async getLocalesJson(localeName: string): Promise<Record<string, string>> {
    const locales = await this.localesRepository.getLocales(localeName);
    return locales.reduce(
      (acc, locale) => {
        // @ts-expect-error localeName is valid
        acc[locale.value] = locale[localeName];
        return acc;
      },
      {} as Record<string, string>
    );
  }

  async getlocales(params: {
    page: number;
    pageSize: number;
  }): Promise<PaginationInterface<LocalesSchema>> {
    return this.localesRepository.pagination(params);
  }

  async updateLocale(data: Partial<LocalesSchema>) {
    await this.localesRepository.update(data);
    // 清除所有支持的语言的缓存
    const revalidatePromises = i18nConfig.supportedLngs.map(async (locale) => {
      await revalidateTag(`i18n-${locale}`);
    });
    await Promise.all(revalidatePromises);
  }
}
