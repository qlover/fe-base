const { join } = require('path');
const { rootPath } = require('../../config/path.config.cjs');
const { bootstrap } = require('commitizen/dist/cli/git-cz');
const { Shell } = require('../lib/shell.js');

function main() {
  const shell = new Shell();
  // git add
  shell.exec('git add .');

  // cz
  // https://www.npmjs.com/package/commitizen#Commitizen for multi-repo projects
  bootstrap({
    cliPath: join(rootPath, 'node_modules/commitizen'),
    config: {
      path: join(rootPath, 'node_modules/cz-conventional-changelog')
    }
  });
}

main();
