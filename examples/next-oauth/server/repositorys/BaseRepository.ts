import type {
  RepoInsertGetParams,
  RepoInsertParams,
  RepoSearchParams,
  RepositoryInterface
} from '@server/interfaces/DBBridgeInterface';
import type { ResourceSearchResult } from '@qlover/corekit-bridge';

/**
 * 一个抽象的中间层，可扩展一些通用能力
 */
export abstract class BaseRepository<T> implements RepositoryInterface<T> {
  constructor(protected repoName: string = '') {}

  /**
   * @override
   */
  public getRepoName(): string {
    if (!this.repoName) {
      throw new Error(
        Object.getPrototypeOf(this).constructor.name + ' must have a repoName'
      );
    }
    return this.repoName;
  }

  /**
   * @override
   */
  public abstract search(
    params: RepoSearchParams<T>
  ): Promise<ResourceSearchResult<T>>;

  /**
   * 插入一条数据
   * @override
   * @param data
   */
  public abstract insert(params: RepoInsertParams<T>): Promise<void>;
  /**
   * 插入一条数据后返回新的数据
   * @override
   * @param params
   */
  public abstract insert(params: RepoInsertGetParams<T>): Promise<T>;
}
