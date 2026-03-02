import { ConsoleHandler, Logger, TimestampFormatter } from '@qlover/logger';
import { ServerConfig } from './ServerConfig';

export const serverConfig = new ServerConfig();

export const logger = new Logger({
  name: 'next-app-server',
  handlers: new ConsoleHandler(
    new TimestampFormatter({
      localeOptions: {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }
    })
  ),
  silent: false,
  level: serverConfig.logLevel
});
