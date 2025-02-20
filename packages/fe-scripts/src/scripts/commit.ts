import { bootstrap } from 'commitizen/dist/cli/git-cz.js';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
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

export function getModulesPath(modulesName: string): string | undefined {
  const require = createRequire(import.meta.url);
  try {
    const path = require.resolve(modulesName, {
      paths: [process.cwd()]
    });

    // remove the modules name from the path
    // e.g. /Users/node_modules/commitizen/dist -> /Users/node_modules/commitizen
    return path.substring(0, path.indexOf(modulesName) + modulesName.length);
  } catch {
    return;
  }
}

export function commit(options: FeScriptContextOptions<CommitOptions>): void {
  const context = new FeScriptContext(options);
  const { logger, shell } = context;
  const { defaultCzPath } = context.options;

  // git add
  shell.exec('git add .');

  // Priority dev project
  const changelogRootPath = getModulesPath('cz-conventional-changelog');
  if (!changelogRootPath) {
    logger.error('Could not resolve cz-conventional-changelog');
    return;
  }

  const commitizenPath = getModulesPath('commitizen');
  if (!commitizenPath) {
    logger.error('Could not resolve commitizen');
    return;
  }

  const path = existsSync(changelogRootPath)
    ? changelogRootPath
    : defaultCzPath;

  if (path) {
    logger.info('czpath:', path);
    logger.info('commitizenPath:', commitizenPath);

    if (options.dryRun) {
      return;
    }

    // cz
    // https://www.npmjs.com/package/commitizen#Commitizen for multi-repo projects
    bootstrap({
      cliPath: commitizenPath,
      config: { path }
    });
  } else {
    logger.error('changelogModules is not found');
  }
}
