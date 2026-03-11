import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import type {
  LoggerInterface,
  TimestampFormatterOptions
} from '@qlover/logger';
import { ReactSeedConfig } from './ReactSeedConfig';

export const seedConfig = new ReactSeedConfig();

export const logger: LoggerInterface = new Logger({
  handlers: new ConsoleHandler(
    new TimestampFormatter({
      localeOptions:
        // 本地电脑的时间格式
        Intl.DateTimeFormat().resolvedOptions() as TimestampFormatterOptions['localeOptions']
    })
  ),
  name: seedConfig.name,
  silent: seedConfig.isProduction,
  level: seedConfig.logLevel
});
