import { ResourceSortClause } from '@qlover/corekit-bridge';
import { inject, injectable } from '@shared/container';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { ApiLocaleService } from '../services/ApiLocaleService';

export interface LocalesControllerJsonQuery {
  locale: string;
  orderBy?: ResourceSortClause;
}

@injectable()
export class LocalesController {
  constructor(
    @inject(ApiLocaleService)
    protected apiLocaleService: ApiLocaleService
  ) {}

  public async json(query: unknown): Promise<Record<string, string>> {
    const locale = (query as LocalesControllerJsonQuery).locale;

    if (!locale || !i18nConfig.supportedLngs.includes(locale as LocaleType)) {
      return {};
    }

    const result = await this.apiLocaleService.getLocalesJson(
      locale,
      (query as LocalesControllerJsonQuery).orderBy
    );

    return result;
  }
}
