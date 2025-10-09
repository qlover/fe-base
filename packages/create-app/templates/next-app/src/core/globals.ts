import 'reflect-metadata';

// ! global variables, don't import any dependencies and don't have side effects
import { ColorFormatter, ConsoleHandler, Logger } from '@qlover/corekit-bridge';
import { JSONSerializer } from '@qlover/fe-corekit';
import { AppConfig } from '@/base/cases/AppConfig';
import { DialogHandler } from '@/base/cases/DialogHandler';
import { loggerStyles } from '@config/common';

export const appConfig = new AppConfig();

export const dialogHandler = new DialogHandler();

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
