import { resolve } from 'path';
import { bootstrap } from 'commitizen/dist/cli/git-cz.js';
import { existsSync } from 'fs';

/**
 * @param {import('@qlover/fe-scripts/scripts').CommitOptions} options
 */
export function commit(options) {
  const { defaultCzPath, logger, shell } = options;
  // git add
  shell.exec('git add .');

  // Priority dev project
  const changelogRootModules = resolve(
    'node_modules/cz-conventional-changelog'
  );

  const path = existsSync(changelogRootModules)
    ? changelogRootModules
    : defaultCzPath;

  if (path) {
    logger.log('czpath:', path);
    // cz
    // https://www.npmjs.com/package/commitizen#Commitizen for multi-repo projects
    bootstrap({
      cliPath: resolve('node_modules/commitizen'),
      config: { path }
    });
  } else {
    logger.error('changelogModules is not found');
  }
}
