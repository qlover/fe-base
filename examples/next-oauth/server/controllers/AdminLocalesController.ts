import { SearchParamsValidator, splitI18nKey } from '@qlover/next-kit/common';
import { inject, injectable } from '@shared/container';
import { i18nConfig, type LocaleType } from '@config/i18n';
import {
  adminLocaleCreateSchema,
  adminLocaleUpdateSchema,
  isSupportedAdminLocale,
  type AdminLocaleItem,
  type AdminLocalesImportResult
} from '@schemas/AdminLocalesSchema';
import {
  ApiLocaleService,
  type ImportLocalesData
} from '@server/services/ApiLocaleService';
import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type {
  LocalesSchema,
  ValidatorInterface
} from '@qlover/next-kit/common';

@injectable()
export class AdminLocalesController {
  constructor(
    @inject(SearchParamsValidator)
    protected readonly searchParamsValidator: ValidatorInterface<ResourceSearchParams>,
    @inject(ApiLocaleService)
    protected readonly apiLocaleService: ApiLocaleService
  ) {}

  /**
   * List locale rows for **one** language (default: fallback / query `locale`).
   */
  public async search(
    query: unknown
  ): Promise<ResourceSearchResult<AdminLocaleItem>> {
    const criteria = await this.searchParamsValidator.getThrow(query);
    const locale = this.readLocale(query);
    const namespace = this.readStringParam(query, 'namespace');

    const prev =
      criteria.filters != null &&
      typeof criteria.filters === 'object' &&
      !Array.isArray(criteria.filters)
        ? (criteria.filters as Record<string, unknown>)
        : {};
    criteria.filters = {
      ...prev,
      locale,
      ...(namespace ? { namespace } : {})
    };

    const result = await this.apiLocaleService.getLocales(criteria);
    return {
      ...result,
      items: result.items.map((row) => this.toAdminItem(row, locale))
    };
  }

  /** Distinct namespaces for exact filter select. */
  public async listNamespaces(): Promise<string[]> {
    return this.apiLocaleService.listNamespaces();
  }

  public async create(body: unknown): Promise<AdminLocaleItem | null> {
    const parsed = adminLocaleCreateSchema.parse(body);
    const { namespace: fromKey } = splitI18nKey(parsed.value);
    const namespace = parsed.namespace?.trim() || fromKey || 'common';
    const description = parsed.description?.trim() || parsed.text || '';

    const row: Partial<LocalesSchema> = {
      value: parsed.value,
      description,
      namespace,
      en: '',
      zh: ''
    };
    row[parsed.locale] = parsed.text;

    await this.apiLocaleService.create(row);

    const result = await this.apiLocaleService.getLocales({
      page: 1,
      pageSize: 1,
      keyword: parsed.value,
      filters: { namespace, locale: parsed.locale }
    });

    const found =
      result.items.find((item) => item.value === parsed.value) ??
      result.items[0];
    return found ? this.toAdminItem(found, parsed.locale) : null;
  }

  public async update(body: unknown): Promise<{ ok: true }> {
    const parsed = adminLocaleUpdateSchema.parse(body);
    const patch: Partial<LocalesSchema> = {
      id: parsed.id
    };
    if (parsed.text !== undefined) {
      patch[parsed.locale] = parsed.text;
    }
    if (parsed.description !== undefined) {
      patch.description = parsed.description;
    }
    // value / namespace are immutable after create — change requires delete + recreate.
    await this.apiLocaleService.update(patch);
    return { ok: true };
  }

  /**
   * Seed / refresh DB from bundled `@locales/{en,zh}.json`.
   */
  public async importFromStatic(): Promise<AdminLocalesImportResult> {
    const [en, zh] = await Promise.all([
      import('@locales/en.json').then(
        (m) => m.default as Record<string, string>
      ),
      import('@locales/zh.json').then(
        (m) => m.default as Record<string, string>
      )
    ]);

    const data: ImportLocalesData = {
      values: { en, zh }
    };

    const result = await this.apiLocaleService.importLocales(data);
    return {
      totalCount: result.totalCount,
      successCount: result.successCount,
      failureCount: result.failureCount
    };
  }

  protected toAdminItem(
    row: LocalesSchema,
    locale: LocaleType
  ): AdminLocaleItem {
    return {
      id: row.id,
      value: row.value,
      namespace: row.namespace,
      description: row.description,
      locale,
      text: row[locale] ?? '',
      updated_at: row.updated_at
    };
  }

  protected readLocale(query: unknown): LocaleType {
    const raw = this.readStringParam(query, 'locale');
    if (raw && isSupportedAdminLocale(raw)) {
      return raw;
    }
    return i18nConfig.fallbackLng;
  }

  protected readStringParam(query: unknown, key: string): string | undefined {
    if (query instanceof URLSearchParams) {
      const value = query.get(key)?.trim();
      return value || undefined;
    }
    if (
      query != null &&
      typeof query === 'object' &&
      !Array.isArray(query) &&
      key in query &&
      typeof (query as Record<string, unknown>)[key] === 'string'
    ) {
      const value = ((query as Record<string, unknown>)[key] as string).trim();
      return value || undefined;
    }
    return undefined;
  }
}
