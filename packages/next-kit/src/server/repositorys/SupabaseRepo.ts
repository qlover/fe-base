import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  type SupabaseClient,
  type PostgrestFilterBuilder,
  isAuthApiError,
  type AuthResponse,
  type UserResponse,
  isAuthError
} from '@supabase/supabase-js';
import { isPGRSTSchema } from '../../common/schemas/PGRSTSchema';
import {
  Operators,
  type RepoInsertGetParams,
  type RepoInsertParams,
  type OperatorType,
  type RepoSearchParams
} from '../interfaces/DBBridgeInterface';
import { BaseRepository } from './BaseRepository';
import type { ResourceSearchResult } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterBuilder = PostgrestFilterBuilder<any, any, any, any, any, any, any>;

export type SupabaseRepoDeps = {
  logger: LoggerInterface;
  /** Cookie/session client (RLS applies). */
  getUserClient: () => Promise<SupabaseClient>;
  /** Service-role client (bypasses RLS). */
  getAdminClient: () => SupabaseClient;
};

/**
 * Generic Supabase-backed repository.
 *
 * Client factories and IOC wiring stay in the app; this class owns query helpers.
 */
export class SupabaseRepo<Raw, T = Raw> extends BaseRepository<Raw, T> {
  protected readonly logger: LoggerInterface;
  protected readonly getUserClient: () => Promise<SupabaseClient>;
  protected readonly getAdminClient: () => SupabaseClient;

  constructor(tableName: string, deps: SupabaseRepoDeps) {
    super(tableName);
    this.logger = deps.logger;
    this.getUserClient = deps.getUserClient;
    this.getAdminClient = deps.getAdminClient;
  }

  public async getSupabase(): Promise<SupabaseClient> {
    return await this.getUserClient();
  }

  public getAdminSupabase(): SupabaseClient {
    return this.getAdminClient();
  }

  protected async getSearchBuilder(
    params: RepoSearchParams<Raw> & {
      table?: string;
    }
  ): Promise<
    [FilterBuilder, Pick<RepoSearchParams<Raw>, 'pageSize' | 'offset'>]
  > {
    const client = this.getAdminSupabase();

    let selector = '*';
    if (params.fields) {
      if (Array.isArray(params.fields)) {
        selector = params.fields.join(',');
      }
      if (typeof params.fields === 'string') {
        selector = params.fields;
      }
    }

    let query: FilterBuilder = client
      .from(params.table ?? this.getRepoName())
      .select(selector, { count: 'exact', head: false }) as FilterBuilder;

    if (params.where && params.where.length) {
      for (const cond of params.where) {
        query = this.applyFilter(query, cond);
      }
    }

    if (params.whereOr && params.whereOr.length) {
      const orString = this.buildOrString(params.whereOr);
      query = query.or(orString) as FilterBuilder;
    }

    const sortClauses = this.ensureStableSort(params.sort);
    if (sortClauses.length) {
      for (const sort of sortClauses) {
        const field = sort.orderBy;
        let ascending = true;
        let nullsFirst: boolean | undefined = undefined;

        if (typeof sort.order === 'string') {
          ascending = sort.order === 'asc';
        } else if (sort.order && typeof sort.order === 'object') {
          const orderObj = sort.order as { direction?: string; nulls?: string };
          if (orderObj.direction) {
            ascending = orderObj.direction === 'asc';
          }
          if (orderObj.nulls) {
            nullsFirst = orderObj.nulls === 'first';
          }
        }
        query = query.order(field, {
          ascending,
          nullsFirst
        }) as FilterBuilder;
      }
    }

    if (params.fullTextSearch) {
      const {
        column,
        query: searchQuery,
        config = 'english'
      } = params.fullTextSearch;
      query = query.textSearch(column, searchQuery, {
        config
      }) as FilterBuilder;
    }

    const pageSize = params.pageSize || 20;
    let offset = params.offset;
    if (offset === undefined && params.page !== undefined) {
      offset = (params.page - 1) * pageSize;
    }
    if (offset !== undefined) {
      query = query.range(offset, offset + pageSize - 1) as FilterBuilder;
    } else if (params.pageSize) {
      query = query.range(0, pageSize - 1) as FilterBuilder;
    }

    return [
      query,
      {
        offset,
        pageSize
      }
    ];
  }

  /**
   * @override
   */
  public async search(
    params: RepoSearchParams<Raw> & {
      table?: string;
    }
  ): Promise<ResourceSearchResult<T>> {
    const [query, { offset, pageSize }] = await this.getSearchBuilder(params);
    const { data, error, count } = await query;
    const items = (data || []) as T[];
    const total = count || 0;
    const hasMore =
      offset !== undefined ? offset + items.length < total : false;

    if (error) {
      this.logger.error('SupabaseRepo.search ', error);
    }

    return {
      items,
      total,
      page: params.page,
      pageSize,
      hasMore,
      nextCursor: null,
      prevCursor: null
    };
  }

  /**
   * @override
   */
  public insert(params: RepoInsertParams<Raw>): Promise<void>;
  /**
   * @override
   */
  public insert(params: RepoInsertGetParams<Raw>): Promise<T>;
  /**
   * @override
   */
  public async insert(
    params: RepoInsertParams<Raw> | RepoInsertGetParams<Raw>
  ): Promise<T | void> {
    const { data, fields, table } = params as RepoInsertGetParams<Raw>;
    const client = await this.getSupabase();
    const query = client
      .from(table || this.getRepoName())
      .insert(data as Record<string, unknown>);

    if (fields) {
      const selectString =
        Array.isArray(fields) && fields.length > 0
          ? fields.join(',')
          : (fields as string);

      const result = await query.select(selectString).maybeSingle();

      this.throwIfError(result);
      return result.data as T;
    }

    const result = await query;

    this.throwIfError(result);
  }

  protected ensureStableSort(
    sort?: RepoSearchParams<Raw>['sort']
  ): NonNullable<RepoSearchParams<Raw>['sort']> {
    const sortClauses = [...(sort ?? [])];
    if (sortClauses.length === 0) {
      return sortClauses;
    }

    const hasIdSort = sortClauses.some((clause) => clause.orderBy === 'id');
    if (!hasIdSort) {
      const lastOrder = sortClauses[sortClauses.length - 1]?.order;
      sortClauses.push({
        orderBy: 'id',
        order: typeof lastOrder === 'string' ? lastOrder : 'desc'
      });
    }

    return sortClauses;
  }

  protected mapOperator(op: OperatorType): string {
    const map: Record<OperatorType, string> = {
      [Operators.eq]: 'eq',
      [Operators.notEq]: 'neq',
      [Operators.gt]: 'gt',
      [Operators.gte]: 'gte',
      [Operators.lt]: 'lt',
      [Operators.lte]: 'lte',
      [Operators.in]: 'in',
      [Operators.notIn]: 'not.in',
      [Operators.like]: 'like',
      [Operators.ilike]: 'ilike',
      [Operators.isNull]: 'is',
      [Operators.isNotNull]: 'not.is',
      [Operators.contains]: 'contains',
      [Operators.containedBy]: 'containedBy'
    };
    return map[op] || op;
  }

  protected normalizeCondition(cond: unknown): [string, OperatorType, unknown] {
    if (!Array.isArray(cond)) {
      throw new Error(`Invalid condition: expected array, got ${typeof cond}`);
    }
    if (cond.length === 2) {
      const [field, op] = cond;
      if (typeof field !== 'string') {
        throw new Error(`Invalid field: expected string, got ${typeof field}`);
      }
      if (typeof op !== 'string') {
        throw new Error(`Invalid operator: expected string, got ${typeof op}`);
      }
      return [field, op as OperatorType, null];
    }
    if (cond.length === 3) {
      const [field, op, value] = cond;
      if (typeof field !== 'string') {
        throw new Error(`Invalid field: expected string, got ${typeof field}`);
      }
      if (typeof op !== 'string') {
        throw new Error(`Invalid operator: expected string, got ${typeof op}`);
      }
      return [field, op as OperatorType, value];
    }
    throw new Error(
      `Invalid condition: expected 2 or 3 elements, got ${cond.length}`
    );
  }

  protected applyFilter(query: FilterBuilder, cond: unknown): FilterBuilder {
    const [field, op, value] = this.normalizeCondition(cond);
    const supabaseOp = this.mapOperator(op);

    if ((op === 'IN' || op === 'NOT IN') && !Array.isArray(value)) {
      return query.filter(field, supabaseOp, [value]) as FilterBuilder;
    }
    return query.filter(field, supabaseOp, value) as FilterBuilder;
  }

  protected buildOrString(conditions: unknown[]): string {
    return conditions
      .map((cond) => this.conditionToOrString(cond))
      .filter((s) => s !== '')
      .join(',');
  }

  protected conditionToOrString(cond: unknown): string {
    const [field, op, rawValue] = this.normalizeCondition(cond);

    if (op === 'IS NULL') {
      return `${field}.is.null`;
    }
    if (op === 'IS NOT NULL') {
      return `${field}.not.is.null`;
    }

    const supabaseOp = this.mapOperator(op);

    let valueStr: string;
    if (Array.isArray(rawValue)) {
      const values = rawValue.map((v) => String(v)).join(',');
      valueStr = `(${values})`;
    } else if (typeof rawValue === 'string') {
      valueStr = rawValue;
    } else if (typeof rawValue === 'number' || typeof rawValue === 'boolean') {
      valueStr = String(rawValue);
    } else if (rawValue === null || rawValue === undefined) {
      valueStr = 'null';
    } else {
      valueStr = String(rawValue);
    }

    return `${field}.${supabaseOp}.${valueStr}`;
  }

  public throwIfError(
    response: AuthResponse | UserResponse | { error: unknown }
  ): void {
    const { error } = response;

    if (error) {
      if (isAuthApiError(error)) {
        throw new ExecutorError(error.code ?? 'SupabaseAuthApiError', error);
      }

      if (isAuthError(error) || error instanceof Error) {
        throw new ExecutorError('SupabaseAuthError', { cause: error });
      }

      if (isPGRSTSchema(error)) {
        throw new ExecutorError('SupabasePGRSTError', { cause: error });
      }

      throw new ExecutorError('SupabaseUnknownError', { cause: error });
    }
  }
}
