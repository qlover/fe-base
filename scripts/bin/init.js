import { checkWithInstall, checkYarn } from '../utils/dependency.js';
import { Logger } from '../lib/logger.js';
import { Shell } from '../lib/shell.js';

const log = new Logger();
const shell = new Shell();

async function main() {
  log.log(`Current Node.js version is: ${process.version}`);

  // check yarn
  await checkYarn();

  // check rimraf
  await checkWithInstall('rimraf');

  // run clean bin
  await import('./clean.js');

  await shell.exec('yarn --ignore-workspace-root-check');

  log.success('Initialized successfully');
}

main();
