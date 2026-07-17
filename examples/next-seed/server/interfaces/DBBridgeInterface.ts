import type {
  ResourceSearchParams,
  ResourceSearchResult
} from '@qlover/corekit-bridge';
import type { ValueOf } from '@qlover/fe-corekit/common';

export type WhereOperation = '=' | '!=' | '>' | '<' | '>=' | '<=';
export type Where = [string, WhereOperation, string | number];

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
  contains: '@>', // JSONB contains
  containedBy: '<@'
} as const;

export type OperatorType = ValueOf<typeof Operators>;

type ValueByOperator<T, K extends keyof T, Op extends OperatorType> =
  // 如果操作符是 IN 或 NOT IN，值必须是该字段类型的数组
  Op extends 'IN' | 'NOT IN'
    ? T[K][]
    : // 如果操作符是 LIKE 或 ILIKE，值必须是 string（且限制字段本身也得是 string）
      Op extends 'LIKE' | 'ILIKE'
      ? T[K] extends string
        ? string
        : never
      : // 如果操作符是 IS NULL 或 IS NOT NULL，不需要传值（传 null 占位）
        Op extends 'IS NULL' | 'IS NOT NULL'
        ? null
        : // 其他操作符（=, !=, >, >=, <, <=, @>, <@），值必须严格等于字段类型 T[K]
          T[K];

export type FilterTriple<T> = {
  // 遍历 T 的每个字段 K
  [K in keyof T]: {
    // 遍历每个操作符 Op
    [Op in OperatorType]: [
      K, // 第1项：字段名（只能是 T 的键）
      Op, // 第2项：操作符（受限制的枚举）
      ValueByOperator<T, K, Op> // 第3项：根据字段+操作符推导出的精确类型
    ];
  }[OperatorType]; // 取索引值，展开为联合类型
}[keyof T]; // 再次取索引值，扁平化为一个大的联合类型

export interface RepoSearchParams<T = unknown> extends ResourceSearchParams {
  fields?: (keyof T)[] | string;
  where?: FilterTriple<T>[]; // AND 条件组，完全类型安全
  whereOr?: FilterTriple<T>[]; // OR 条件组，完全类型安全
  /**
   * PostgreSQL 全文搜索配置
   * @example { column: 'search_vector', query: 'apple banana', config: 'english' }
   */
  fullTextSearch?: {
    /** 要进行全文搜索的列名（建议是 `tsvector` 类型列） */
    column: string;
    /** 搜索关键词（会经过 `plainto_tsquery` 处理） */
    query: string;
    /** 文本搜索配置（默认 `'english'`） */
    config?: string;
  };
}

/**
 * 仓库搜索接口
 *
 * @template Raw - repository raw row type
 * @template T - repository mapped return type (defaults to Raw)
 *
 * 该接口主要为了统一调用方法, 为了后续迁移到非 supabase 数据库时的抽象层
 *
 * 可以做：
 *
 * - 实现一个 supabase 的 search
 * - 实现一个 mysql 的 search
 */
export interface RepoSearchInterface<Raw, T> {
  /**
   * 该方法用于搜索数据, 返回一个 ResourceSearchResult 带分页的数据
   *
   * 其中 params 再原有的 ResourceSearchParams 中扩展了 where,or 等条件
   *
   * @example 带条件where和or条件搜索
   *
   * ```
   * repo.search({
   *   where: [
   *     ['id', '=', 1]
   *   ],
   *   whereOr: [
   *     ['publi', '=', 1]
   *   ]
   * })
   * ```
   * @param params {@link RepoSearchParams}
   */
  search(params: RepoSearchParams<Raw>): Promise<ResourceSearchResult<T>>;
}

export type RepoInsertParams<T> = {
  table?: string;
  data: T;
};

export type RepoInsertGetParams<T> = RepoInsertParams<T> & {
  /**
   * 当指定了该字段，会根据字段返回插入后的数据
   */
  fields?: (keyof T)[] | string;
};

export interface RepositoryInterface<Raw, T = Raw> extends RepoSearchInterface<
  Raw,
  T
> {
  getRepoName(): string;

  /**
   * 插入一条数据
   * @param data
   */
  insert(params: RepoInsertParams<Raw>): Promise<void>;
  /**
   * 插入一条数据后返回新的数据
   * @param params
   */
  insert(params: RepoInsertGetParams<Raw>): Promise<T>;
}
