import {
  ScriptContext,
  ScriptContextInterface,
  ScriptSharedInterface
} from '@qlover/scripts-context';
import { bootstrap } from 'commitizen/dist/cli/git-cz.js';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';

export interface CommitOptions extends ScriptSharedInterface {
  /**
   * Absolute path to cz-conventional-changelog
   */
  defaultCzPath?: string;
}

function getModuleRoot(moduleName: string): string | null {
  const require = createRequire(import.meta.url);

  try {
    const modulePath = require.resolve(moduleName, {
      paths: [process.cwd()]
    });

    let dir = dirname(modulePath);
    while (dir !== dirname(dir)) {
      if (existsSync(join(dir, 'package.json'))) {
        return dir;
      }
      dir = dirname(dir);
    }

    throw new Error(`Cannot determine root for module: ${moduleName}`);
  } catch (error) {
    console.error(
      `Failed to resolve module ${moduleName}:`,
      (error as Error).message
    );
    return null;
  }
}

export function commit(options: ScriptContextInterface<CommitOptions>): void {
  const context = new ScriptContext('fe-scripts-commit', options);
  const { logger, shell } = context;
  const { defaultCzPath } = context.options;

  // git add
  shell.exec('git add .');

  // Priority dev project
  const changelogRootPath = getModuleRoot('cz-conventional-changelog');
  if (!changelogRootPath) {
    logger.error('Could not resolve cz-conventional-changelog');
    return;
  }

  const commitizenPath = getModuleRoot('commitizen');
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
