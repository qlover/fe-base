import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import type { SeedServerConfigInterface } from '@interfaces/SeedConfigInterface';
import type { LoggerInterface } from '@qlover/logger';

export function createLogger(
  name: string,
  config: SeedServerConfigInterface
): LoggerInterface {
  const formater = new TimestampFormatter({
    prefixTemplate: config.logPrefixTemplate,
    localeOptions:
      Intl.DateTimeFormat().resolvedOptions() as Intl.DateTimeFormatOptions
  });
  return new Logger({
    name: name,
    handlers: new ConsoleHandler(formater),
    silent: false,
    level: config.logLevel
  });
}
