import type { FormatterInterface } from './interface/FormatterInterface';
import { LogEvent } from './interface/LogEvent';

export type DateFormatType = 'date' | 'time' | 'datetime';

export interface TimestampFormatterContext {
  /**
   * The format type to use for the timestamp.
   * @default 'datetime'
   */
  formatType?: DateFormatType;
}

export type TimestampFormatterOptions = {
  /**
   * The locale to use for the timestamp.
   * @default 'zh-CN'
   */
  locale?: string;

  /**
   * The template to use for the prefix.
   *
   * support variables:
   * - timestamp
   * - formattedTimestamp
   * - level
   * - loggerName
   * - locale
   * - TimestampFormatterContext
   *
   * @default '[{formattedTimestamp} {level}]'
   */
  prefixTemplate?: string;

  localeOptions?: Intl.DateTimeFormatOptions;
};

const defaultLocaleOptions: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
  timeZone: 'UTC'
};

export class TimestampFormatter implements FormatterInterface {
  constructor(protected readonly options: TimestampFormatterOptions = {}) {}

  protected replacePrefix(
    template: string,
    vars: Record<string, string>
  ): string {
    return template.replace(/\{([^{}]+)\}/g, (match, p1) => vars[p1] || match);
  }

  format({ timestamp, level, args, context, loggerName }: LogEvent): unknown[] {
    const {
      locale = 'zh-CN',
      localeOptions,
      prefixTemplate = '[{formattedTimestamp} {level}]'
    } = this.options;

    const formatType =
      (context as TimestampFormatterContext)?.formatType ?? 'datetime';

    const dateFormatMethod =
      formatType === 'date'
        ? 'toLocaleDateString'
        : formatType === 'time'
          ? 'toLocaleTimeString'
          : 'toLocaleString';

    const formattedTimestamp = new Date(timestamp)[dateFormatMethod](locale, {
      ...defaultLocaleOptions,
      ...localeOptions
    });

    return [
      this.replacePrefix(prefixTemplate, {
        ...(context as TimestampFormatterContext),
        timestamp: timestamp.toString(),
        level,
        loggerName,
        formattedTimestamp,
        locale
      }),
      ...args
    ];
  }
}
