import { inject, injectable } from 'inversify';
import { LocalesRepository } from '../repositorys/LocalesRepository';
import type { LocalesRepositoryInterface } from '../port/LocalesRepositoryInterface';

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
}
