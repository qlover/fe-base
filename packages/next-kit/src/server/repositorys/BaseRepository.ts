import type {
  RepoInsertGetParams,
  RepoInsertParams,
  RepoSearchParams,
  RepositoryInterface
} from '../interfaces/DBBridgeInterface';
import type { ResourceSearchResult } from '@qlover/corekit-bridge';

/**
 * Abstract repository middle layer for shared CRUD search patterns.
 */
export abstract class BaseRepository<
  Raw,
  T = Raw
> implements RepositoryInterface<Raw, T> {
  constructor(protected repoName: string = '') {}

  protected isRaw(_value: unknown): _value is Raw {
    return true;
  }

  protected is(_value: unknown): _value is T {
    return true;
  }

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
    params: RepoSearchParams<Raw>
  ): Promise<ResourceSearchResult<T>>;

  /**
   * @override
   */
  public abstract insert(params: RepoInsertParams<Raw>): Promise<void>;
  /**
   * @override
   */
  public abstract insert(params: RepoInsertGetParams<Raw>): Promise<T>;
}
