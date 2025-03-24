// ! global variables, don't import any dependencies and don't have side effects
import { JSONStorage, JSONSerializer, SyncStorage } from '@qlover/fe-corekit';
import { ColorLogger } from '@qlover/fe-prod/core/color-log';
import { loggerStyles } from '@config/common';

const isProduction = import.meta.env.VITE_USER_NODE_ENV === 'production';

/**
 * Global logger
 */
export const logger = new ColorLogger({
  silent: isProduction,
  debug: !isProduction,
  colorsMaps: loggerStyles
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
