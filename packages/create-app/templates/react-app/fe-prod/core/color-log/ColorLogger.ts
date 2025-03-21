import { Logger, LogLevel } from '@qlover/fe-corekit';

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
export class ColorLogger extends Logger {
  private colorsMaps: Record<string, string>;

  constructor(args: {
    isCI?: boolean | undefined;
    dryRun?: boolean | undefined;
    debug?: boolean | undefined;
    silent?: boolean | undefined;
    colorsMaps: Record<string, string>;
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
    prefix = prefixColor ? prefix : '';

    let head = args[0] as string;
    let colors: string[] = [];
    if (typeof head === 'string') {
      head = prefix
        ? [ColorLogger.wrap(prefix), args[0]].join(' ')
        : head;
      colors = prefixColor ? [prefixColor, 'all: unset;'] : [];
    }

    if (head) {
      console.log(head, ...colors, ...args.slice(1));
      return;
    }
    console.log(...args);
  }

  /**
   * @override
   * @param args
   */
  log(...args: unknown[]): void {
    this.print('LOG', '', ...args);
  }
}
