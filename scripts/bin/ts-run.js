const { program } = require('commander');
const { join } = require('path');
const { rootPath } = require('../../config/path.config.cjs');
const { exec } = require('child_process');

program.option('-p, --path', 'run script path');

program.parse();

function main() {
  const path = program.args[0];

  if (!path) {
    console.log('path is undefined');
    return;
  }

  const scriptPath = join(rootPath, path);
  const scriptCMD = `ts-node-esm ${scriptPath}`;

  // console.log('script path is', scriptPath)

  exec(scriptCMD, (error, stdout, stderr) => {
    if (error) {
      console.log('[Error]', error);
    } else {
      console.log('[Success]');
      console.log(stdout);
    }
  });
}

main();
