const { join } = require('path');
const { install, add } = require('husky');
const { rootPath } = require('../../config/path.config.cjs');
const { devDependencies, dependencies } = require('../../package.json');
const { Shell } = require('../lib/shell.js');

function main() {
  const shell = new Shell();
  shell.exec(`npx rimraf ${rootPath}/.husky`);

  if (
    !(
      devDependencies['cz-conventional-changelog'] ||
      dependencies['cz-conventional-changelog']
    )
  ) {
    shell.exec(
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
