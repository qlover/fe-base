import { dirname, resolve } from 'path';
import { Env } from '../lib/Env';
import { existsSync } from 'node:fs';
import { Logger } from '@qlover/fe-utils';

/**
 * TODO: move to @qlover/fe-env-loader
 * from current directory to root directory, search and load .env file
 * @param {object} options
 * @param {string} [options.cwd] start search directory, default is process.cwd()
 * @param {string[]} [options.preloadList] search file name list, default is ['.env.local', '.env']
 * @param {import('@qlover/fe-utils').Logger} [options.logger] logger
 * @param {number} [options.maxDepth=5] maximum search depth
 * @returns {Env} environment variable loader instance
 */
export function searchEnv({
  cwd = process.cwd(),
  preloadList = ['.env.local', '.env'],
  logger,
  maxDepth = 5
}: {
  cwd?: string;
  preloadList?: string[];
  logger?: Logger;
  maxDepth?: number;
}): Env {
  // limit max search depth to 10
  // don't override maxDepth if it's not set
  maxDepth = Math.min(maxDepth, 8);

  // create Env instance
  const env = new Env({ rootPath: cwd, logger: logger as Logger });

  // recursive search up, until find .env file or reach root directory
  let currentDir = cwd;
  let lastDir = '';
  let found = false;
  let searchCount = 0;

  while (currentDir !== lastDir) {
    // check if current directory exists environment file
    found = preloadList.some((file) => existsSync(resolve(currentDir, file)));

    if (found) {
      env.load({
        preloadList,
        rootPath: currentDir
      });
      break;
    }

    // check if reached max search depth
    searchCount++;
    if (searchCount >= maxDepth) {
      logger?.warn(
        `Search depth exceeded ${maxDepth} levels, stopping search at ${currentDir}`
      );
      break;
    }

    lastDir = currentDir;
    currentDir = dirname(currentDir);

    // check if reached root directory
    if (currentDir === lastDir) {
      logger?.warn('Reached root directory, stopping search');
      break;
    }
  }

  if (!found && logger) {
    logger.warn(
      `No environment files (${preloadList.join(', ')}) found in directory tree from ${cwd} to ${currentDir}`
    );
  }

  return env;
}
