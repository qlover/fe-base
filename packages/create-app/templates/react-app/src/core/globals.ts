// ! global variables, don't import any dependencies and don't have side effects
import { JSONStorage, JSONSerializer, SyncStorage } from '@qlover/fe-utils';
import { BrowserColorLogger } from '@lib/browser-color-log';

const isProduction = import.meta.env.VITE_USER_NODE_ENV === 'production';

/**
 * Global logger
 */
export const logger = new BrowserColorLogger({
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
