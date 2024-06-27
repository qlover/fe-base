import { cleanFiles } from '../config.js';
import { Logger } from '../lib/logger.js';
import { Shell } from '../lib/Shell.js';

function main() {
  const log = new Logger();
  const shell = new Shell();
  const files = cleanFiles.join(' ');
  shell.exec(`rimraf test.txt`);
  log.success('Clean successfully', files);
}

main();
