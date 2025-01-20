import { resolve } from 'node:path';
import { bootstrap } from 'commitizen/dist/cli/git-cz.js';
import { existsSync } from 'node:fs';
import {
  FeScriptContext,
  FeScriptContextOptions
} from '@qlover/scripts-context';

export interface CommitOptions {
  /**
   * Absolute path to cz-conventional-changelog
   */
  defaultCzPath?: string;
}
export function commit(options: FeScriptContextOptions<CommitOptions>): void {
  const context = new FeScriptContext(options);
  const { logger, shell } = context;
  const { defaultCzPath } = context.options;

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
