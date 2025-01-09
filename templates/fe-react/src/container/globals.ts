import {
  JSONStorage,
  JSONSerializer,
  Logger,
  SyncStorage
} from '@qlover/fe-utils';

const isProduction = import.meta.env.NODE_ENV === 'production';

/**
 * Global logger
 */
export const logger = new Logger({
  silent: isProduction,
  debug: !isProduction
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
