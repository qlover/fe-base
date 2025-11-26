import { I } from '@config/IOCIdentifier';
import { inject, injectable } from 'inversify';
import { AppConfig } from './AppConfig';

/**
 * Get Publish Assets Path
 *
 * - If router has prefix, the path will be `prefix/path`
 * - If router has no prefix, the path will be `path`
 */
@injectable()
export class PublicAssetsPath {
  protected prefix: string = '';

  constructor(@inject(I.AppConfig) protected appConfig: AppConfig) {
    this.prefix = appConfig.baseUrl;
  }

  getPath(path: string): string {
    if (!this.prefix) {
      return path.startsWith('/') ? path : `/${path}`;
    }
    const prefix = this.prefix.endsWith('/')
      ? this.prefix.slice(0, -1)
      : this.prefix;
    return prefix + (path.startsWith('/') ? path : `/${path}`);
  }
}
