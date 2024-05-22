const { join } = require('path');
const husky = require('husky');
const { execSync } = require('child_process');
const { rootPath } = require('../../config/path.config.cjs');
const pkg = require('../../package.json');

function main() {
  execSync(`npx rimraf ${rootPath}/.husky`);

  if (
    !(
      pkg.devDependencies['cz-conventional-changelog'] ||
      pkg.dependencies['cz-conventional-changelog']
    )
  ) {
    execSync(
      'npx commitizen init cz-conventional-changelog --save-dev --save-exact'
    );
  }

  husky.install();
  // husky.add(
  //   join(rootPath, '.husky/pre-commit'),
  //   '#!/bin/sh\n. "$(dirname "$0")/_/husky.sh"\nnpm run lint\n'
  // )
  husky.add(
    join(rootPath, '.husky/commit-msg'),
    'npx --no -- commitlint --edit "$1"'
  );
}

main();
