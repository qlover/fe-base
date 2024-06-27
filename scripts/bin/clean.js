const { cleanFiles } = require('../../config/clean.config.cjs');
const { Logger } = require('../lib/logger.js');
const { Shell } = require('../lib/Shell.js');

function main() {
  const log = new Logger();
  const shell = new Shell();
  const files = cleanFiles.join(' ');
  shell.runCommand(`rimraf ${files}`);
  log.log('Clean successfully', files);
}

main();
