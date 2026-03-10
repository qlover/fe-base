// ! global variables, don't import any dependencies and don't have side effects
import { ColorFormatter } from '@qlover/corekit-bridge';
import { JSONSerializer } from '@qlover/fe-corekit';
import { Logger, ConsoleHandler } from '@qlover/logger';
import { AppConfig } from '@/impls/AppConfig';
import { DialogHandler } from '@/impls/DialogHandler';
import { loggerStyles } from '@config/common';

export const appConfig = new AppConfig();

export const dialogHandler = new DialogHandler();

/**
 * Global logger
 */
export const logger = new Logger({
  name: 'next-seed',
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: appConfig.isProduction,
  level: appConfig.logLevel
});

/**
 * Override JSONSerializer to use the global logger
 */
export const JSON = new JSONSerializer();
