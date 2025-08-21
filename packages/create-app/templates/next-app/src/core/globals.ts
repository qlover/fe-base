// ! global variables, don't import any dependencies and don't have side effects
import { JSONSerializer } from '@qlover/fe-corekit';
import { ColorFormatter, ConsoleHandler, Logger } from '@qlover/corekit-bridge';
import { loggerStyles } from '@config/common';
import { AppConfig } from '@/base/cases/AppConfig';

export const appConfig = new AppConfig();

/**
 * Global logger
 */
export const logger = new Logger({
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: false,
  level: 'debug'
});

/**
 * Override JSONSerializer to use the global logger
 */
export const JSON = new JSONSerializer();
