import * as feGlobals from '@/core/globals';

declare global {
  interface Window {
    feGlobals: Readonly<typeof feGlobals>;
  }
}
