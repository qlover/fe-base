const { runCommand } = require('../utils/runCommand');
const {
  checkDependencyInstalled,
  getDependencyVersion
} = require('../utils/dependency');

function checkYarn() {
  const hasYarn = checkDependencyInstalled('yarn', true);
  if (!hasYarn.global) {
    console.log(`No Yarn found in the global environment, installing yarn`);
    runCommand('npm i -g yarn');
  }
  const version = getDependencyVersion('yarn');
  console.log('Yarn version is: ', version.version);
}

function checkWithInstall(packageName) {
  const hasDeep = checkDependencyInstalled(packageName, true);
  if (!(hasDeep.local || hasDeep.global)) {
    console.log(hasDeep);
    console.log(`${packageName} not found, installing ${packageName}`);
    runCommand(`npm i -g ${packageName}`);
  }
  const version = getDependencyVersion(packageName);
  console.log(`${packageName} version is: `, version.version);
}

function main() {
  console.log(`Current Node.js version is: ${process.version}`);

  // check yarn
  checkYarn();

  // check rimraf
  checkWithInstall('rimraf');

  // run clean bin
  require('./clean');

  runCommand('yarn --ignore-workspace-root-check');

  console.log('Initialized successfully');
}

main();
