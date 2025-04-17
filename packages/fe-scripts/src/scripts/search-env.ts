import { Env } from '@qlover/env-loader';
import { Logger } from '@qlover/fe-corekit';

/**
 * from current directory to root directory, search and load .env file
 *
 * @deprecated use `@qlover/env-loader` instead
 * @param {object} options
 * @param {string} [options.cwd] start search directory, default is process.cwd()
 * @param {string[]} [options.preloadList] search file name list, default is ['.env.local', '.env']
 * @param {import('@qlover/fe-corekit').Logger} [options.logger] logger
 * @param {number} [options.maxDepth=5] maximum search depth
 * @returns {Env} environment variable loader instance
 */
export function searchEnv(options: {
  cwd?: string;
  preloadList?: string[];
  logger?: Logger;
  maxDepth?: number;
}): Env {
  return Env.searchEnv(options);
}
