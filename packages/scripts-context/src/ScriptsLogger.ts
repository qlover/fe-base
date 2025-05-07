import { type FormatterInterface, type LogEvent, Logger } from '@qlover/logger';
import chalk from 'chalk';

export class ColorFormatter implements FormatterInterface {
  constructor(
    protected levelColors: Record<
      string,
      string | ((...args: unknown[]) => string)
    > = {
      fatal: chalk.bgRed.white.bold,
      error: chalk.red.bold,
      warn: chalk.yellow.bold,
      info: chalk.blue,
      debug: chalk.green,
      trace: chalk.gray,
      log: chalk.white
    }
  ) {}

  format(event: LogEvent): unknown[] {
    const { level, args } = event;

    // Apply the appropriate color function to the level
    const colorFunction =
      this.levelColors[level as keyof typeof this.levelColors] || chalk.white;

    const coloredLevel =
      typeof colorFunction === 'function'
        ? colorFunction(level.toUpperCase())
        : level.toUpperCase();

    // Return the colored level followed by the original arguments
    return [coloredLevel, ...args];
  }
}

export class ScriptsLogger extends Logger {
  obtrusive(title: string): void {
    const header = chalk.bold(title);

    this.log();
    this.log(header);
    this.log();
  }
}
