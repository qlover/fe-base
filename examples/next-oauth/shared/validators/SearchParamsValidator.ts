import { ExecutorError } from '@qlover/fe-corekit';
import { defaultSearchParams } from '@config/common';
import {
  V_REQUEST_LOGS_QUERY_INVALID,
  V_ZOD_FAILED
} from '@config/i18n-identifier/common/validators';
import { REQUEST_LOGS_ORDER_BY_WHITELIST } from '@schemas/RequestLogSchema';
import { searchParamsSchema } from '@schemas/SearchParamsSchema';
import type {
  ExtendedExecutorError,
  ValidationResultFailed,
  ValidatorInterface
} from './ValidatorInterface';
import type { ResourceSearchParams } from '@qlover/corekit-bridge';

function parsePositiveInt(
  raw: string | null,
  fallback: number,
  max?: number
): number {
  if (raw == null || raw === '') {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) {
    return fallback;
  }
  const i = Math.floor(n);
  if (max !== undefined && i > max) {
    return max;
  }
  return i;
}

function parseOrder(raw: string | null): 'asc' | 'desc' {
  const v = raw?.toLowerCase();
  return v === 'asc' ? 'asc' : 'desc';
}

export class SearchParamsValidator implements ValidatorInterface<ResourceSearchParams> {
  protected parseFromSearchParams(
    searchParams: URLSearchParams
  ): ResourceSearchParams {
    const criteria: ResourceSearchParams = {};

    const pageRaw = searchParams.get('page');
    if (pageRaw != null && pageRaw !== '') {
      criteria.page = parsePositiveInt(pageRaw, defaultSearchParams.page);
    }

    const offsetRaw = searchParams.get('offset');
    if (offsetRaw != null && offsetRaw !== '') {
      const off = Number(offsetRaw);
      if (Number.isFinite(off) && off >= 0) {
        criteria.offset = Math.floor(off);
      }
    }

    if (criteria.page == null && criteria.offset == null) {
      criteria.page = defaultSearchParams.page;
    }

    criteria.pageSize = parsePositiveInt(
      searchParams.get('pageSize'),
      defaultSearchParams.pageSize,
      100 // TODO: make it configurable
    );

    const cursor = searchParams.get('cursor');
    if (cursor != null && cursor !== '') {
      criteria.cursor = cursor;
    }

    const keyword = searchParams.get('keyword');
    if (keyword != null && keyword !== '') {
      criteria.keyword = keyword;
    }

    const filtersRaw = searchParams.get('filters');
    if (filtersRaw != null && filtersRaw !== '') {
      try {
        criteria.filters = JSON.parse(filtersRaw) as unknown;
      } catch {
        criteria.filters = filtersRaw;
      }
    }

    const sortJson = searchParams.get('sort');
    if (sortJson != null && sortJson !== '') {
      try {
        const parsed = JSON.parse(sortJson) as unknown;
        if (Array.isArray(parsed) && parsed.length > 0) {
          criteria.sort = parsed as ResourceSearchParams['sort'];
        }
      } catch {
        // ignore invalid sort JSON
      }
    }

    if (criteria.sort == null) {
      const orderByRaw =
        searchParams.get('orderBy')?.trim() ||
        defaultSearchParams.sort[0].orderBy;

      const orderBy = REQUEST_LOGS_ORDER_BY_WHITELIST.has(orderByRaw)
        ? orderByRaw
        : defaultSearchParams.sort[0].orderBy;
      const order = parseOrder(
        searchParams.get('order') ?? defaultSearchParams.sort[0].order
      );
      criteria.sort = [{ orderBy, order }];
    }

    return criteria;
  }

  /**
   * Parse query string then validate with {@link searchParamsSchema}.
   */
  protected buildCriteria(
    searchParams: URLSearchParams
  ):
    | { ok: true; data: ResourceSearchParams }
    | { ok: false; failed: ValidationResultFailed } {
    const raw = this.parseFromSearchParams(searchParams);
    const parsed = searchParamsSchema.safeParse(raw);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      const path =
        issue.path.length > 0
          ? (issue.path as ValidationResultFailed['path'])
          : ['searchParams'];
      return {
        ok: false,
        failed: {
          success: false,
          path,
          message: V_ZOD_FAILED
        }
      };
    }
    return { ok: true, data: parsed.data as ResourceSearchParams };
  }

  /**
   * @override
   */
  public validate(data: unknown): void | ValidationResultFailed {
    if (!(data instanceof URLSearchParams)) {
      return {
        success: false,
        path: ['query'],
        message: V_REQUEST_LOGS_QUERY_INVALID
      };
    }
    const built = this.buildCriteria(data);
    if (!built.ok) {
      return built.failed;
    }
  }

  /**
   * @override
   */
  public getThrow(data: unknown): ResourceSearchParams {
    if (!(data instanceof URLSearchParams)) {
      const fail: ValidationResultFailed = {
        success: false,
        path: ['query'],
        message: V_REQUEST_LOGS_QUERY_INVALID
      };
      const error: ExtendedExecutorError = new ExecutorError(fail.message);
      error.issues = [fail];
      throw error;
    }

    const built = this.buildCriteria(data);
    if (!built.ok) {
      const error: ExtendedExecutorError = new ExecutorError(
        built.failed.message
      );
      error.issues = [built.failed];
      throw error;
    }

    return built.data;
  }
}
