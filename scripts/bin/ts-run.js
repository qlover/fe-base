import { program } from 'commander';
import { join } from 'path';
import { rootPath } from '../../config/path.config.cjs';
import { exec } from 'child_process';

program.option('-p, --path', 'run script path');

program.parse();

async function main() {
  const path = program.args[0];

  if (!path) {
    console.log('path is undefined');
    return;
  }

  const scriptPath = join(rootPath, path);
  // FIXME: (node:93152) ExperimentalWarning: --experimental-loader may be removed in the future; instead use register():
  const scriptCMD = `node --loader ts-node/esm ${scriptPath}`;

  exec(scriptCMD, (error, stdout, stderr) => {
    if (error) {
      console.log('[Error]', error);
    } else {
      console.log(stdout);
    }
  });
}

main();
