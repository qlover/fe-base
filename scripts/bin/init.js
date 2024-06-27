const {
  checkDependencyInstalled,
  getDependencyVersion
} = require('../utils/dependency');
const { Logger } = require('../lib/logger.js');
const { Shell } = require('../lib/shell');

const log = new Logger();
const shell = new Shell();

function checkYarn() {
  const hasYarn = checkDependencyInstalled('yarn', true);
  if (!hasYarn.global) {
    log.log(`No Yarn found in the global environment, installing yarn`);
    shell.exec('npm i -g yarn');
  }
  const version = getDependencyVersion('yarn');
  log.log('Yarn version is: ', version.version);
}

function checkWithInstall(packageName) {
  const hasDeep = checkDependencyInstalled(packageName, true);
  if (!(hasDeep.local || hasDeep.global)) {
    log.log(hasDeep);
    log.log(`${packageName} not found, installing ${packageName}`);
    shell.exec(`npm i -g ${packageName}`);
  }
  const version = getDependencyVersion(packageName);
  log.log(`${packageName} version is: `, version.version);
}

function main() {
  log.log(`Current Node.js version is: ${process.version}`);

  // check yarn
  checkYarn();

  // check rimraf
  checkWithInstall('rimraf');

  // run clean bin
  require('./clean');

  shell.exec('yarn --ignore-workspace-root-check');

  log.log('Initialized successfully');
}

main();
