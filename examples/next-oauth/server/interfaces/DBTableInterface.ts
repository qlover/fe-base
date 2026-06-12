import type {
  PaginationInfo,
  PaginationResult
} from '@schemas/SearchResultSchema';
import type { BridgeOrderBy } from './DBBridgeInterface';

export type DBTablePaginationParams = PaginationInfo & {
  orderBy?: BridgeOrderBy;
};

export interface DBTableInterface {
  readonly repoName: string;

  pagination<T = unknown>(
    params: DBTablePaginationParams
  ): Promise<PaginationResult<T>>;
}
