const bootstrap = require('commitizen/dist/cli/git-cz').bootstrap;
const { join } = require('path');
const { rootPath } = require('../../config/path.config.cjs');
const { execSync } = require('child_process');

/**
 * 提交代码 git + cz
 */
function main() {
  // git add
  execSync('git add .');

  // cz
  // https://www.npmjs.com/package/commitizen#Commitizen for multi-repo projects
  bootstrap({
    cliPath: join(rootPath, 'node_modules/commitizen'),
    config: {
      path: join(rootPath, 'node_modules/cz-conventional-changelog')
    }
  });

  //   resovle()
  // }).then(() => {
  //   // release-it
  //   execSync('node ' + join(rootPath, 'node_modules/release-it/bin/release-it'))
  // })
}

main();
