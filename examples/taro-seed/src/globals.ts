import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import { SeedConfig } from './impls/SeedConfig';
import type {
  LoggerInterface,
  TimestampFormatterOptions
} from '@qlover/logger';

export const seedConfig = new SeedConfig();

/** 获取日志时间戳的 locale 选项；微信小程序等环境无 Intl，使用安全 fallback */
function getTimestampLocaleOptions(): TimestampFormatterOptions['localeOptions'] {
  if (
    typeof Intl !== 'undefined' &&
    typeof Intl.DateTimeFormat === 'function'
  ) {
    return Intl.DateTimeFormat().resolvedOptions() as TimestampFormatterOptions['localeOptions'];
  }
  return {
    locale: 'zh-CN',
    timeZone: undefined
  } as TimestampFormatterOptions['localeOptions'];
}

export const logger: LoggerInterface = new Logger({
  handlers: new ConsoleHandler(
    new TimestampFormatter({
      localeOptions: getTimestampLocaleOptions()
    })
  ),
  name: 'taro-seed',
  silent: false,
  level: 'debug'
});
