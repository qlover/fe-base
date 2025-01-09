import * as feGlobals from '@/container/globals';

declare global {
  interface Window {
    feGlobals: typeof feGlobals;
  }
}
