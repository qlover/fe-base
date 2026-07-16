import { ExecutorError } from '@qlover/fe-corekit/executor';
import {
  type SupabaseClient,
  type PostgrestFilterBuilder,
  isAuthApiError,
  AuthResponse,
  UserResponse,
  isAuthError
} from '@supabase/supabase-js';
import { inject, injectable } from '@shared/container';
import { createServerClient, createAdminClient } from '@shared/supabase/server';
import { I } from '@config/ioc-identifiter';
import { isPGRSTSchema } from '@schemas/PGRSTSchema';
import {
  Operators,
  RepoInsertGetParams,
  RepoInsertParams,
  type OperatorType,
  type RepoSearchParams
} from '@server/interfaces/DBBridgeInterface';
import { BaseRepository } from './BaseRepository';
import type { ResourceSearchResult } from '@qlover/corekit-bridge';
import type { LoggerInterface } from '@qlover/logger';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterBuilder = PostgrestFilterBuilder<any, any, any, any, any, any, any>;

@injectable()
export class SupabaseRepo<Raw, T = Raw> extends BaseRepository<Raw, T> {
  @inject(I.Logger)
  protected logger!: LoggerInterface;
  protected clientPromise: Promise<SupabaseClient> | null = null;

  constructor(tableName: string = '') {
    super(tableName);
  }

  /**
   * 获取用户 supabase 客户端，包含 RLS 权限控制
   * @returns
   */
  public async getSupabase(): Promise<SupabaseClient> {
    return await createServerClient();
  }

  /**
   * 获取管理员 supabase 客户端，**不包含 RLS 权限控制**
   * @returns
   */
  public getAdminSupabase(): SupabaseClient {
    return createAdminClient();
  }

  protected async getSearchBuilder(
    params: RepoSearchParams<Raw> & {
      table?: string;
    }
  ): Promise<
    [FilterBuilder, Pick<RepoSearchParams<Raw>, 'pageSize' | 'offset'>]
  > {
    const client = await this.getAdminSupabase();

    let selector = '*';
    if (params.fields) {
      if (Array.isArray(params.fields)) {
        selector = params.fields.join(',');
      }
      if (typeof params.fields === 'string') {
        selector = params.fields;
      }
    }

    // 显式标注 query 类型为 AnyFilterBuilder
    let query: FilterBuilder = client
      .from(params.table ?? this.getRepoName())
      .select(selector, { count: 'exact', head: false }) as FilterBuilder;

    // 1. 处理 where (AND 条件)
    if (params.where && params.where.length) {
      for (const cond of params.where) {
        query = this.applyFilter(query, cond);
      }
    }

    // 2. 处理 whereOr (OR 条件组)
    if (params.whereOr && params.whereOr.length) {
      const orString = this.buildOrString(params.whereOr);
      query = query.or(orString) as FilterBuilder;
    }

    // 3. 处理排序（适配 ResourceSortClause）
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

    // ✨ 3. 新增：全文搜索（与上述条件为 AND 关系）
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

    // 4. 处理分页
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
    // 5. 执行查询
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
   * 插入一条数据
   * @override
   * @param data
   */
  public insert(params: RepoInsertParams<Raw>): Promise<void>;
  /**
   * 插入一条数据后返回新的数据
   * @override
   * @param params
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

  // ---- 辅助方法（完全类型安全） ----

  /**
   * Append a unique tiebreaker so OFFSET/LIMIT pagination stays stable when
   * earlier sort keys collide (e.g. many rows share the same created_at).
   */
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

  /**
   * 操作符映射表（PostgREST）
   */
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
      [Operators.isNull]: 'is', // 特殊处理
      [Operators.isNotNull]: 'not.is',
      [Operators.contains]: 'contains',
      [Operators.containedBy]: 'containedBy'
    };
    return map[op] || op;
  }

  /**
   * 规范化条件：确保输入为二元组或三元组，返回 [field, op, value]
   * 使用 unknown 替代 any，进行类型守卫
   */
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

  /**
   * 将单个条件应用到查询（用于 where 的 AND）
   */
  protected applyFilter(query: FilterBuilder, cond: unknown): FilterBuilder {
    const [field, op, value] = this.normalizeCondition(cond);
    const supabaseOp = this.mapOperator(op);

    if ((op === 'IN' || op === 'NOT IN') && !Array.isArray(value)) {
      return query.filter(field, supabaseOp, [value]) as FilterBuilder;
    }
    return query.filter(field, supabaseOp, value) as FilterBuilder;
  }

  /**
   * 构建 OR 字符串（用于 whereOr）
   */
  protected buildOrString(conditions: unknown[]): string {
    return conditions
      .map((cond) => this.conditionToOrString(cond))
      .filter((s) => s !== '')
      .join(',');
  }

  /**
   * 将单个条件转换为 PostgREST OR 字符串片段
   */
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
      // 数组处理：如果元素是字符串，直接拼接不加引号（适用于 UUID 数组）
      const values = rawValue.map((v) => String(v)).join(',');
      valueStr = `(${values})`;
    } else if (typeof rawValue === 'string') {
      // 关键修改：不再添加单引号
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

  /**
   * 该方法用于统一手动处理 supabase sdk 查询回来的结果
   *
   * 如果有 error 则会将错误抛出
   *
   * @param response
   */
  public throwIfError(
    response: AuthResponse | UserResponse | { error: unknown }
  ): void {
    const { error } = response;

    if (error) {
      if (isAuthApiError(error)) {
        // TODO:
        // 当 email_not_confirmed 时应该重新验证邮箱
        throw new ExecutorError(error.code ?? 'SupabaseAuthApiError', error);
      }

      if (isAuthError(error) || error instanceof Error) {
        throw new ExecutorError('SupabaseAuthError', { cause: error });
      }

      if (isPGRSTSchema(error)) {
        // FIXME: 拦截返回信息
        throw new ExecutorError('SupabasePGRSTError', { cause: error });
      }

      throw error;
    }
  }
}
