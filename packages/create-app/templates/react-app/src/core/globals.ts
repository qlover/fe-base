// ! global variables, don't import any dependencies and don't have side effects
import {
  Base64Serializer,
  JSONSerializer,
  ObjectStorage,
  SyncStorage,
  SyncStorageInterface
} from '@qlover/fe-corekit';
import {
  ColorFormatter,
  ConsoleHandler,
  CookieStorage,
  Logger
} from '@qlover/corekit-bridge';
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
 * Override localStorage to use the global local storage
 */
export const localStorage = new SyncStorage(new ObjectStorage(), [
  JSON,
  new Base64Serializer(),
  window.localStorage as unknown as SyncStorageInterface<string>
]);

export const localStorageEncrypt = localStorage;

export const cookieStorage = new CookieStorage();
