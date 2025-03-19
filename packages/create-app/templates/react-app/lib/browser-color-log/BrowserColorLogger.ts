import { Logger, LogLevel } from '@qlover/fe-utils';

/**
 * BrowserColorLogger is a logger that uses color to log messages.
 *
 * @example
 * ```ts
 * const logger = new BrowserColorLogger();
 * logger.debug('Hello, world!');
 *
 * //=> Hello, world!
 *
 * logger.debug('Hi %cHello%c world', 'color: red;', 'all: unset;');
 * //=> Hi Hello（red） world
 * ```
 */
export class BrowserColorLogger extends Logger {
  private colorsMaps: Record<LogLevel, string>;

  constructor(args: {
    isCI?: boolean | undefined;
    dryRun?: boolean | undefined;
    debug?: boolean | undefined;
    silent?: boolean | undefined;
    colorsMaps: Record<LogLevel, string>;
  }) {
    super(args);
    this.colorsMaps = args.colorsMaps;
  }

  static wrap(value: string): string {
    return value ? `%c${value}%c` : '';
  }

  /**
   * @override
   * @param level
   * @param prefix
   * @param args
   */
  print(level: LogLevel, prefix: string, ...args: unknown[]): void {
    if (this.isSilent) {
      return;
    }

    const prefixColor = this.colorsMaps[level];
    const [firstString, ...strings] = args;
    prefix = prefixColor ? prefix : '';

    const head =
      typeof firstString === 'string'
        ? [BrowserColorLogger.wrap(prefix), firstString].join(' ')
        : prefix;

    const prefixColrs = prefixColor ? [prefixColor, 'all: unset;'] : [];

    console.log(head, ...prefixColrs, ...strings);
  }

  /**
   * @override
   * @param args
   */
  log(...args: unknown[]): void {
    this.print('LOG', '', ...args);
  }
}
