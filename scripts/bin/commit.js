import { join } from 'path';
import { rootPath } from '../../config/path.config.cjs';
import { bootstrap } from 'commitizen/dist/cli/git-cz.js';
import { Shell } from '../lib/shell.js';

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
