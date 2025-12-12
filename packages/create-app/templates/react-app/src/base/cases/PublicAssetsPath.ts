import { routerPrefix } from '@config/common';
import { injectable } from 'inversify';

/**
 * Get Publish Assets Path
 *
 * - If router has prefix, the path will be `prefix/path`
 * - If router has no prefix, the path will be `path`
 */
@injectable()
export class PublicAssetsPath {
  constructor(protected prefix: string = routerPrefix) {}

  public getPath(path: string): string {
    if (!this.prefix) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    const prefix = this.prefix.endsWith('/')
      ? this.prefix.slice(0, -1)
      : this.prefix;
    return prefix + (path.startsWith('/') ? path : `/${path}`);
  }
}
