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

  getPath(path: string): string {
    return this.prefix + `/${path}`;
  }
}
