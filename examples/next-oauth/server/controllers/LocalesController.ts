import { ResourceSortClause } from '@qlover/corekit-bridge';
import { filterMessagesByNamespace } from '@/i18n/loadMessages';
import { inject, injectable } from '@shared/container';
import { i18nConfig } from '@config/i18n';
import type { LocaleType } from '@config/i18n';
import { ApiLocaleService } from '../services/ApiLocaleService';

export interface LocalesControllerJsonQuery {
  locale: string;
  orderBy?: ResourceSortClause;
  /** Comma-separated namespaces, e.g. `api,common` or `admin_locales`. */
  namespaces?: string;
}

@injectable()
export class LocalesController {
  constructor(
    @inject(ApiLocaleService)
    protected apiLocaleService: ApiLocaleService
  ) {}

  public async json(query: unknown): Promise<Record<string, string>> {
    const parsed = query as LocalesControllerJsonQuery;
    const locale = parsed.locale;

    if (!locale || !i18nConfig.supportedLngs.includes(locale as LocaleType)) {
      return {};
    }

    const result = await this.apiLocaleService.getLocalesJson(
      locale,
      parsed.orderBy
    );

    return filterMessagesByNamespace(
      result,
      this.parseNamespaces(parsed.namespaces)
    );
  }

  /**
   * @param raw - `api,common` / `admin_locales` or undefined (all namespaces)
   */
  protected parseNamespaces(raw: string | undefined): string[] | undefined {
    if (!raw?.trim()) {
      return undefined;
    }
    const list = raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return list.length > 0 ? list : undefined;
  }
}
