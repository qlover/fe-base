import { join } from 'path';
import { install, add } from 'husky';
import { rootPath } from '../../config/path.config.cjs';
import { Shell } from '../lib/shell.js';
import { readJSON } from '../utils/files.js';

const pkg = readJSON(new URL('../../package.json', import.meta.url));
const { devDependencies, dependencies } = pkg;

async function main() {
  const shell = new Shell();
  await shell.exec(`npx rimraf ${rootPath}/.husky`);

  if (
    !(
      devDependencies['cz-conventional-changelog'] ||
      dependencies['cz-conventional-changelog']
    )
  ) {
    await shell.exec(
      'npx commitizen init cz-conventional-changelog --save-dev --save-exact'
    );
  }

  install();
  // husky.add(
  //   join(rootPath, '.husky/pre-commit'),
  //   '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\nnpm run lint\n'
  // )
  add(
    join(rootPath, '.husky/commit-msg'),
    'npx --no -- commitlint --edit "$1"'
  );
}

main();
