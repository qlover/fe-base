import { first, last, isObject, isString, isArray } from 'lodash-es';

export const LEVELS = {
  LOG: 'LOG',
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARN: 'WARN',
  DEBUG: 'DEBUG'
} as const;

export type LogLevel = (typeof LEVELS)[keyof typeof LEVELS];
export type LogArgument = unknown;

export type ExecOptions = {
  isDryRun?: boolean;
  isExternal?: boolean;
};

export class Logger {
  protected isCI: boolean;
  protected isDryRun: boolean;
  protected isDebug: boolean;
  protected isSilent: boolean;

  constructor({
    isCI = false,
    dryRun = false,
    debug = false,
    silent = false
  } = {}) {
    this.isCI = isCI;
    this.isDryRun = dryRun;
    this.isDebug = debug;
    this.isSilent = silent;
  }

  /**
   * Basic logging methods.
   * @param {LogLevel} level it can be any string, inner use `LEVELS`
   * @param  {...LogArgument} args
   */
  protected print(level: LogLevel, ...args: LogArgument[]): void {
    if (!this.isSilent) {
      console.log(...args);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prefix(value: string, _level: LogLevel): string | string[] {
    return value;
  }

  log(...args: LogArgument[]): void {
    this.print(LEVELS.LOG, ...args);
  }

  info(...args: LogArgument[]): void {
    this.print(LEVELS.INFO, this.prefix('INFO', LEVELS.INFO), ...args);
  }

  warn(...args: LogArgument[]): void {
    this.print(LEVELS.WARN, this.prefix('WARNING', LEVELS.WARN), ...args);
  }

  error(...args: LogArgument[]): void {
    this.print(LEVELS.ERROR, this.prefix('ERROR', LEVELS.ERROR), ...args);
  }

  debug(...args: LogArgument[]): void {
    if (this.isDebug) {
      const firstArg = first(args);
      const firstValue = isObject(firstArg)
        ? JSON.stringify(firstArg)
        : String(firstArg);

      this.print(
        LEVELS.DEBUG,
        this.prefix('DEBUG', LEVELS.DEBUG),
        firstValue,
        ...args.slice(1)
      );
    }
  }

  verbose(...args: LogArgument[]): void {
    if (this.isDebug) {
      // use purple color
      this.print(LEVELS.DEBUG, ...args);
    }
  }

  exec(...args: (LogArgument | ExecOptions)[]): void {
    const lastArg = last(args);
    const { isDryRun, isExternal: isExecutedInDryRun } = (
      isObject(lastArg) ? lastArg : {}
    ) as ExecOptions;
    if (isDryRun || this.isDryRun || isExecutedInDryRun) {
      const prefix = isExecutedInDryRun == null ? '$' : '!';
      const command = args
        .slice(0, -1)
        .map((cmd) =>
          isString(cmd) ? cmd : isArray(cmd) ? cmd.join(' ') : String(cmd)
        )
        .join(' ');
      const message = [prefix, command].join(' ').trim();
      this.log(message);
    }
  }

  obtrusive(...args: LogArgument[]): void {
    if (!this.isCI) this.log();
    this.log(...args);
    if (!this.isCI) this.log();
  }
}
