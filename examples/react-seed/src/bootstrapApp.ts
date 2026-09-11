import { IOC } from './globals';
import { BootstrapClient } from './impls/BootstrapClient';
import { IOCIdentifierRegister } from './impls/IOCIdentifierRegister';

/**
 * Start client bootstrap against the browser window.
 * No-ops when `window` is unavailable (e.g. late async work after jsdom teardown).
 */
export function bootstrapApp() {
  if (typeof globalThis.window === 'undefined') {
    return Promise.resolve();
  }

  return new BootstrapClient(IOC).startup(window, IOCIdentifierRegister);
}
