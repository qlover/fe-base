// ! global variables, don't import any dependencies and don't have side effects
import { loggerStyles } from '@config/common';
import { ColorFormatter, CookieStorage } from '@qlover/corekit-bridge';
import { Logger, ConsoleHandler } from '@qlover/logger';
import {
  Base64Serializer,
  JSONSerializer,
  ObjectStorage,
  SyncStorage
} from '@qlover/fe-corekit';
import { AppConfig } from '@/base/cases/AppConfig';
import { DialogHandler } from '@/base/cases/DialogHandler';
import type { SyncStorageInterface } from '@qlover/fe-corekit';

export const appConfig = new AppConfig();

export const dialogHandler = new DialogHandler();

/**
 * Global logger
 */
export const logger = new Logger({
  handlers: new ConsoleHandler(new ColorFormatter(loggerStyles)),
  silent: appConfig.isProduction,
  level: 'debug'
});

/**
 * Override JSONSerializer to use the global logger
 */
export const JSON = new JSONSerializer();

/**
 * Override localStorage to use the global local storage
 */
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  appConfig.isProduction ? new Base64Serializer() : undefined,
  window.localStorage as unknown as SyncStorageInterface<string>
].filter(Boolean) as any[]);

export const localStorageEncrypt = localStorage;

export const cookieStorage = new CookieStorage();
