import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import type { LoggerInterface } from '@qlover/logger';

export type ServerLoggerConfig = {
  logPrefixTemplate: string;
  logLevel: string;
};

export function createLogger(
  name: string,
  config: ServerLoggerConfig
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
