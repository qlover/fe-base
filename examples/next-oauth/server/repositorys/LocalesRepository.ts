import {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import { localesSchema, type LocalesSchema } from '@qlover/next-kit/common';
import { inject, injectable } from '@shared/container';
import { createAdminClient, createServerClient } from '@shared/supabase/server';
import { defaultSearchParams } from '@config/common';
import { FeTables } from '@config/feTables';
import { i18nConfig, type LocaleType } from '@config/i18n';
import { I } from '@config/ioc-identifiter';
import { FeSupabaseRepo } from './FeSupabaseRepo';
import type { LoggerInterface } from '@qlover/logger';

export interface UpsertChunkResult {
  success: boolean;
  chunkIndex: number;
  inputData: Partial<LocalesSchema>[];
  returnedData?: LocalesSchema[];
  affectedCount?: number;
  error?: string;
}

export interface UpsertResult {
  totalCount: number;
  successCount: number;
  failureCount: number;
  successChunks: UpsertChunkResult[];
  failureChunks: UpsertChunkResult[];
  allReturnedData: LocalesSchema[];
}

function chunkArray<T>(items: T[], size: number): T[][] {
  if (size <= 0) {
    return [items];
  }
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function runWithConcurrency<T>(
  tasks: Array<() => Promise<T>>,
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < tasks.length) {
      const current = nextIndex;
      nextIndex += 1;
      results[current] = await tasks[current]!();
    }
  }

  const workers = Array.from(
    { length: Math.max(1, Math.min(concurrency, tasks.length || 1)) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

@injectable()
export class LocalesRepository extends FeSupabaseRepo<LocalesSchema> {
  protected safeFields = Object.keys(localesSchema.shape);

  constructor(@inject(I.Logger) logger: LoggerInterface) {
    super(FeTables.locales, {
      logger,
      getUserClient: createServerClient,
      getAdminClient: createAdminClient
    });
  }

  public async getAll(): Promise<LocalesSchema[]> {
    const result = await this.getAdminSupabase()
      .from(FeTables.locales)
      .select('*');
    this.throwIfError(result);
    return (result.data ?? []) as LocalesSchema[];
  }

  /**
   * Full-row fetch (admin / legacy). Prefer {@link getLocaleTextMap} for the
   * public JSON dictionary path.
   */
  public async getLocales(_localeName: string): Promise<LocalesSchema[]> {
    return this.getAll();
  }

  /**
   * Slim dictionary for `/api/locales/json`: only `value` + one locale column.
   * Pages through PostgREST's default 1000-row window so large tables are complete.
   */
  public async getLocaleTextMap(
    localeName: string
  ): Promise<Record<string, string>> {
    if (!i18nConfig.supportedLngs.includes(localeName as LocaleType)) {
      return {};
    }

    const pageSize = 1000;
    const map: Record<string, string> = {};
    let from = 0;

    for (;;) {
      const to = from + pageSize - 1;
      const result = await this.getAdminSupabase()
        .from(FeTables.locales)
        .select(`value,${localeName}`)
        .range(from, to);
      this.throwIfError(result);

      const rawRows: unknown = result.data ?? [];
      const rows = (Array.isArray(rawRows) ? rawRows : []) as Array<
        Record<string, unknown>
      >;
      for (const row of rows) {
        const value = row.value;
        if (typeof value !== 'string' || !value) {
          continue;
        }
        const text = row[localeName];
        map[value] = typeof text === 'string' ? text : '';
      }

      if (rows.length < pageSize) {
        break;
      }
      from += pageSize;
    }

    return map;
  }

  /** Distinct namespaces for exact filter dropdown (sorted). */
  public async listNamespaces(): Promise<string[]> {
    const result = await this.getAdminSupabase()
      .from(FeTables.locales)
      .select('namespace')
      .order('namespace', { ascending: true });
    this.throwIfError(result);

    const set = new Set<string>();
    for (const row of result.data ?? []) {
      const ns = (row as { namespace?: unknown }).namespace;
      if (typeof ns === 'string' && ns.trim()) {
        set.add(ns.trim());
      }
    }
    return [...set];
  }

  public async add(params: LocalesSchema): Promise<LocalesSchema[] | null> {
    const now = new Date().toISOString();
    const payload = {
      value: params.value,
      en: params.en ?? '',
      zh: params.zh ?? '',
      description: params.description ?? '',
      namespace: params.namespace ?? 'common',
      created_at: now,
      updated_at: now
    };

    const result = await this.getAdminSupabase()
      .from(FeTables.locales)
      .insert(payload)
      .select('*');
    this.throwIfError(result);
    return (result.data ?? null) as LocalesSchema[] | null;
  }

  public async updateById(
    id: number,
    params: Partial<Omit<LocalesSchema, 'id' | 'created_at'>>
  ): Promise<void> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    };

    for (const key of this.safeFields) {
      if (key === 'id' || key === 'created_at') {
        continue;
      }
      if (key in params) {
        payload[key] = (params as Record<string, unknown>)[key];
      }
    }

    const result = await this.getAdminSupabase()
      .from(FeTables.locales)
      .update(payload)
      .eq('id', id);
    this.throwIfError(result);
  }

  public async pagination<T = LocalesSchema>(
    params: ResourceSearchParams
  ): Promise<ResourceSearchResult<T>> {
    const page = params.page ?? defaultSearchParams.page;
    const pageSize = params.pageSize ?? defaultSearchParams.pageSize;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const sort = params.sort?.[0];
    const orderBy =
      typeof sort?.orderBy === 'string' ? sort.orderBy : 'updated_at';
    const ascending = sort?.order === 'asc';

    const supabase = this.getAdminSupabase();
    let query = supabase.from(FeTables.locales).select('*', { count: 'exact' });

    const filters = params.filters;
    if (
      filters != null &&
      typeof filters === 'object' &&
      !Array.isArray(filters) &&
      'namespace' in filters &&
      typeof (filters as { namespace?: unknown }).namespace === 'string' &&
      (filters as { namespace: string }).namespace.trim()
    ) {
      query = query.eq(
        'namespace',
        (filters as { namespace: string }).namespace.trim()
      );
    }

    if (params.keyword?.trim()) {
      const kw = params.keyword.trim();
      const filterLocale =
        filters != null &&
        typeof filters === 'object' &&
        !Array.isArray(filters) &&
        'locale' in filters &&
        typeof (filters as { locale?: unknown }).locale === 'string'
          ? (filters as { locale: string }).locale.trim()
          : '';
      const localeCol = i18nConfig.supportedLngs.includes(
        filterLocale as LocaleType
      )
        ? filterLocale
        : null;

      if (localeCol) {
        query = query.or(
          `value.ilike.%${kw}%,${localeCol}.ilike.%${kw}%,description.ilike.%${kw}%,namespace.ilike.%${kw}%`
        );
      } else {
        const localeIlikes = i18nConfig.supportedLngs
          .map((locale) => `${locale}.ilike.%${kw}%`)
          .join(',');
        query = query.or(
          `value.ilike.%${kw}%,${localeIlikes},description.ilike.%${kw}%,namespace.ilike.%${kw}%`
        );
      }
    }

    const result = await query.order(orderBy, { ascending }).range(from, to);
    this.throwIfError(result);

    const items = (result.data ?? []) as T[];
    const total = result.count ?? items.length;

    return {
      items,
      total,
      page,
      pageSize,
      hasMore: from + items.length < total
    };
  }

  /**
   * Batch upsert with chunking and concurrency control.
   * Conflict target: `value` (unique i18n key).
   */
  public async upsert(
    data: Partial<LocalesSchema>[],
    options?: {
      chunkSize?: number;
      concurrency?: number;
    }
  ): Promise<UpsertResult> {
    const chunkSize = options?.chunkSize ?? 100;
    const concurrency = options?.concurrency ?? 3;
    const chunks = chunkArray(data, chunkSize);
    const now = new Date().toISOString();

    const tasks = chunks.map((chunk, chunkIndex) => async () => {
      const inputData = chunk.map((row) => ({
        value: row.value ?? '',
        en: row.en ?? '',
        zh: row.zh ?? '',
        description: row.description ?? '',
        namespace: row.namespace ?? 'common',
        updated_at: now
      }));

      try {
        const result = await this.getAdminSupabase()
          .from(FeTables.locales)
          .upsert(inputData, { onConflict: 'value' })
          .select('*');
        this.throwIfError(result);

        const returnedData = (result.data ?? []) as LocalesSchema[];
        return {
          success: true as const,
          chunkIndex,
          inputData: chunk,
          returnedData,
          affectedCount: returnedData.length
        };
      } catch (err) {
        // Partial failure: collect per-chunk errors instead of aborting the batch.
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error('LocalesRepository.upsert chunk failed', {
          chunkIndex,
          error: message
        });
        return {
          success: false as const,
          chunkIndex,
          inputData: chunk,
          error: message
        };
      }
    });

    const chunkResults = await runWithConcurrency(tasks, concurrency);
    const successChunks: UpsertChunkResult[] = [];
    const failureChunks: UpsertChunkResult[] = [];
    const allReturnedData: LocalesSchema[] = [];

    for (const result of chunkResults) {
      if (result.success) {
        successChunks.push(result);
        if (result.returnedData) {
          allReturnedData.push(...result.returnedData);
        }
      } else {
        failureChunks.push(result);
      }
    }

    const successCount = successChunks.reduce(
      (sum, chunk) => sum + (chunk.affectedCount ?? chunk.inputData.length),
      0
    );
    const failureCount = failureChunks.reduce(
      (sum, chunk) => sum + chunk.inputData.length,
      0
    );

    return {
      totalCount: data.length,
      successCount,
      failureCount,
      successChunks,
      failureChunks,
      allReturnedData
    };
  }
}
