const { runCommand } = require('../utils/runCommand');
const { cleanFiles } = require('../../config/clean.config.cjs');

function main() {
  const files = cleanFiles.join(' ');
  runCommand(`rimraf ${files}`);
  console.log('Clean successfully', files);
}

main();
