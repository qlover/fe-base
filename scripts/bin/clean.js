import { cleanFiles } from '../config.js';
import { Logger } from '../lib/logger.js';
import { Shell } from '../lib/shell.js';

function main() {
  const log = new Logger();
  const shell = new Shell();
  const files = cleanFiles.join(' ');
  shell.exec(`rimraf ${files}`);
  log.success('Clean successfully', files);
}

main();
