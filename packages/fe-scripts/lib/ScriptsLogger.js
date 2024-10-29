import { Logger } from '@qlover/fe-utils';
import chalk from 'chalk';

export class ScriptsLogger extends Logger {
  prefix(value) {
    switch (value) {
      case 'INFO':
        return chalk.blue(value);
      case 'WARN':
        return chalk.yellow(value);
      case 'ERROR':
        return chalk.red(value);
      case 'DEBUG':
        return chalk.green(value);
      default:
        return value;
    }
  }
}
