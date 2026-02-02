import { ReactSeedConfig } from './impls/ReactSeedConfig';
import {
  ConsoleHandler,
  Logger,
  TimestampFormatter,
  type TimestampFormatterOptions
} from '@qlover/logger';

export const seedConfig = new ReactSeedConfig();

export const logger = new Logger({
  handlers: new ConsoleHandler(
    new TimestampFormatter({
      localeOptions:
        // 本地电脑的时间格式
        Intl.DateTimeFormat().resolvedOptions() as TimestampFormatterOptions['localeOptions']
    })
  ),
  name: seedConfig.name,
  silent: seedConfig.isProduction,
  level: 'debug'
});
