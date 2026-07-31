import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type { ValueOf } from '@qlover/fe-corekit/common';

/**
 * 服务端仓储 / 查询桥接的共享类型。
 *
 * 这是与具体数据库无关的契约，供 {@link BaseRepository}、{@link SupabaseRepo}
 * 使用。应用侧应从 `@qlover/next-kit/server` 导入，不要再保留本地副本。
 * 具体驱动（当前为 Supabase，后续可换其它 SQL 存储）实现同一套形状即可。
 */

/** 简单 `[列名, 操作符, 值]` where 子句中的比较操作符。 */
export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';

/** 非泛型 where 三元组（列名为普通 string）。 */
export type Where = [string, WhereOperation, string | number];

/**
 * 类型安全过滤用的操作符目录。
 *
 * 名称映射到 PostgREST / SQL 字面量。JSONB 辅助（`contains` / `containedBy`）
 * 偏 PostgreSQL，但仍放在共享契约上，其它驱动可忽略或自行映射。
 */
export const Operators = {
  eq: '=',
  notEq: '!=',
  gt: '>',
  gte: '>=',
  lt: '<',
  lte: '<=',
  in: 'IN',
  notIn: 'NOT IN',
  like: 'LIKE',
  ilike: 'ILIKE',
  isNull: 'IS NULL',
  isNotNull: 'IS NOT NULL',
  /** JSONB 包含（`@>`）。 */
  contains: '@>',
  /** JSONB 被包含（`<@`）。 */
  containedBy: '<@'
} as const;

export type OperatorType = ValueOf<typeof Operators>;

/**
 * 字段 `K` 在操作符 `Op` 下允许的值类型：
 * - `IN` / `NOT IN` → 该字段类型的数组
 * - `LIKE` / `ILIKE` → `string`（且字段本身需为 string）
 * - `IS NULL` / `IS NOT NULL` → `null` 占位（无实际值）
 * - 其它 → 精确等于字段类型 `T[K]`
 */
type ValueByOperator<T, K extends keyof T, Op extends OperatorType> =
  Op extends 'IN' | 'NOT IN'
    ? T[K][]
    : Op extends 'LIKE' | 'ILIKE'
      ? T[K] extends string
        ? string
        : never
      : Op extends 'IS NULL' | 'IS NOT NULL'
        ? null
        : T[K];

/**
 * 由行类型 `T` 推导的完整类型安全三元组 `[字段, 操作符, 值]`。
 * 非法的字段 / 操作符 / 值组合会收敛为 `never`。
 */
export type FilterTriple<T> = {
  [K in keyof T]: {
    [Op in OperatorType]: [K, Op, ValueByOperator<T, K, Op>];
  }[OperatorType];
}[keyof T];

/**
 * 搜索参数：在 corekit 分页/排序基础上，增加类型安全的 AND/OR 过滤，
 * 以及可选的 PostgreSQL 全文搜索。
 */
export interface RepoSearchParams<T = unknown> extends ResourceSearchParams {
  /** 投影：`T` 的列键，或原始 select 字符串。 */
  fields?: (keyof T)[] | string;
  /** AND 条件组（类型安全三元组）。 */
  where?: FilterTriple<T>[];
  /** OR 条件组（类型安全三元组）。 */
  whereOr?: FilterTriple<T>[];
  /**
   * PostgreSQL 全文搜索（`plainto_tsquery`）。
   *
   * @example
   * `{ column: 'search_vector', query: 'apple banana', config: 'english' }`
   */
  fullTextSearch?: {
    /** 建议使用 `tsvector` 列。 */
    column: string;
    /** 交由 `plainto_tsquery` 处理的关键词。 */
    query: string;
    /** 文本搜索配置；SupabaseRepo 中默认 `'english'`。 */
    config?: string;
  };
}

/**
 * 仓储搜索端口。
 *
 * @typeParam Raw - 存储行类型（过滤作用于此形状）
 * @typeParam T - 返回给调用方的映射行类型（实现里常默认为 `Raw`）
 *
 * 统一调用方式，便于后续替换驱动（如 Supabase → MySQL）而不改控制器/服务。
 *
 * @example
 * ```ts
 * repo.search({
 *   where: [['id', '=', 1]],
 *   whereOr: [['published', '=', 1]]
 * });
 * ```
 */
export interface RepoSearchInterface<Raw, T> {
  /**
   * 分页搜索，返回 {@link ResourceSearchResult}。
   * 在 {@link ResourceSearchParams} 上扩展了 `where` / `whereOr` / 全文搜索。
   */
  search(params: RepoSearchParams<Raw>): Promise<ResourceSearchResult<T>>;
}

/** 插入载荷；可选 `table` 覆盖仓储默认表名。 */
export type RepoInsertParams<T> = {
  table?: string;
  data: T;
};

/**
 * 插入并返回写入后的行。指定 `fields` 时，驱动按这些列投影返回。
 */
export type RepoInsertGetParams<T> = RepoInsertParams<T> & {
  fields?: (keyof T)[] | string;
};

/**
 * 最小仓储表面：表名 + 搜索 + 插入（无返回 / 有返回）。
 *
 * @typeParam Raw - 写入存储的行
 * @typeParam T - 返回给调用方的行（默认为 `Raw`）
 */
export interface RepositoryInterface<Raw, T = Raw> extends RepoSearchInterface<
  Raw,
  T
> {
  getRepoName(): string;

  /** 插入，不回读行。 */
  insert(params: RepoInsertParams<Raw>): Promise<void>;
  /** 插入并返回新行（可通过 `fields` 投影）。 */
  insert(params: RepoInsertGetParams<Raw>): Promise<T>;
}
