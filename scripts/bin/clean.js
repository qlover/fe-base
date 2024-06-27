import { Logger } from '../lib/logger.js';
import { Shell } from '../lib/shell.js';

const cleanFiles = [
  'dist',
  'node_modules',
  'yarn.lock',
  'package-lock.json',
  '.eslintcache',
  '*.log'
];

function main() {
  const log = new Logger();
  const shell = new Shell();
  const files = cleanFiles.join(' ');
  shell.exec(`rimraf ${files}`);
  log.success('Clean successfully', files);
}

main();
