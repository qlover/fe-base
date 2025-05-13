import { Logger } from '@qlover/logger';
import { ColorFormatter, ColorSegment } from './ColorFormatter';

export type LogLevel = 'LOG' | 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';

/**
 * ColorLogger is a logger that uses color to log messages.
 *
 * @example
 * ```ts
 * const logger = new ColorLogger();
 *
 * // 基本用法
 * logger.debug('Hello, world!');
 *
 * // 使用颜色片段
 * logger.debug('这是%c红色%c和%c蓝色%c的文字', 'color: red', 'color: inherit', 'color: blue', 'color: inherit');
 *
 * // 使用颜色片段数组
 * logger.debug('Hello World', [
 *   { text: 'Hello', style: { color: 'red' } },
 *   { text: ' World', style: { color: 'blue' } }
 * ]);
 * ```
 */
export class ColorLogger extends Logger {
  private colorsMaps: Record<string, string>;
  private formatter: ColorFormatter;
  protected isSilent: boolean;

  constructor(args: {
    isCI?: boolean | undefined;
    dryRun?: boolean | undefined;
    debug?: boolean | undefined;
    silent?: boolean | undefined;
    colorsMaps: Record<string, string>;
  }) {
    super(args);
    this.colorsMaps = args.colorsMaps;
    this.formatter = new ColorFormatter();
    this.isSilent = args.silent || false;
  }

  /**
   * 将颜色映射转换为颜色片段
   */
  private createColorSegment(text: string, level: LogLevel): ColorSegment {
    return {
      text,
      style: {
        color: this.colorsMaps[level] || 'inherit'
      }
    };
  }

  /**
   * @override
   */
  protected print(level: string, args: unknown[]): void {
    if (this.isSilent) {
      return;
    }

    const formattedArgs = this.formatter.format({
      level,
      args,
      loggerName: this.constructor.name,
      timestamp: Date.now()
    });

    console.log(...formattedArgs);
  }

  /**
   * @override
   */
  log(...args: unknown[]): void {
    this.print('LOG', args);
  }

  /**
   * @override
   */
  info(...args: unknown[]): void {
    this.print('INFO', args);
  }

  /**
   * @override
   */
  error(...args: unknown[]): void {
    this.print('ERROR', args);
  }

  /**
   * @override
   */
  warn(...args: unknown[]): void {
    this.print('WARN', args);
  }

  /**
   * @override
   */
  debug(...args: unknown[]): void {
    this.print('DEBUG', args);
  }
}
