// ! global variables, don't import any dependencies and don't have side effects
import { JSONStorage, JSONSerializer, SyncStorage } from '@qlover/fe-corekit';
import { ColorFormatter, ConsoleHandler, Logger } from '@qlover/corekit-bridge';
import { DialogHandler } from '@/base/cases/DialogHandler';
import { loggerStyles } from '@config/common';
import { AppConfig } from '@/base/cases/AppConfig';

const isProduction = import.meta.env.VITE_USER_NODE_ENV === 'production';

export const appConfig = new AppConfig();

export const dialogHandler = new DialogHandler();

/**
 * Global logger
 */
export const logger = new Logger({
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: isProduction,
  level: 'debug'
});

/**
 * Override JSONSerializer to use the global logger
 */
export const JSON = new JSONSerializer();

/**
 * Override JSONStorage to use the global local storage
 */
export const localJsonStorage = new JSONStorage(
  localStorage as SyncStorage<string, string>,
  JSON
);
