import { inject, injectable } from 'inversify';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { ApiLocaleService } from '../services/ApiLocaleService';
import type {
  LocalesControllerInterface,
  LocalesControllerJsonQuery
} from '../port/LocalesControllerInterface';

@injectable()
export class LocalesController implements LocalesControllerInterface {
  constructor(
    @inject(ApiLocaleService)
    protected apiLocaleService: ApiLocaleService
  ) {}

  /**
   * @override
   */
  public async json(
    query: LocalesControllerJsonQuery
  ): Promise<Record<string, string>> {
    const locale = query.locale as LocaleType;

    if (!locale || !i18nConfig.supportedLngs.includes(locale)) {
      return {};
    }

    const result = await this.apiLocaleService.getLocalesJson(
      locale,
      query.orderBy
    );

    return result;
  }
}
