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
  contains: '@>',
  containedBy: '<@'
} as const;

export type OperatorType = ValueOf<typeof Operators>;

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

export type FilterTriple<T> = {
  [K in keyof T]: {
    [Op in OperatorType]: [K, Op, ValueByOperator<T, K, Op>];
  }[OperatorType];
}[keyof T];

export interface RepoSearchParams<T = unknown> extends ResourceSearchParams {
  fields?: (keyof T)[] | string;
  where?: FilterTriple<T>[];
  whereOr?: FilterTriple<T>[];
  fullTextSearch?: {
    column: string;
    query: string;
    config?: string;
  };
}

export interface RepoSearchInterface<Raw, T> {
  search(params: RepoSearchParams<Raw>): Promise<ResourceSearchResult<T>>;
}

export type RepoInsertParams<T> = {
  table?: string;
  data: T;
};

export type RepoInsertGetParams<T> = RepoInsertParams<T> & {
  fields?: (keyof T)[] | string;
};

export interface RepositoryInterface<Raw, T = Raw> extends RepoSearchInterface<
  Raw,
  T
> {
  getRepoName(): string;
  insert(params: RepoInsertParams<Raw>): Promise<void>;
  insert(params: RepoInsertGetParams<Raw>): Promise<T>;
}
