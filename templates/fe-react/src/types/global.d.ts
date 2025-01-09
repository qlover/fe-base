import * as feGlobals from '@/containers/globals';

declare global {
  interface Window {
    feGlobals: Readonly<typeof feGlobals>;
  }
}
